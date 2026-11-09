import json
from pathlib import Path

from fastapi import HTTPException
from litellm.integrations.custom_logger import CustomLogger

PRICING = json.loads(Path(__file__).with_name("pricing.json").read_text(encoding="utf-8"))


class GatewayPricing(CustomLogger):
    async def async_pre_call_hook(self, user_api_key_dict, cache, data, call_type):
        if data.get("model") not in PRICING["models"]:
            raise HTTPException(status_code=400, detail="This CNY gateway requires an explicitly configured CNY model price")
        metadata_key = "litellm_metadata" if "litellm_metadata" in data else "metadata"
        metadata = data.get(metadata_key) or {}
        data[metadata_key] = {
            **metadata,
            "spend_logs_metadata": {
                **(metadata.get("spend_logs_metadata") or {}),
                "billing_currency": PRICING["currency"],
                "pricing_version": PRICING["version"],
                "pricing_source": PRICING["source"],
            },
        }
        return data


tracker = GatewayPricing()
