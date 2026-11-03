"""The store catalog. The server is the only authority on prices: the client sends a product id, never an amount.

catalog.json is exported from the game by e2e/export-catalog.cjs; a test fails when it drifts from what the game sells.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

_FILE = Path(__file__).with_name("catalog.json")


@dataclass(frozen=True)
class Product:
    id: str
    cat: str
    price: int  # whole shekels, as shown in the game
    name: str
    contents: tuple[str, ...]  # item ids granted; a single item grants itself

    @property
    def amount(self) -> int:
        """Charge in agorot (Stripe's minor unit for ILS)."""
        return self.price * 100

    @property
    def grants(self) -> tuple[str, ...]:
        return self.contents or (self.id,)


def _load() -> dict[str, Product]:
    doc = json.loads(_FILE.read_text(encoding="utf-8"))
    out: dict[str, Product] = {}
    for i in doc["items"]:
        out[i["id"]] = Product(i["id"], i["cat"], int(i["price"]), i["name"], tuple(i["contents"] or ()))
    for p in out.values():  # a bundle may only contain sellable items
        for c in p.contents:
            if c not in out:
                raise RuntimeError(f"catalog: bundle {p.id} contains unknown item {c}")
    return out


PRODUCTS: dict[str, Product] = _load()
CURRENCY = "ils"


def get_product(product_id: str) -> Product | None:
    return PRODUCTS.get(product_id)
