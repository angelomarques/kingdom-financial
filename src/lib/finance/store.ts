import { createD1Store, d1ConfigFromEnv } from "./d1-store";
import { createMockStore } from "./mock-store";
import type { LedgerStore, StoreSource } from "./types";

let store: LedgerStore | null = null;
let source: StoreSource = "mock";

export function getStoreSource(): StoreSource {
  resolveStore();
  return source;
}

export function getStore(): LedgerStore {
  return resolveStore();
}

function resolveStore(): LedgerStore {
  if (store) {
    return store;
  }

  const d1 = d1ConfigFromEnv();
  if (d1) {
    store = createD1Store(d1);
    source = "d1";
    return store;
  }

  store = createMockStore();
  source = "mock";
  return store;
}
