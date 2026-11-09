import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=process.cwd(), action=process.argv[2]||'prepare', ap=resolve(process.argv[3]||'../../当下/agent-platform');
const config=JSON.parse(readFileSync(join(root,'local-gateway/pricing.json'),'utf8'));
const dir=join(root,'local-gateway/.local/pricing-cny-20261109');mkdirSync(dir,{recursive:true});
const literal=v=>"'"+String(v).replaceAll("'","''")+"'";
const query=sql=>execFileSync('docker',['exec','-i','llm-gateway-db-1','psql','-v','ON_ERROR_STOP=1','-U','litellm','-d','litellm','-At'],{input:sql,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024}).trim();
const rows=table=>query(`SELECT row_to_json(t) FROM "${table}" t;`).split('\n').filter(Boolean).map(JSON.parse);
const round=n=>Math.round(n*1e12)/1e12;
function prices(name){const {deployment_id,...rates}=config.models[name];return rates;}
async function api(path,body,method=body?'POST':'GET'){
  const env=readFileSync(join(root,'local-gateway/.env'),'utf8');const master=env.match(/^LITELLM_MASTER_KEY=(.+)$/m)?.[1].trim().replace(/^"|"$/g,'');assert.ok(master);
  const response=await fetch('http://127.0.0.1:4000'+path,{method,headers:{Authorization:'Bearer '+master,'content-type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
  if(!response.ok){await response.body?.cancel();throw Error(`${method} ${path} failed: ${response.status}`);}return response.json();
}
function checkedImages(){
  const counts=new Map();
  for(const path of ['.local/litellm-live/evidence.json','.local/litellm-live-dimensions/evidence.json']){
    const file=join(ap,path);if(!existsSync(file))continue;
    for(const result of JSON.parse(readFileSync(file,'utf8')).results||[]){if(result.kind!=='image'||result.status!=='complete')continue;for(const receipt of result.receipts||[]){const op=result.operations?.find(o=>o.id===receipt.operationId);if(op?.remoteOutcome==='success'&&Number.isInteger(op.receivedImageCount))counts.set(receipt.gateway.gatewayCallId,op.receivedImageCount);}}
  }return counts;
}
function calculate(row,verified){
  const metadata=row.metadata||{},additional=metadata.additional_usage_values||{};
  if(row.status!=='success')return {status:'not_billed',spend:0,input:0,output:0,cached:0,savings:0};
  assert.ok(config.models[row.model_group],'Unknown priced model in ledger');
  const p=prices(row.model_group);
  if(row.model_group==='image-01'){
    const count=additional.generated_images??verified.get(row.litellm_call_id);
    if(!Number.isInteger(count)||count<0)return {status:'unconfirmed',spend:0,input:0,output:0,cached:0,savings:0};
    return {status:'recalculated',spend:round(count*p.output_cost_per_image),input:0,output:round(count*p.output_cost_per_image),cached:0,savings:0,images:count};
  }
  const cached=Number(additional.cache_read_input_tokens??additional.prompt_tokens_details?.cached_tokens??0);
  assert.ok(cached<=row.prompt_tokens&&cached>=0);
  const threshold=row.model_group==='MiniMax-M3'&&row.prompt_tokens>512000?'_above_512k_tokens':'';
  const tier=metadata.cost_breakdown?.service_tier=== 'priority'?'_priority':'';
  const inputRate=p['input_cost_per_token'+threshold+tier],outputRate=p['output_cost_per_token'+threshold+tier],cacheRate=p['cache_read_input_token_cost'+threshold+tier];
  assert.ok(Number.isFinite(inputRate)&&Number.isFinite(outputRate)&&Number.isFinite(cacheRate));
  const input=round((row.prompt_tokens-cached)*inputRate+cached*cacheRate),output=round(row.completion_tokens*outputRate);
  return {status:'recalculated',spend:round(input+output),input,output,cached:round(cached*cacheRate),savings:round(cached*(inputRate-cacheRate))};
}
try{
  if(action==='prepare'){
    const models=(await api('/model/info')).data;
    assert.equal(models.length,Object.keys(config.models).length,'Unexpected deployment outside CNY migration');
    for(const name of Object.keys(config.models))assert.ok(models.some(m=>m.model_name===name&&m.model_info.id===config.models[name].deployment_id));
    if(!existsSync(join(dir,'models.before.json')))writeFileSync(join(dir,'models.before.json'),JSON.stringify(models.map(m=>({model_name:m.model_name,model_info:m.model_info})),null,2));
    if(!existsSync(join(dir,'database.before.dump'))){const dump=execFileSync('docker',['exec','llm-gateway-db-1','pg_dump','-U','litellm','-d','litellm','-Fc'],{windowsHide:true,maxBuffer:128*1024*1024});assert.equal(dump.subarray(0,5).toString(),'PGDMP');writeFileSync(join(dir,'database.before.dump'),dump);}
    const logs=rows('LiteLLM_SpendLogs'),verified=checkedImages();assert.ok(logs.length<=1000,'Unexpected large history');
    const plan=logs.map(r=>({id:r.litellm_call_id,model:r.model_group,oldSpend:r.spend,...calculate(r,verified)}));
    writeFileSync(join(dir,'plan.json'),JSON.stringify(plan,null,2));
    console.log(JSON.stringify({models:models.length,logs:logs.length,confirmedCny:round(plan.reduce((n,r)=>n+r.spend,0)),unconfirmed:plan.filter(r=>r.status==='unconfirmed').length,verifiedImages:verified.size}));
  }else if(action==='apply'){
    assert.ok(existsSync(join(dir,'database.before.dump')),'Prepare and back up first');
    const models=(await api('/model/info')).data;
    for(const [name,definition]of Object.entries(config.models)){
      const model=models.find(m=>m.model_name===name&&m.model_info.id===definition.deployment_id);assert.ok(model);
      await api(`/model/${definition.deployment_id}/update`,{litellm_params:prices(name),model_info:{pricing_currency:'CNY',pricing_version:config.version,pricing_source:config.source}},'PATCH');
    }
    const checked=(await api('/model/info')).data;
    for(const model of checked){assert.equal(model.model_info.pricing_currency,'CNY');for(const [field,value]of Object.entries(prices(model.model_name)))assert.equal(model.model_info[field],value,field);}
    console.log(JSON.stringify({configured:checked.map(m=>m.model_name),currency:'CNY'}));
  }else if(action==='backfill'){
    const running=execFileSync('docker',['inspect','--format','{{.State.Running}}','llm-gateway-gateway-1'],{encoding:'utf8',windowsHide:true}).trim();assert.equal(running,'false','Stop and drain gateway before history migration');
    const logs=rows('LiteLLM_SpendLogs');assert.ok(logs.length<=1000);
    if(logs.every(r=>r.metadata?.spend_logs_metadata?.billing_currency==='CNY')){console.log('History already in CNY; no changes');process.exit(0);}
    for(const table of ['LiteLLM_DailyOrganizationSpend','LiteLLM_DailyAgentSpend','LiteLLM_DailyEndUserSpend','LiteLLM_DailyToolSpend','LiteLLM_BudgetWindowSpend','LiteLLM_TeamTable','LiteLLM_OrganizationTable'])assert.equal(rows(table).length,0,`Unsupported nonempty aggregate ${table}`);
    const verified=checkedImages(),updated=logs.map(row=>{
      const c=calculate(row,verified),m=row.metadata||{},p=config.models[row.model_group]?prices(row.model_group):{};
      const metadata={...m,spend_logs_metadata:{...(m.spend_logs_metadata||{}),billing_currency:'CNY',pricing_version:config.version,pricing_status:c.status,pricing_source:config.source},pricing_migration:{old_spend:row.spend,old_currency:'USD-or-unpriced',version:config.version},cost_breakdown:c.status==='unconfirmed'?null:{...(m.cost_breakdown||{}),input_cost:c.input,output_cost:c.output,cache_read_cost:c.cached,total_cost:c.spend,original_cost:c.spend,currency:'CNY'},additional_usage_values:{...(m.additional_usage_values||{}),cost:c.spend,...(c.images!==undefined?{generated_images:c.images}:{})},model_map_information:{...(m.model_map_information||{}),...p,pricing_currency:'CNY'}};
      return {...row,metadata,spend:c.spend,confirmedCacheSavings:c.savings,oldSpend:row.spend,pricingStatus:c.status};
    });
    const dailyUser=rows('LiteLLM_DailyUserSpend'),dailyTeam=rows('LiteLLM_DailyTeamSpend'),dailyGlobal=rows('LiteLLM_DailyGlobalSpend'),keys=rows('LiteLLM_VerificationToken'),users=rows('LiteLLM_UserTable');
    writeFileSync(join(dir,'ledger.before.json'),JSON.stringify({logs,dailyUser,dailyTeam,dailyGlobal,keys,users}));
    const statements=['BEGIN;', 'LOCK TABLE "LiteLLM_SpendLogs","LiteLLM_DailyUserSpend","LiteLLM_DailyTeamSpend","LiteLLM_DailyGlobalSpend","LiteLLM_VerificationToken","LiteLLM_UserTable" IN SHARE ROW EXCLUSIVE MODE;'];
    for(const row of updated)statements.push(`UPDATE "LiteLLM_SpendLogs" SET spend=${row.spend},metadata=${literal(JSON.stringify(row.metadata))}::jsonb WHERE request_id=${literal(row.request_id)};`);
    const endpoints={'aimage_generation':'/image/generations','anthropic_messages':'','':'','/v1/models':''};
    function matches(row,bucket,entity){
      assert.ok(Object.hasOwn(endpoints,row.call_type||''),'Unreviewed call type in historical daily buckets');
      return row.startTime.slice(0,10)===bucket.date&&['model','model_group','custom_llm_provider','mcp_namespaced_tool_name'].every(k=>(row[k]||'')===(bucket[k]||''))&&endpoints[row.call_type||'']===(bucket.endpoint||'')&&(!entity||(row.api_key===bucket.api_key&&(row[entity==='user'?'user':'team_id']||'')===(bucket[entity+'_id']||'')));
    }
    for(const row of updated)for(const [buckets,entity]of [[dailyUser,'user'],[dailyTeam,'team']])assert.equal(buckets.filter(b=>matches(row,b,entity)).length,1,'Each historical log must match exactly one daily bucket');
    for(const [table,buckets,entity]of [['LiteLLM_DailyUserSpend',dailyUser,'user'],['LiteLLM_DailyTeamSpend',dailyTeam,'team'],['LiteLLM_DailyGlobalSpend',dailyGlobal,null]])for(const bucket of buckets){
      const selected=updated.filter(r=>matches(r,bucket,entity));
      assert.equal(selected.length,bucket.api_requests,`${table} request count did not match source logs`);
      assert.ok(Math.abs(selected.reduce((n,r)=>n+r.oldSpend,0)-bucket.spend)<1e-9,`${table} bucket did not match source log spend`);
      const total=round(selected.reduce((n,r)=>n+r.spend,0)),saving=round(selected.reduce((n,r)=>n+r.confirmedCacheSavings,0));
      statements.push(`UPDATE "${table}" SET spend=${total},prompt_caching_savings_spend=${saving},updated_at=now() WHERE id=${literal(bucket.id)};`);
    }
    for(const [table,entries,idField,select]of [['LiteLLM_VerificationToken',keys,'token',(r,e)=>r.api_key===e.token],['LiteLLM_UserTable',users,'user_id',(r,e)=>r.user===e.user_id]])for(const entry of entries){
      const selected=updated.filter(r=>select(r,entry));if(!selected.length)continue;
      assert.ok(entry.max_budget===null&&(!entry.model_max_budget||Object.keys(entry.model_max_budget).length===0),'Existing monetary budgets need explicit conversion');
      assert.ok(Math.abs(selected.reduce((n,r)=>n+r.oldSpend,0)-entry.spend)<1e-9,`${table} counter did not match source logs`);
      const total=round(selected.reduce((n,r)=>n+r.spend,0)),byModel={};for(const r of selected)if(r.model_group)byModel[r.model_group]=round((byModel[r.model_group]||0)+r.spend);
      statements.push(`UPDATE "${table}" SET spend=${total},${table==='LiteLLM_VerificationToken'?`total_spend=${total},`:''}model_spend=${literal(JSON.stringify(byModel))}::jsonb,metadata=coalesce(metadata,'{}'::jsonb)||'{"billing_currency":"CNY"}'::jsonb WHERE ${idField}=${literal(entry[idField])};`);
    }
    statements.push('COMMIT;');query(statements.join('\n'));
    const evidence={currency:'CNY',records:updated.length,confirmedTotal:round(updated.reduce((n,r)=>n+r.spend,0)),unconfirmed:updated.filter(r=>r.pricingStatus==='unconfirmed').map(r=>r.litellm_call_id)};
    writeFileSync(join(dir,'result.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
  }else throw Error('Use prepare, apply or backfill');
}catch(error){console.error(JSON.stringify({error:error.name,reason:error.message?.slice(0,220)}));process.exitCode=1;}
