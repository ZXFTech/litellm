(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,[434626,e=>{var t=e.i(271645);let a=t.forwardRef(function(e,a){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:2,stroke:"currentColor","aria-hidden":"true",ref:a},e),t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"}))});e.s(["f",0,a],434626)},546467,e=>{let t=(0,e.i(475254).f)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);e.s(["f",0,t])},778917,e=>{var t=e.i(546467);e.s(["f",()=>t.f])},306228,e=>{let t=(0,e.i(475254).f)("link-2",[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]]);e.s(["f",0,t],306228)},991799,897250,e=>{var t=e.i(475254);let a=(0,t.f)("moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);e.s(["f",0,a],991799);let s=(0,t.f)("sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);e.s(["f",0,s],897250)},972518,799647,e=>{var t=e.i(475254);let a=(0,t.f)("panel-left-close",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"m16 15-3-3 3-3",key:"14y99z"}]]);e.s(["f",0,a],972518);let s=(0,t.f)("panel-left-open",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"m14 9 3 3-3 3",key:"8010ee"}]]);e.s(["f",0,s],799647)},895335,e=>{var t=e.i(843476),a=e.i(143488),s=e.i(768371),i=e.i(271645),r=e.i(115571);function n(e){return window.addEventListener("storage",e),window.addEventListener(r.M,e),()=>{window.removeEventListener("storage",e),window.removeEventListener(r.M,e)}}var l=e.i(487486),o=e.i(519455),d=e.i(337822),m=e.i(772436),c=e.i(196631);let p=/^v?(\d+)\.(\d+)\.(\d+)/,u=e=>{let t=p.exec(e.trim());return t?[Number(t[1]),Number(t[2]),Number(t[3])]:null};var g=e.i(245423);let f={readKey:"litellmHideAutoRouterAnnouncement",title:"LiteLLM Auto Router",description:"Route every request to the cheapest model that can handle it, no prompt changes needed.",linkLabel:"Read the docs",href:"https://docs.litellm.ai/docs/proxy/auto_routing"},h=(e,t,a)=>`${e} ${1===e?t:a}`,x=({announcement:e})=>{var a;let s=(a=e.readKey,(0,i.useSyncExternalStore)(n,()=>"true"===(0,r.t)(a),()=>!1));return(0,t.jsxs)("article",{"aria-label":e.title,className:"flex flex-col gap-2",children:[(0,t.jsx)("p",{className:"text-sm font-medium",children:e.title}),(0,t.jsx)("p",{className:"text-sm leading-snug text-muted-foreground",children:e.description}),(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)("a",{className:(0,c.c)((0,o.i)({size:"sm"})),href:e.href,target:"_blank",rel:"noopener noreferrer",children:e.linkLabel}),s?null:(0,t.jsx)(o.K,{variant:"link",size:"sm",className:"px-1!",onClick:()=>{var t;return t=e.readKey,void((0,r.A)(t,"true"),(0,r.s)(t))},children:"Mark as read"})]})]})},b=({currentVersion:e,latestRelease:a})=>{var s;let o=e&&a&&((e,t)=>{let a=u(e),s=u(t);if(!a||!s)return!1;for(let e=0;e<3;e+=1)if(s[e]!==a[e])return s[e]>a[e];return!1})(e,a.version)?{readKey:`litellm:upgradeBannerDismissed:${a.version}`,title:`LiteLLM v${a.version} is available`,description:`${(({new_features:e,bug_fixes:t,other_updates:a})=>[h(e,"new feature","new features"),h(t,"fix","fixes"),`and ${h(a,"other update","other updates")}`].join(", "))(a)}. Your current version is v${e}`,linkLabel:"View release notes",href:a.release_url}:null,c=o?[o,f]:[f],p=(s=c.map(e=>e.readKey),(0,i.useSyncExternalStore)(n,()=>s.filter(e=>"true"!==(0,r.t)(e)).length,()=>s.length));return(0,t.jsxs)(d.V,{children:[(0,t.jsx)(d.J,{className:"flex! h-9! w-9! items-center justify-center rounded-md! text-muted-foreground transition-colors hover:bg-accent! hover:text-foreground!","aria-label":p>0?`Notifications, ${p} unread`:"Notifications",children:(0,t.jsxs)("span",{className:"relative inline-flex",children:[(0,t.jsx)(g.f,{className:"size-4","aria-hidden":!0}),p>0?(0,t.jsx)(l.f,{className:"absolute -top-0.5 -right-1 size-1.5 p-0","aria-hidden":!0}):null]})}),(0,t.jsx)(d.T,{align:"end","aria-label":"Notifications",children:c.map((e,a)=>(0,t.jsxs)(i.Fragment,{children:[a>0?(0,t.jsx)(m.f,{}):null,(0,t.jsx)(x,{announcement:e})]},e.readKey))})]})};e.s(["f",0,({accessToken:e})=>{let{data:i}=(0,a.f)(e),{data:r}=s.q.useQuery("get","/get/latest_release_info",{},{enabled:!!e,staleTime:36e5,retry:!1});return(0,t.jsx)(b,{currentVersion:i?.litellm_version,latestRelease:r})}],895335)},641141,e=>{var t=e.i(843476),a=e.i(135214),s=e.i(912089),i=e.i(556260),r=e.i(636772),n=e.i(115571),l=e.i(222038),o=e.i(782066),d=e.i(708347),m=e.i(664659),c=e.i(344523),p=e.i(243553),u=e.i(465261),g=e.i(292270),f=e.i(263488),h=e.i(581418),x=e.i(284614),b=e.i(618566),_=e.i(799676),j=e.i(487486),y=e.i(337822),v=e.i(772436),w=e.i(699375),N=e.i(746798),k=e.i(922407),$=e.i(196631),C=e.i(271645);e.s(["f",0,({onLogout:e,variant:z="navbar",collapsed:S=!1})=>{let{userId:I,userEmail:A,userRole:L,userRoleLabel:M,isViewOnly:O,premiumUser:E,loginMethod:P}=(0,a.f)(),R=(0,b.useRouter)(),[T,B]=(0,C.useState)(!1),D=(0,r.f)(),U=(0,s.f)(),[H,q]=(0,i.f)(I),Z=I&&!O&&(0,d.u)(L),[F,K]=(0,C.useState)(!1);(0,C.useEffect)(()=>{K("true"===(0,n.t)("disableShowNewBadge"))},[]);let W=A||I||"user",Y=function(e,t){let a=e?.split("@")[0]?.trim();if(a){let e=a.replace(/[^a-zA-Z0-9]+/g," ").trim().split(/\s+/).filter(Boolean);if(e.length>=2)return`${e[0].charAt(0)}${e[1].charAt(0)}`.toUpperCase();if(1===e.length){let t=e[0];return t.length>=2?t.slice(0,2).toUpperCase():`${t.charAt(0)}`.toUpperCase()}}return t&&t.length>=2?t.slice(0,2).toUpperCase():t&&1===t.length?`${t.toUpperCase()}•`:"?"}(A,I),G=function(e){let t=0;for(let a=0;a<e.length;a+=1)t=e.charCodeAt(a)+((t<<5)-t);return Math.abs(t)%360}(W),J=(0,l.f)(A,I);return(0,t.jsxs)(y.V,{open:T,onOpenChange:B,children:["sidebar"===z?(0,t.jsxs)(y.J,{render:(0,t.jsx)("button",{type:"button",className:(0,$.c)("flex w-full items-center rounded-lg border border-transparent transition-colors hover:bg-sidebar-accent",S?"justify-center px-0 py-1":"gap-2.5 px-2 py-1.5 text-left"),"aria-label":`Account menu — ${M??"Unknown role"} — signed in as ${A||I||"unknown"}`,"aria-haspopup":"dialog",title:S?J:void 0}),children:[(0,t.jsx)(_.E,{className:"size-[30px] shadow-inner ring-1 ring-black/5","aria-hidden":!0,children:(0,t.jsx)(_.b,{className:"font-semibold text-white",style:{backgroundColor:`hsl(${G} 46% 38%)`},children:Y})}),!S&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("span",{className:"min-w-0 flex-1 leading-tight",children:[(0,t.jsx)("span",{className:"block truncate text-[13px] font-medium text-sidebar-foreground",children:J}),M&&(0,t.jsx)("span",{className:"block truncate text-[11px] text-muted-foreground",children:M})]}),(0,t.jsx)(c.f,{size:16,strokeWidth:1.75,className:"shrink-0 text-muted-foreground","aria-hidden":!0})]})]}):(0,t.jsxs)(y.J,{render:(0,t.jsx)("button",{type:"button",className:"flex! max-w-[min(200px,34vw)] items-center gap-2 rounded-md! py-0.5! pl-1! pr-2! transition-colors hover:bg-accent!","aria-label":`Account menu — ${M??"Unknown role"} — signed in as ${A||I||"unknown"}`,"aria-haspopup":"dialog"}),children:[(0,t.jsx)(_.E,{className:"shadow-inner ring-1 ring-black/5","aria-hidden":!0,children:(0,t.jsx)(_.b,{className:"font-semibold text-white",style:{backgroundColor:`hsl(${G} 46% 38%)`},children:Y})}),(0,t.jsx)("span",{className:"hidden min-w-0 truncate text-left text-sm font-medium leading-none text-foreground md:inline",children:J}),(0,t.jsx)(m.f,{className:"hidden size-2.5 shrink-0 text-muted-foreground md:inline","aria-hidden":!0})]}),(0,t.jsxs)(y.T,{align:"sidebar"===z?"start":"end",side:"sidebar"===z?"top":"bottom",className:"w-auto gap-0 rounded-lg bg-card p-1 shadow-lg","data-testid":"user-dropdown-panel",children:[(0,t.jsxs)("div",{className:"flex w-full flex-col gap-2 p-3 text-sm",children:[(0,t.jsxs)("div",{className:"flex w-full items-center justify-between gap-2",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)(f.f,{className:"size-4"}),(0,t.jsx)("span",{className:"text-muted-foreground",children:A||"-"})]}),E?(0,t.jsxs)(j.f,{children:[(0,t.jsx)(p.f,{className:"size-3"}),"Premium"]}):(0,t.jsx)(N.g,{children:(0,t.jsxs)(N.W,{children:[(0,t.jsxs)(N.y,{render:(0,t.jsx)(j.f,{variant:"outline"}),children:[(0,t.jsx)(p.f,{className:"size-3"}),"Standard"]}),(0,t.jsx)(N.Y,{side:"left",children:"Upgrade to Premium for advanced features"})]})})]}),(0,t.jsx)(v.f,{className:"my-2"}),(0,t.jsxs)("div",{className:"flex w-full items-center justify-between gap-2",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)(x.f,{className:"size-4"}),(0,t.jsx)("span",{className:"text-muted-foreground",children:"User ID"})]}),(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)("span",{className:"max-w-[150px] truncate",title:I||"-",children:I||"-"}),(0,t.jsx)(k.f,{value:I,label:"Copy User ID"})]})]}),(0,t.jsxs)("div",{className:"flex w-full items-center justify-between gap-2",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)(h.f,{className:"size-4"}),(0,t.jsx)("span",{className:"text-muted-foreground",children:"Role"})]}),(0,t.jsx)("span",{children:M})]}),(0,t.jsx)(v.f,{className:"my-2"}),(0,t.jsxs)("div",{className:"flex w-full items-center justify-between gap-2",children:[(0,t.jsx)("span",{className:"text-muted-foreground",children:"Hide New Feature Indicators"}),(0,t.jsx)(w.f,{size:"sm",checked:F,onCheckedChange:e=>{K(e),e?(0,n.A)("disableShowNewBadge","true"):(0,n.p)("disableShowNewBadge"),(0,n.s)("disableShowNewBadge")},"aria-label":"Toggle hide new feature indicators"})]}),(0,t.jsxs)("div",{className:"flex w-full items-center justify-between gap-2",children:[(0,t.jsx)("span",{className:"text-muted-foreground",children:"Hide All Prompts"}),(0,t.jsx)(w.f,{size:"sm",checked:D,onCheckedChange:e=>{e?(0,n.A)("disableShowPrompts","true"):(0,n.p)("disableShowPrompts"),(0,n.s)("disableShowPrompts")},"aria-label":"Toggle hide all prompts"})]}),(0,t.jsxs)("div",{className:"flex w-full items-center justify-between gap-2",children:[(0,t.jsx)("span",{className:"text-muted-foreground",children:"Hide Bouncing Icon"}),(0,t.jsx)(w.f,{size:"sm",checked:U,onCheckedChange:e=>{e?(0,n.A)("disableBouncingIcon","true"):(0,n.p)("disableBouncingIcon"),(0,n.s)("disableBouncingIcon")},"aria-label":"Toggle hide bouncing icon"})]}),!0===E&&Z&&(0,t.jsxs)("div",{className:"flex w-full items-center justify-between gap-2",children:[(0,t.jsx)("span",{className:"text-muted-foreground",children:"Hide LiteAdmin"}),(0,t.jsx)(w.f,{size:"sm",checked:H,onCheckedChange:q,"aria-label":"Toggle hide LiteAdmin"})]})]}),(0,t.jsx)(v.f,{}),"username_password"===P&&(0,t.jsxs)("button",{type:"button",onClick:()=>{B(!1),R.push((0,o.B)("change-password"))},className:"flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",children:[(0,t.jsx)(u.f,{className:"size-4"}),"Change Password"]}),(0,t.jsxs)("button",{type:"button",onClick:e,className:"flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",children:[(0,t.jsx)(g.f,{className:"size-4"}),"Logout"]})]})]})}])},853295,658140,747371,e=>{var t=e.i(843476),a=e.i(618566),s=e.i(755146),i=e.i(643531),r=e.i(344523),n=e.i(373264),l=e.i(271645),o=e.i(431703),d=e.i(602869);let m=(0,l.createContext)({mode:"ai-gateway",setMode:()=>{},plugins:[],activePlugin:null}),c="litellm_plugin_mode",p=(0,o.i)({getBaseUrl:()=>(0,d._h)()??""});function u(){return localStorage.getItem(c)??"ai-gateway"}function g(){return(0,l.useContext)(m)}e.s(["Y",0,function({children:e,accessToken:a}){let[s,i]=(0,l.useState)(u),[r,n]=(0,l.useState)([]),[o,d]=(0,l.useState)(!1);(0,l.useEffect)(()=>{if(!a)return;let e=!1;return p.get("/api/plugins",{accessToken:a}).then(t=>{e||n(Array.isArray(t)?t:[])}).catch(()=>{}).finally(()=>{e||d(!0)}),()=>{e=!0}},[a]);let g="ai-gateway"!==s&&o&&!r.some(e=>e.name===s)?"ai-gateway":s,f=r.find(e=>e.name===g)??null;return(0,t.jsx)(m.Provider,{value:{mode:g,setMode:e=>{i(e),localStorage.setItem(c,e)},plugins:r,activePlugin:f},children:e})},"y",0,g],658140);var f=e.i(292639),h=e.i(782066);let x={src:e.i(45483).default,width:280,height:372,blurWidth:0,blurHeight:0};e.s(["f",0,x],747371);let b="chat",_="moyai";function j(e,t){return e===t||e.startsWith(`${t}/`)}e.s(["f",0,function(){var e;let{mode:l,setMode:o,plugins:d}=g(),{data:m}=(0,f.f)(),c=(0,a.usePathname)(),p=!!m?.values?.enable_chat_ui,u=m?.values?.moyai_url??null,y=(c??"").replace(/\/+$/,""),v=p&&j(y,(0,h.B)(b)),w=j(y,(0,h.B)(_)),N=v||w,k=(e=d.find(e=>e.name===l)?.display_name,v?"Chat":w?"Moyai":e??"AI Gateway"),$=[{key:"ai-gateway",label:"AI Gateway"},...d.map(e=>({key:e.name,label:e.display_name}))],C=p?{key:b,label:(0,t.jsxs)("div",{className:"flex items-center justify-between gap-6 py-0.5",children:[(0,t.jsx)("span",{className:"font-medium",children:"Chat"}),v&&(0,t.jsx)(i.f,{className:"size-4 text-info"})]}),onClick:()=>window.location.assign((0,h.B)(b))}:{key:b,disabled:!0,label:(0,t.jsxs)("div",{className:"flex max-w-[220px] flex-col py-0.5",children:[(0,t.jsx)("span",{className:"font-medium",children:"Chat"}),(0,t.jsx)("span",{className:"whitespace-normal text-xs leading-snug text-muted-foreground",children:"Admins can enable in Settings"})]})},z=[...$.map(e=>({key:e.key,label:(0,t.jsxs)("div",{className:"flex items-center justify-between gap-6 py-0.5",children:[(0,t.jsx)("span",{className:"font-medium",children:e.label}),!N&&e.key===l&&(0,t.jsx)(i.f,{className:"size-4 text-info"})]}),onClick:()=>{o(e.key),N&&window.location.assign((0,h.B)(""))}})),{key:_,label:(0,t.jsxs)("div",{className:"flex items-center justify-between gap-6 py-0.5",children:[(0,t.jsxs)("span",{className:"flex items-center gap-2",children:[(0,t.jsx)("img",{src:x.src,alt:"",className:"h-4 w-auto"}),(0,t.jsxs)("span",{className:"flex flex-col",children:[(0,t.jsx)("span",{className:"font-medium",children:"Moyai"}),(0,t.jsx)("span",{className:"text-xs leading-snug text-muted-foreground",children:"Cloud Coding Agent"})]})]}),w&&(0,t.jsx)(i.f,{className:"size-4 text-info"})]}),onClick:()=>window.location.assign(u??(0,h.B)(_))},C];return(0,t.jsxs)(s.G,{children:[(0,t.jsxs)(s.X,{render:(0,t.jsx)("button",{type:"button",className:"flex h-8 max-w-[220px] items-center gap-1.5 rounded-md border border-border bg-background pl-1.5 pr-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"}),children:[(0,t.jsx)("span",{className:"flex size-5 flex-none items-center justify-center rounded bg-muted text-muted-foreground",children:(0,t.jsx)(n.f,{className:"size-[13px]"})}),(0,t.jsx)("span",{className:"truncate",children:k}),(0,t.jsx)(r.f,{className:"size-3.5 flex-none text-muted-foreground"})]}),(0,t.jsx)(s.L,{className:"w-auto",children:z.map(e=>(0,t.jsx)(s.r,{disabled:e.disabled,onClick:e.onClick,children:e.label},e.key))})]})}],853295)},383862,e=>{var t=e.i(843476),a=e.i(618393),s=e.i(131792),i=e.i(950594),r=e.i(283713);e.s(["f",0,({onWorkerSwitch:e})=>{let{isControlPlane:n,selectedWorker:l,workers:o}=(0,r.f)();if(!n||!l)return null;let d=o.map(e=>({label:e.name,value:e.worker_id,disabled:e.worker_id===l.worker_id}));return(0,t.jsxs)(s.x,{items:d,value:d.find(e=>e.value===l.worker_id)??null,itemToStringLabel:e=>e.label,onValueChange:t=>{t&&e(t.value)},children:[(0,t.jsx)(s.c,{className:"min-w-[180px]","aria-label":"Worker",children:(0,t.jsx)(i.B,{align:"inline-start",children:(0,t.jsx)(a.f,{className:"size-4"})})}),(0,t.jsxs)(s.R,{children:[(0,t.jsx)(s.S,{children:"No matching workers"}),(0,t.jsx)(s.k,{children:e=>(0,t.jsx)(s.T,{value:e,disabled:e.disabled,children:e.label},e.value)})]})]})}])},455880,e=>{var t=e.i(843476),a=e.i(991799),s=e.i(897250),i=e.i(363178),r=e.i(519455);e.s(["f",0,()=>{let{setTheme:e,resolvedTheme:n}=(0,i.useTheme)(),l="dark"===n,o=l?"Switch to light mode":"Switch to dark mode";return(0,t.jsx)(r.K,{variant:"ghost",size:"icon-sm","aria-label":o,title:o,className:"text-muted-foreground",onClick:()=>e(l?"light":"dark"),children:l?(0,t.jsx)(a.f,{}):(0,t.jsx)(s.f,{})})}])},909947,e=>{var t=e.i(865361);e.s(["f",0,e=>{let a,{apiKeySource:s,accessToken:i,apiKey:r,inputMessage:n,chatHistory:l,selectedTags:o,selectedVectorStores:d,selectedGuardrails:m,selectedPolicies:c,selectedVoice:p,endpointType:u,selectedModel:g,selectedSdk:f,proxySettings:h,customHeaders:x}=e,b="session"===s?i:r,_=window.location.origin,j=h?.LITELLM_UI_API_DOC_BASE_URL;j&&j.trim()?_=j:h?.PROXY_BASE_URL&&(_=h.PROXY_BASE_URL);let y=n||"Your prompt here",v=y.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),w=l.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),N={};o.length>0&&(N.tags=o),d.length>0&&(N.vector_stores=d),m.length>0&&(N.guardrails=m),c.length>0&&(N.policies=c);let k=g||"your-model-name",$=x&&Object.keys(x).length>0?`,
	default_headers=${JSON.stringify(x,null,2).replace(/\n/g,"\n	")}`:"",C="azure"===f?`import openai

client = openai.AzureOpenAI(
	api_key="${b||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${_}",
	api_version="2024-02-01"${$}
)`:`import openai

client = openai.OpenAI(
	api_key="${b||"YOUR_LITELLM_API_KEY"}",
	base_url="${_}"${$}
)`;switch(u){case t.Q.CHAT:{let e=Object.keys(N).length>0,t="";if(e){let e=JSON.stringify({metadata:N},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();t=`,
    extra_body=${e}`}let s=w.length>0?w:[{role:"user",content:y}];a=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${k}",
    messages=${JSON.stringify(s,null,4)}${t}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${k}",
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {
#                     "type": "text",
#                     "text": "${v}"
#                 },
#                 {
#                     "type": "image_url",
#                     "image_url": {
#                         "url": f"data:image/jpeg;base64,{base64_file}"  # or data:application/pdf;base64,{base64_file}
#                     }
#                 }
#             ]
#         }
#     ]${t}
# )
# print(response_with_file)
`;break}case t.Q.RESPONSES:{let e=Object.keys(N).length>0,t="";if(e){let e=JSON.stringify({metadata:N},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();t=`,
    extra_body=${e}`}let s=w.length>0?w:[{role:"user",content:y}];a=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${k}",
    input=${JSON.stringify(s,null,4)}${t}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${k}",
#     input=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "input_text", "text": "${v}"},
#                 {
#                     "type": "input_image",
#                     "image_url": f"data:image/jpeg;base64,{base64_file}",  # or data:application/pdf;base64,{base64_file}
#                     "detail": "auto",
#                 },
#             ],
#         }
#     ]${t}
# )
# print(response_with_file.output_text)
`;break}case t.Q.IMAGE:a="azure"===f?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${k}",
	prompt="${n}",
	n=1
)

json_response = json.loads(result.model_dump_json())

# Set the directory for the stored image
image_dir = os.path.join(os.curdir, 'images')

# If the directory doesn't exist, create it
if not os.path.isdir(image_dir):
	os.mkdir(image_dir)

# Initialize the image path
image_filename = f"generated_image_{int(time.time())}.png"
image_path = os.path.join(image_dir, image_filename)

try:
	# Retrieve the generated image
	if json_response.get("data") && len(json_response["data"]) > 0 && json_response["data"][0].get("url"):
			image_url = json_response["data"][0]["url"]
			generated_image = requests.get(image_url).content
			with open(image_path, "wb") as image_file:
					image_file.write(generated_image)

			print(f"Image saved to {image_path}")
			# Display the image
			image = Image.open(image_path)
			image.show()
	else:
			print("Could not find image URL in response.")
			print("Full response:", json_response)
except Exception as e:
	print(f"An error occurred: {e}")
	print("Full response:", json_response)
`:`
import base64
import os
import time
import json
from PIL import Image
import requests

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# Helper function to create a file (simplified for this example)
def create_file(image_path):
	# In a real implementation, this would upload the file to OpenAI
	# For this example, we'll just return a placeholder ID
	return f"file_{os.path.basename(image_path).replace('.', '_')}"

# The prompt entered by the user
prompt = "${v}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${k}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
									"detail": "auto",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
									"detail": "auto",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
									"detail": "auto",
							},
							{
									"type": "input_image",
									"file_id": file_id2,
									"detail": "auto",
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`;break;case t.Q.IMAGE_EDITS:a="azure"===f?`
import base64
import os
import time
import json
from PIL import Image
import requests

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# The prompt entered by the user
prompt = "${v}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${k}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
									"detail": "auto",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
									"detail": "auto",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
									"detail": "auto",
							},
							{
									"type": "input_image",
									"file_id": file_id2,
									"detail": "auto",
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`:`
import base64
import os
import time

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# Helper function to create a file (simplified for this example)
def create_file(image_path):
	# In a real implementation, this would upload the file to OpenAI
	# For this example, we'll just return a placeholder ID
	return f"file_{os.path.basename(image_path).replace('.', '_')}"

# The prompt entered by the user
prompt = "${v}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${k}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
									"detail": "auto",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
									"detail": "auto",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
									"detail": "auto",
							},
							{
									"type": "input_image",
									"file_id": file_id2,
									"detail": "auto",
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`;break;case t.Q.EMBEDDINGS:a=`
response = client.embeddings.create(
	input="${n||"Your string here"}",
	model="${k}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case t.Q.TRANSCRIPTION:a=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${k}",
	file=audio_file${n?`,
	prompt="${n.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case t.Q.SPEECH:a=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${k}",
	input="${n||"Your text to convert to speech here"}",
	voice="${p}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${k}",
#     input="${n||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:a="\n# Code generation for this endpoint is not implemented yet."}return`${C}
${a}`}])},652272,209261,e=>{var t=e.i(843476),a=e.i(271645),s=e.i(871689),i=e.i(643531),r=e.i(174886),n=e.i(306228),l=e.i(196631);let o=/^[a-zA-Z0-9][a-zA-Z0-9._-]*(\/[a-zA-Z0-9][a-zA-Z0-9._-]*)*$/,d=e=>e.trim().replace(/\/+$/,""),m=/\.(md|markdown|txt|json|ya?ml|toml)$/i,c=/\.zip$/i,p=/^[0-9a-fA-F]{64}$/,u=/^\d{1,3}(\.\d{1,3}){3}$/,g=/^[A-Za-z0-9-]+$/,f=/^[A-Za-z0-9._-]+$/,h=/^https?:\/\//i,x="ssh://",b=/^([a-z0-9._-]+)@([^:/@]+):(?!\/)(.+)$/i,_=e=>e.pathname.split("/").filter(e=>""!==e),j=e=>{try{return new URL(e)}catch{return null}},y=e=>e.hostname.includes(".")&&!e.hostname.startsWith("[")&&!u.test(e.hostname),v=e=>{let t=e.split("/").filter(e=>""!==e);return t[t.length-1]??""},w=e=>e.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/-+/g,"-").replace(/^-+|-+$/g,""),N=(e,t,a,s)=>{let i=d(s??"");return""!==i?o.test(i)?{parsed:{source:"git-subdir",url:t,path:i},label:`${e} subdir — ${t} @ ${i}`,suggestedName:w(v(i))}:null:{parsed:{source:"url",url:t},label:`${e} repo — ${t}`,suggestedName:w(a)}},k=e=>JSON.stringify({extraKnownMarketplaces:{litellm:{source:{source:"url",url:`${e}/claude-code/marketplace.json`}}}},null,2),$=e=>`/plugin install ${e.name}@litellm`,C=e=>"github"===e.source&&e.repo?`GitHub: ${e.repo}`:"git-subdir"===e.source&&e.url&&e.path?`${e.url} @ ${e.path}`:("url"===e.source||"archive"===e.source)&&e.url?e.url:"Unknown source",z=e=>"github"===e.source&&e.repo?`https://github.com/${e.repo}`:("url"===e.source||"git-subdir"===e.source||"archive"===e.source)&&e.url&&h.test(e.url)?e.url:null;e.s(["U",0,k,"a",0,$,"u",0,e=>{if(!e)return"gray";let t=e.toLowerCase();if(t.includes("development")||t.includes("dev"))return"blue";if(t.includes("productivity")||t.includes("workflow"))return"green";if(t.includes("learning")||t.includes("education"))return"purple";if(t.includes("security")||t.includes("safety"))return"red";if(t.includes("data")||t.includes("analytics"))return"orange";else if(t.includes("integration")||t.includes("api"))return"yellow";return"gray"},"_",0,C,"E",0,z,"r",0,e=>!e||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),"R",0,e=>!e||/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(e),"b",0,e=>""===e.trim()||p.test(e.trim()),"P",0,e=>{let t=d(e);return""!==t&&o.test(t)},"D",0,e=>e&&""!==e.trim()?e.split(",").map(e=>e.trim()).filter(e=>""!==e):[],"Z",0,(e,t)=>{let a=((e,t)=>{let a=e.trim(),s=b.exec(a),i=s?`${x}${s[1]}@${s[2]}/${s[3]}`:a;if(!i.toLowerCase().startsWith(x))return null;let r=j(i);if(!r||""===r.username||""!==r.password||!y(r))return null;let n=i.indexOf("/",x.length);return -1===n||r.pathname!==i.slice(n)||_(r).length<2?null:N("SSH",a,v(r.pathname).replace(/\.git$/i,""),t)})(e,t);if(a)return a;let s=(e=>{let t=e.trim();if(""===t||t.startsWith("//"))return null;let a=j(/^[a-z][a-z0-9+.-]*:\/\//i.test(t)?t:`https://${t}`);return a&&"https:"===a.protocol&&""===a.username&&""===a.password&&y(a)?a:null})(e);if(!s)return null;if(c.test(s.pathname))return{parsed:{source:"archive",url:s.href},label:`Zip archive — ${s.host}${s.pathname}`,suggestedName:w(v(s.pathname).replace(c,""))};if("github.com"===s.hostname.replace(/^www\./,""))return((e,t)=>{let a=_(e);if(a.length<2)return null;let s=a[0],i=a[1].replace(/\.git$/,"");if(!g.test(s)||!f.test(i))return null;let r=`${s}/${i}`,n=`https://github.com/${r}`,l={parsed:{source:"github",repo:r},label:`GitHub repo — ${r}`,suggestedName:w(i)};if(a.length>=4&&("tree"===a[2]||"blob"===a[2])){let e=a.slice(4),t=v(e.join("/")),s=m.test(t)?e.slice(0,-1):e;if(0===s.length)return l;let i=d(s.join("/"));return o.test(i)?{parsed:{source:"git-subdir",url:n,path:i},label:`GitHub subdir — ${r} @ ${i}`,suggestedName:w(v(i))}:null}if(2!==a.length)return null;let c=d(t??"");return""!==c?o.test(c)?{parsed:{source:"git-subdir",url:n,path:c},label:`GitHub subdir — ${r} @ ${c}`,suggestedName:w(v(c))}:null:l})(s,t);if(_(s).length<2)return null;let i=v(s.pathname).replace(/\.git$/,"");return N("Git",`${s.protocol}//${s.host}${s.pathname.replace(/\/+$/,"")}`,i,t)},"e",0,e=>!!e&&""!==e.trim()&&/^[a-z0-9-]+$/.test(e)],209261);let S=({source:e})=>{let a=z(e),s=a&&"git-subdir"===e.source&&e.path?`${a}/tree/main/${e.path}`:a;return s?(0,t.jsxs)("div",{className:"mb-6",children:[(0,t.jsx)("div",{className:"mb-1 text-xs text-muted-foreground",children:"Source"}),(0,t.jsxs)("a",{href:s,target:"_blank",rel:"noopener noreferrer",className:"flex items-center gap-1 break-all text-[13px] text-info",children:[s.replace("https://",""),(0,t.jsx)(n.f,{className:"size-3 shrink-0"})]})]}):e.url?(0,t.jsxs)("div",{className:"mb-6",children:[(0,t.jsx)("div",{className:"mb-1 text-xs text-muted-foreground",children:"Source"}),(0,t.jsx)("div",{className:"break-all text-[13px] text-foreground",children:C(e)})]}):null};e.s(["f",0,({skill:e,onBack:n})=>{let[o,d]=(0,a.useState)("overview"),[m,c]=(0,a.useState)(null),p=(e,t)=>{navigator.clipboard.writeText(e),c(t),setTimeout(()=>c(null),2e3)},u=$(e),g=k(window.location.origin),f=[...e.category?[{property:"Category",value:e.category}]:[],...e.domain?[{property:"Domain",value:e.domain}]:[],...e.namespace?[{property:"Namespace",value:e.namespace}]:[],...e.version?[{property:"Version",value:e.version}]:[],...e.author?.name?[{property:"Author",value:e.author.name}]:[],...e.created_at?[{property:"Added",value:new Date(e.created_at).toLocaleDateString()}]:[]];return(0,t.jsxs)("div",{className:"py-6 pl-0 pr-8",children:[(0,t.jsxs)("div",{onClick:n,className:"mb-6 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground",children:[(0,t.jsx)(s.f,{className:"size-3"}),(0,t.jsx)("span",{children:"Skills"})]}),(0,t.jsxs)("div",{className:"mb-2",children:[(0,t.jsx)("h1",{className:"m-0 text-[28px] font-normal leading-tight text-foreground",children:e.name}),e.description&&(0,t.jsx)("p",{className:"mb-0 ml-0 mr-0 mt-2 text-sm leading-relaxed text-muted-foreground",children:e.description})]}),(0,t.jsx)("div",{className:"mb-7 mt-6 border-b border-border",children:(0,t.jsx)("div",{className:"flex",children:[{key:"overview",label:"Overview"},{key:"usage",label:"How to Use"}].map(e=>(0,t.jsx)("div",{onClick:()=>d(e.key),className:(0,l.c)("-mb-px cursor-pointer border-b-[3px] px-5 py-3 text-sm",o===e.key?"border-info font-medium text-info":"border-transparent font-normal text-muted-foreground"),children:e.label},e.key))})}),"overview"===o&&(0,t.jsxs)("div",{className:"flex gap-16",children:[(0,t.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,t.jsx)("h2",{className:"m-0 mb-1 text-lg font-normal text-foreground",children:"Skill Details"}),(0,t.jsx)("p",{className:"m-0 mb-4 text-[13px] text-muted-foreground",children:"Metadata registered with this skill"}),(0,t.jsxs)("table",{className:"w-full border-collapse text-sm",children:[(0,t.jsx)("thead",{children:(0,t.jsxs)("tr",{className:"border-b border-border",children:[(0,t.jsx)("th",{className:"w-40 py-3 text-left font-medium text-muted-foreground",children:"Property"}),(0,t.jsx)("th",{className:"py-3 text-left font-medium text-muted-foreground",children:e.name})]})}),(0,t.jsx)("tbody",{children:f.map((e,a)=>(0,t.jsxs)("tr",{className:"border-b border-border",children:[(0,t.jsx)("td",{className:"py-3 text-foreground",children:e.property}),(0,t.jsx)("td",{className:"py-3 text-foreground",children:e.value})]},a))})]})]}),(0,t.jsxs)("div",{className:"w-60 shrink-0",children:[(0,t.jsxs)("div",{className:"mb-6",children:[(0,t.jsx)("div",{className:"mb-1 text-xs text-muted-foreground",children:"Status"}),(0,t.jsx)("span",{className:(0,l.c)("rounded-xl px-2.5 py-[3px] text-xs font-medium",e.enabled?"bg-success/10 text-success":"bg-muted text-muted-foreground"),children:e.enabled?"Public":"Draft"})]}),(0,t.jsx)(S,{source:e.source}),e.keywords&&e.keywords.length>0&&(0,t.jsxs)("div",{className:"mb-6",children:[(0,t.jsx)("div",{className:"mb-2 text-xs text-muted-foreground",children:"Tags"}),(0,t.jsx)("div",{className:"flex flex-wrap gap-1.5",children:e.keywords.map(e=>(0,t.jsx)("span",{className:"rounded-2xl border border-border bg-card px-3 py-1 text-xs text-foreground",children:e},e))})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"mb-1 text-xs text-muted-foreground",children:"Skill ID"}),(0,t.jsx)("div",{className:"break-all font-mono text-xs text-foreground",children:e.id})]})]})]}),"usage"===o&&(0,t.jsxs)("div",{className:"max-w-[640px]",children:[(0,t.jsx)("h2",{className:"m-0 mb-2 text-lg font-normal text-foreground",children:"Using this skill"}),(0,t.jsx)("p",{className:"m-0 mb-6 text-sm leading-relaxed text-muted-foreground",children:"Once your proxy is set as a marketplace, enable this skill in Claude Code with one command:"}),(0,t.jsxs)("div",{className:"mb-6 overflow-hidden rounded-lg border border-border",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between border-b border-border bg-muted px-4 py-2.5",children:[(0,t.jsx)("span",{className:"text-[13px] font-medium text-foreground",children:"Run in Claude Code"}),(0,t.jsxs)("button",{onClick:()=>p(u,"install"),className:(0,l.c)("flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs","install"===m?"text-success":"text-info"),children:["install"===m?(0,t.jsx)(i.f,{className:"size-3"}):(0,t.jsx)(r.f,{className:"size-3"}),"install"===m?"Copied":"Copy"]})]}),(0,t.jsx)("pre",{className:"m-0 bg-card px-4 py-3.5 font-mono text-sm text-foreground",children:u})]}),(0,t.jsxs)("div",{className:"mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3",children:[(0,t.jsxs)("p",{className:"m-0 mb-2 text-[13px] leading-relaxed text-muted-foreground",children:['If you see "Plugin ',e.name,' not found in marketplace", update the catalog first:']}),(0,t.jsx)("pre",{className:"m-0 bg-transparent font-mono text-[13px] text-foreground",children:"/plugin marketplace update litellm"})]}),(0,t.jsxs)("p",{className:"m-0 text-[13px] leading-relaxed text-muted-foreground",children:["Don't have the marketplace configured yet?"," ",(0,t.jsx)("span",{onClick:()=>d("setup"),className:"cursor-pointer text-info",children:"See one-time setup →"})]})]}),"setup"===o&&(0,t.jsxs)("div",{className:"max-w-[640px]",children:[(0,t.jsx)("h2",{className:"m-0 mb-2 text-lg font-normal text-foreground",children:"One-time marketplace setup"}),(0,t.jsx)("p",{className:"m-0 mb-3 text-sm leading-relaxed text-muted-foreground",children:"Run this command in Claude Code to register the marketplace:"}),(0,t.jsxs)("div",{className:"mb-6 overflow-hidden rounded-lg border border-border",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between border-b border-border bg-muted px-4 py-2.5",children:[(0,t.jsx)("span",{className:"text-[13px] font-medium text-foreground",children:"Run in Claude Code"}),(0,t.jsxs)("button",{onClick:()=>{let e=window.location.origin;p(`/plugin marketplace add ${e}/claude-code/marketplace.json`,"marketplace-cmd")},className:(0,l.c)("flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs","marketplace-cmd"===m?"text-success":"text-info"),children:["marketplace-cmd"===m?(0,t.jsx)(i.f,{className:"size-3"}):(0,t.jsx)(r.f,{className:"size-3"}),"marketplace-cmd"===m?"Copied":"Copy"]})]}),(0,t.jsx)("pre",{className:"m-0 bg-card px-4 py-3.5 font-mono text-[13px] text-foreground",children:`/plugin marketplace add ${window.location.origin}/claude-code/marketplace.json`})]}),(0,t.jsxs)("p",{className:"m-0 mb-3 text-sm leading-relaxed text-muted-foreground",children:["Or add this to ",(0,t.jsx)("code",{className:"rounded bg-muted px-1.5 py-px text-[13px]",children:"~/.claude/settings.json"})," ","for a persistent configuration:"]}),(0,t.jsxs)("div",{className:"overflow-hidden rounded-lg border border-border",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between border-b border-border bg-muted px-4 py-2.5",children:[(0,t.jsx)("span",{className:"text-[13px] font-medium text-foreground",children:"~/.claude/settings.json"}),(0,t.jsxs)("button",{onClick:()=>p(g,"settings"),className:(0,l.c)("flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs","settings"===m?"text-success":"text-info"),children:["settings"===m?(0,t.jsx)(i.f,{className:"size-3"}):(0,t.jsx)(r.f,{className:"size-3"}),"settings"===m?"Copied":"Copy"]})]}),(0,t.jsx)("pre",{className:"m-0 bg-card px-4 py-3.5 font-mono text-[13px] text-foreground",children:g})]})]})]})}],652272)},402874,e=>{var t=e.i(843476),a=e.i(143488),s=e.i(912089),i=e.i(283713),r=e.i(602869),n=e.i(782066),l=e.i(275144),o=e.i(886400),d=e.i(321836),m=e.i(487486),c=e.i(972518),p=e.i(799647),u=e.i(522016),g=e.i(196631),f=e.i(895335),h=e.i(641141),x=e.i(455880),b=e.i(853295),_=e.i(383862);let j="h-auto max-h-full w-auto max-w-full object-contain";e.s(["f",0,({accessToken:e,isPublicPage:y=!1,sidebarCollapsed:v=!1,onToggleSidebar:w,deploymentHealth:N})=>{let k=(0,r._h)(),{logoUrl:$}=(0,l.i)(),{data:C}=(0,a.f)(e),z=C?.litellm_version,S=(0,s.f)(),{isControlPlane:I,selectedWorker:A}=(0,i.f)(),L=$||`${k}/get_image`,M=$||`${k}/get_image?theme=dark`,O=(0,o.r)(e);return(0,t.jsx)("nav",{className:"sticky top-0 z-chrome border-b border-border bg-card",children:(0,t.jsx)("div",{className:"w-full",children:(0,t.jsxs)("div",{className:"flex h-14 items-center px-4",children:[(0,t.jsxs)("div",{className:"flex shrink-0 items-center",children:[w&&(0,t.jsx)("button",{onClick:w,className:"mr-2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",title:v?"Expand sidebar":"Collapse sidebar",children:(0,t.jsx)("span",{className:"text-lg",children:v?(0,t.jsx)(p.f,{className:"size-[18px]"}):(0,t.jsx)(c.f,{className:"size-[18px]"})})}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)(u.default,{href:(0,n.B)(""),className:"flex items-center",children:(0,t.jsx)("div",{className:"relative",children:(0,t.jsxs)("div",{className:"flex h-10 max-w-48 items-center justify-center overflow-hidden",children:[(0,t.jsx)("img",{src:L,alt:"LiteLLM Brand",className:(0,g.c)(j,"dark:hidden")}),(0,t.jsx)("img",{src:M,alt:"","aria-hidden":!0,className:(0,g.c)(j,"hidden dark:block")})]})})}),z&&(0,t.jsxs)("div",{className:"relative",children:[!S&&(0,t.jsx)("span",{className:"absolute -left-2 -top-1 animate-bounce text-lg",style:{animationDuration:"2s"},title:"Thanks for using LiteLLM!",children:"🌑"}),(0,t.jsx)(m.f,{variant:"outline",className:"relative z-raised cursor-pointer text-xs font-medium",children:(0,t.jsxs)("a",{href:"https://docs.litellm.ai/release_notes",target:"_blank",rel:"noopener noreferrer",className:"shrink-0",children:["v",z]})})]})]})]}),!y&&(0,t.jsx)("div",{className:"ml-4 flex shrink-0 items-center border-l border-border pl-4",children:(0,t.jsx)(b.f,{})}),(0,t.jsxs)("div",{className:"ml-auto flex min-w-0 flex-1 items-center justify-end gap-4",children:[I&&null!==A&&(0,t.jsx)("div",{className:"flex shrink-0 items-center",children:(0,t.jsx)(_.f,{onWorkerSwitch:t=>{(0,o.v)(e).finally(()=>{window.location.href=`${(0,d.D)()}?worker=${encodeURIComponent(t)}`})}})}),!y&&(0,t.jsx)("div",{className:"flex shrink-0 items-center border-l border-border pl-4",children:(0,t.jsxs)("div",{className:"flex items-center gap-0.5 rounded-lg bg-muted px-1 py-0 transition-colors hover:bg-accent",children:[(0,t.jsx)(x.f,{}),(0,t.jsx)("span",{className:"mx-0.5 h-6 w-px shrink-0 bg-border","aria-hidden":!0}),N,(0,t.jsx)(f.f,{accessToken:e}),(0,t.jsx)("span",{className:"mx-0.5 h-6 w-px shrink-0 bg-border","aria-hidden":!0}),(0,t.jsx)(h.f,{onLogout:O})]})})]})]})})})}])},283713,e=>{var t=e.i(271645),a=e.i(602869),s=e.i(612256);let i="litellm_selected_worker_id";e.s(["f",0,()=>{let{data:e}=(0,s.f)(),r=e?.is_control_plane??!1,n=e?.workers??[],[l,o]=(0,t.useState)(()=>localStorage.getItem(i));(0,t.useEffect)(()=>{if(!l||0===n.length)return;let e=n.find(e=>e.worker_id===l);e&&(0,a.NZ)(e.url)},[l,n]);let d=n.find(e=>e.worker_id===l)??null,m=(0,t.useCallback)(e=>{let t=n.find(t=>t.worker_id===e);t&&(o(e),localStorage.setItem(i,e),(0,a.NZ)(t.url))},[n]);return{isControlPlane:r,workers:n,selectedWorkerId:l,selectedWorker:d,selectWorker:m,disconnectFromWorker:(0,t.useCallback)(()=>{o(null),localStorage.removeItem(i),(0,a.NZ)(null)},[])}}])},735450,e=>{var t=e.i(411382),a=e.i(772325),s=e.i(54105),i=e.i(240192),r=e.i(138620);let n="https://docs.litellm.ai/docs/decisions",l=`${n}#supported-providers`,o=`${n}#self-hosted-laya-and-nimble`,d=new Set(["/v1/decisions","/v1/systemone"]),m=t.z.object({litellm_provider:s.z.string(),mode:s.z.string().nullish(),supported_endpoints:a.z.array(s.z.string()).nullish()}),c="decisions",p=["evaluation",c],u=e=>null!=e&&p.includes(e),g=e=>u(e.mode)||(e.supported_endpoints??[]).some(e=>d.has(e)),f=e=>{let t=i.z.record(s.z.string(),r.z.unknown()).safeParse(e);return t.success?Object.entries(t.data).flatMap(([e,t])=>{let a=m.safeParse(t);return a.success?[[e,a.data]]:[]}):[]},h={decisions:0,"self-hosted":1,"needs-upgrade":2},x=t.z.object({decision_model_providers:a.z.array(s.z.string())}),b=(e,t)=>e.model.length-t.model.length||e.model.localeCompare(t.model),_=(e,t,a)=>({row:e,routeOrder:h[e.route],rankInProvider:a.slice(0,t).filter(t=>t.provider===e.provider).length});e.s(["O",0,n,"d",0,c,"Z",0,l,"L",0,o,"B",0,"playground?tab=system-one","F",0,function(e){let t=f(e),a=t.filter(([,e])=>g(e)),s=new Map([...new Set(a.map(([,e])=>e.litellm_provider))].map(e=>{let a=t.filter(([,t])=>t.litellm_provider===e);return[e,{decisionOnly:a.every(([,e])=>g(e))}]}));return{models:new Set(a.map(([e])=>e)),providers:s}},"W",0,(e,t)=>f(e).filter(([,e])=>g(e)).map(([e,a])=>({model:e,provider:a.litellm_provider,route:t?.has(a.litellm_provider)?"decisions":(a.supported_endpoints??["/v1/decisions"]).includes("/v1/decisions")?null===t?"decisions":"needs-upgrade":"self-hosted"})).toSorted(b).map(_).toSorted((e,t)=>e.routeOrder-t.routeOrder||e.rankInProvider-t.rankInProvider||e.row.provider.localeCompare(t.row.provider)).map(({row:e})=>e),"i",0,e=>u(e)?c:e??void 0,"q",0,e=>e.flatMap(e=>e===c?p:[e]),"_",0,u,"r",0,(e,t,a)=>void 0!==t&&e.providers.get(t)?.decisionOnly===!0||a.some(t=>e.models.has(t)),"P",0,e=>{let t=x.safeParse(e);return t.success?new Set(t.data.decision_model_providers):null}])},899426,e=>{let t=e=>e.trim().toLowerCase();function a(e,a){let s=t(e);if(""===s)return!0;let i=a.filter(e=>"string"==typeof e).map(e=>e.toLowerCase());return!!i.some(e=>e.includes(s))||s.split(/\s+/).every(e=>i.some(t=>t.includes(e)))}e.s(["$",0,function(e,t,s){return e.filter(e=>a(t,s(e)))},"h",0,a,"e",0,function(e,a,s){let i=t(a);if(""===i)return[...e];let r=e=>{let t=s(e).toLowerCase();return 1e3*(t===i)+100*!!t.startsWith(i)+(1e3-t.length)};return[...e].sort((e,t)=>r(t)-r(e))}])}],45483,e=>{e.q("/litellm-asset-prefix/_next/static/media/moyai-head.3nauaaw-e7k-n.svg")}]);