import unittest
from unittest.mock import patch
import httpx
import litellm
from gateway_minimax import handler
from litellm.llms.custom_llm import CustomLLMError


class AdapterTests(unittest.IsolatedAsyncioTestCase):
    async def invoke(self, body, status=200, options=None):
        self.calls = []
        def respond(request):
            self.calls.append(request)
            return httpx.Response(status, json=body)
        original = httpx.AsyncClient
        with patch("gateway_minimax.httpx.AsyncClient", side_effect=lambda **kwargs: original(transport=httpx.MockTransport(respond), **kwargs)):
            return await handler.aimage_generation(model="image-01", prompt="draw a cat", api_key="fixture-key", api_base="https://api.minimax.cn/v1", optional_params=options or {})

    async def test_success_single_post(self):
        result = await self.invoke({"id": "minimax-task-1", "base_resp": {"status_code": 0}, "data": {"image_base64": ["AQID"]}}, options={"n": 1, "size": "1280x720"})
        self.assertEqual(result.data[0].b64_json, "AQID")
        self.assertEqual(result.model_dump()["provider_request_id"], "minimax-task-1")
        self.assertEqual(len(self.calls), 1)
        import json
        body = json.loads(self.calls[0].content)
        self.assertEqual(body["n"], 1)
        self.assertEqual(body["width"], 1280)
        self.assertEqual(body["response_format"], "base64")

    async def test_business_rejections_are_failed_sanitized_calls(self):
        for code, expected in [(1004, 401), (1008, 429), (1027, 422), (2013, 400), (2022, 404), (9999, 502)]:
            with self.assertRaises(CustomLLMError) as error:
                await self.invoke({"base_resp": {"status_code": code, "status_msg": "private-upstream-body"}})
            self.assertEqual(error.exception.status_code, expected)
            self.assertNotIn("private-upstream", str(error.exception))
            self.assertEqual(len(self.calls), 1)

    async def test_malformed_and_server_failure_remain_unknown(self):
        for body, status in [(None, 200), ({}, 200), ({"base_resp": {"status_code": 0}, "data": {}}, 200), ({}, 503)]:
            with self.assertRaises(CustomLLMError) as error:
                await self.invoke(body, status)
            self.assertEqual(error.exception.status_code, 502)
            self.assertEqual(len(self.calls), 1)

    async def test_invalid_size_or_count_never_calls_upstream(self):
        for options in [{"n": 2}, {"size": "513x1024"}]:
            with self.assertRaises(CustomLLMError) as error:
                await self.invoke({}, options=options)
            self.assertEqual(error.exception.status_code, 400)
            self.assertEqual(self.calls, [])

    async def test_litellm_pipeline_preserves_size_and_rejects_count(self):
        from litellm.utils import custom_llm_setup
        litellm.custom_provider_map = [{"provider": "minimax_image", "custom_handler": handler}]
        custom_llm_setup()
        calls = []
        def respond(request):
            import json
            calls.append(json.loads(request.content))
            return httpx.Response(200, json={"base_resp": {"status_code": 0}, "data": {"image_base64": ["AQID"]}})
        original = httpx.AsyncClient
        with patch("gateway_minimax.httpx.AsyncClient", side_effect=lambda **kwargs: original(transport=httpx.MockTransport(respond), **kwargs)):
            await litellm.aimage_generation(model="minimax_image/image-01", prompt="fixture", api_key="fixture-key", api_base="https://api.minimax.cn/v1", n=1, size="1280x720", num_retries=0)
            self.assertEqual(calls[0]["width"], 1280)
            self.assertEqual(calls[0]["height"], 720)
            with self.assertRaises(litellm.BadRequestError):
                await litellm.aimage_generation(model="minimax_image/image-01", prompt="fixture", api_key="fixture-key", api_base="https://api.minimax.cn/v1", n=2, num_retries=0)
            self.assertEqual(len(calls), 1)


if __name__ == "__main__":
    unittest.main()
