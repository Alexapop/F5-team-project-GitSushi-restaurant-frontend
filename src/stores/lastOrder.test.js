import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useLastOrderStore } from "./lastOrder";

describe("useLastOrderStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("starts with no order", () => {
    const lastOrderStore = useLastOrderStore();

    expect(lastOrderStore.order).toBeNull();
  });

  it("stores the confirmed order", () => {
    const lastOrderStore = useLastOrderStore();
    const order = { id: 1, total: 24.4, paymentStatus: "PENDING_CASH" };

    lastOrderStore.setOrder(order);

    expect(lastOrderStore.order).toEqual(order);
  });

  it("overwrites a previously stored order", () => {
    const lastOrderStore = useLastOrderStore();
    lastOrderStore.setOrder({ id: 1, total: 24.4 });

    lastOrderStore.setOrder({ id: 2, total: 8.5 });

    expect(lastOrderStore.order).toEqual({ id: 2, total: 8.5 });
  });

  it("clears the stored order", () => {
    const lastOrderStore = useLastOrderStore();
    lastOrderStore.setOrder({ id: 1, total: 24.4 });

    lastOrderStore.clearOrder();

    expect(lastOrderStore.order).toBeNull();
  });
});
