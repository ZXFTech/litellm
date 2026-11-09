"""MiniMax image-01 through LiteLLM's standard image endpoint, one POST per call."""
import json
import re
import time
from urllib.parse import urlparse

import httpx
from litellm import CustomLLM, ImageResponse
from litellm.llms.custom_llm import CustomLLMError


class MiniMaxImage(CustomLLM):
    async def aimage_generation(self, model, prompt, model_response=None, api_key=None,
                                api_base=None, optional_params=None, logging_obj=None,
                                timeout=None, client=None, **kwargs):
        options = optional_params or {}
        base = (api_base or "").rstrip("/")
        parsed = urlparse(base)
        if parsed.scheme != "https" or parsed.hostname not in {"api.minimax.cn", "api.minimax.io"} or parsed.path != "/v1" or parsed.query or parsed.fragment or parsed.username or parsed.password or parsed.port not in {None, 443}:
            raise CustomLLMError(status_code=400, message="MiniMax image endpoint is invalid")
        if model != "image-01" or not api_key or not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 1500 or options.get("n", 1) != 1:
            raise CustomLLMError(status_code=400, message="MiniMax image request is invalid")
        payload = {"model": model, "prompt": prompt, "n": 1, "response_format": "base64"}
        size = options.get("size")
        if size:
            try:
                width, height = map(int, size.split("x"))
                assert all(512 <= v <= 2048 and v % 8 == 0 for v in [width, height])
            except (ValueError, AttributeError, AssertionError):
                raise CustomLLMError(status_code=400, message="MiniMax image dimensions are invalid") from None
            payload.update(width=width, height=height)
        try:
            async with httpx.AsyncClient(timeout=280, follow_redirects=False) as transport:
                async with transport.stream("POST", base + "/image_generation", headers={"Authorization": "Bearer " + api_key}, json=payload) as response:
                    if response.status_code != 200:
                        status = response.status_code if response.status_code in {400, 401, 403, 404, 413, 422, 429} else 502
                        raise CustomLLMError(status_code=status, message="MiniMax rejected the image request" if status < 500 else "MiniMax image delivery is uncertain")
                    body = bytearray()
                    async for chunk in response.aiter_bytes():
                        body.extend(chunk)
                        if len(body) > 128 * 1024 * 1024:
                            raise CustomLLMError(status_code=502, message="MiniMax image response exceeds limit")
            raw = json.loads(body)
            code = raw.get("base_resp", {}).get("status_code")
            if code != 0:
                status = {1004: 401, 1002: 429, 1008: 429, 2022: 404, 1026: 422, 1027: 422, 2013: 400, 2014: 400}.get(code, 502)
                message = "MINIMAX_CONTENT_REJECTED" if code in {1026, 1027} else "MiniMax rejected the image request" if status < 500 else "MiniMax image delivery is uncertain"
                raise CustomLLMError(status_code=status, message=message)
            data = raw.get("data", {})
            values = data.get("image_base64")
            field = "b64_json"
            if not isinstance(values, list):
                values, field = data.get("image_urls"), "url"
            if not isinstance(values, list) or not values or any(not isinstance(value, str) for value in values):
                raise ValueError()
            result = ImageResponse(created=int(time.time()), data=[{field: value} for value in values])
            result.usage.generated_images = len(values)
            request_id = raw.get("id")
            if isinstance(request_id, str) and re.fullmatch(r"[a-zA-Z0-9_.:-]{1,200}", request_id):
                result.provider_request_id = request_id
            return result
        except CustomLLMError:
            raise
        except httpx.TimeoutException:
            raise CustomLLMError(status_code=504, message="MiniMax image delivery is uncertain") from None
        except (httpx.HTTPError, ValueError, TypeError, AttributeError):
            raise CustomLLMError(status_code=502, message="MiniMax image response is incomplete") from None


handler = MiniMaxImage()
