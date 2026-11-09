import json
from pathlib import Path
import unittest

import litellm
from litellm.types.utils import Usage, PromptTokensDetailsWrapper
from litellm.litellm_core_utils.llm_cost_calc.utils import generic_cost_per_token, CostCalculatorUtils
from gateway_pricing import PRICING, tracker


class PricingTests(unittest.TestCase):
    def cost(self, model, total_input, output, cached=0, written=0, tier=None):
        table = PRICING["models"][model]
        usage = Usage(prompt_tokens=total_input, completion_tokens=output,
                      prompt_tokens_details=PromptTokensDetailsWrapper(cached_tokens=cached, cache_creation_tokens=written))
        return sum(generic_cost_per_token(model="minimax/"+model, custom_llm_provider="minimax", usage=usage, model_info=table, service_tier=tier))

    def test_cached_tokens_are_not_charged_twice(self):
        for name in ["MiniMax-M3", "MiniMax-M3.1-Flash"]:
            p=PRICING["models"][name]
            expected = 100*p["input_cost_per_token"] + 900*p["cache_read_input_token_cost"] + 20*p["output_cost_per_token"]
            self.assertAlmostEqual(self.cost(name,1000,20,900),expected,places=12)

    def test_cache_creation_has_no_surcharge(self):
        self.assertAlmostEqual(self.cost("MiniMax-M3",1000,10,0,800),self.cost("MiniMax-M3",1000,10),places=12)

    def test_full_request_changes_tier_above_boundary(self):
        p=PRICING["models"]["MiniMax-M3"]
        for count in [512000,512001,700000]:
            suffix="_above_512k_tokens" if count>512000 else ""
            expected=(count-100000)*p["input_cost_per_token"+suffix]+100000*p["cache_read_input_token_cost"+suffix]+20*p["output_cost_per_token"+suffix]
            self.assertAlmostEqual(self.cost("MiniMax-M3",count,20,100000),expected,places=12)
            self.assertAlmostEqual(self.cost("MiniMax-M3",count,20,100000,tier="priority"),expected*1.5,places=12)

    def test_router_preserves_configured_long_context_rates(self):
        from litellm.router import Router
        from litellm.types.router import Deployment, LiteLLM_Params, ModelInfo, updateDeployment

        definition = PRICING["models"]["MiniMax-M3"]
        rates = {key: value for key, value in definition.items() if key != "deployment_id"}
        patch = updateDeployment(litellm_params=rates)
        deployment = Deployment(
            model_name="MiniMax-M3",
            litellm_params=LiteLLM_Params(
                model="minimax/MiniMax-M3", **patch.litellm_params.model_dump(exclude_none=True)
            ),
            model_info=ModelInfo(id=definition["deployment_id"]),
        )
        runtime_prices = Router._deployment_model_cost_payload(deployment)
        usage = Usage(
            prompt_tokens=700000,
            completion_tokens=100,
            prompt_tokens_details=PromptTokensDetailsWrapper(cached_tokens=100000, cache_creation_tokens=200000),
        )
        for tier in [None, "priority"]:
            expected = sum(generic_cost_per_token(
                model="minimax/MiniMax-M3", custom_llm_provider="minimax", usage=usage,
                model_info=rates, service_tier=tier,
            ))
            actual = sum(generic_cost_per_token(
                model="minimax/MiniMax-M3", custom_llm_provider="minimax", usage=usage,
                model_info=runtime_prices, service_tier=tier,
            ))
            self.assertAlmostEqual(actual, expected, places=12)

    def test_images_use_returned_count_and_ignore_resolution_for_price(self):
        litellm._custom_providers = list(set(litellm._custom_providers) | {"minimax_image"})
        price=PRICING["models"]["image-01"]["output_cost_per_image"]
        for count in [0,1,2]:
            response=litellm.ImageResponse(data=[{"b64_json":"AQID"}]*count)
            for size in ["1024x1024","1280x720"]:
                cost=CostCalculatorUtils.route_image_generation_cost_calculator(model="image-01",custom_llm_provider="minimax_image",completion_response=response,n=1,size=size,model_info={"output_cost_per_image":price})
                self.assertAlmostEqual(cost,count*price,places=12)


class MetadataTests(unittest.IsolatedAsyncioTestCase):
    async def test_currency_is_attached_and_unpriced_models_are_blocked(self):
        from fastapi import HTTPException
        for key in ["metadata","litellm_metadata"]:
            result=await tracker.async_pre_call_hook(None,None,{"model":"MiniMax-M3",key:{"spend_logs_metadata":{"attemptId":"a"}}},"completion")
            self.assertEqual(result[key]["spend_logs_metadata"]["attemptId"],"a")
            self.assertEqual(result[key]["spend_logs_metadata"]["billing_currency"],"CNY")
        with self.assertRaises(HTTPException):
            await tracker.async_pre_call_hook(None,None,{"model":"unpriced"},"completion")


if __name__ == "__main__":
    unittest.main()
