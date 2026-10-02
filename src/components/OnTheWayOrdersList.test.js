import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import OnTheWayOrdersList from "./OnTheWayOrdersList.vue";
import * as ordersService from "../services/orders.service";
import * as deliveryService from "../services/delivery.service";

describe("OnTheWayOrdersList", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading message while the orders are being fetched", async () => {
    vi.spyOn(ordersService, "getOrdersByStatus").mockReturnValue(
      new Promise(() => {}),
    );

    const wrapper = mount(OnTheWayOrdersList);

    expect(wrapper.text()).toContain("Cargando pedidos en tránsito");
  });

  it("shows an empty state when there are no orders on the way", async () => {
    vi.spyOn(ordersService, "getOrdersByStatus").mockResolvedValue([]);

    const wrapper = mount(OnTheWayOrdersList);
    await flushPromises();

    expect(wrapper.text()).toContain("No hay pedidos en tránsito ahora mismo.");
  });

  it("shows an error message when the orders fail to load", async () => {
    vi.spyOn(ordersService, "getOrdersByStatus").mockRejectedValue(
      new Error("network error"),
    );

    const wrapper = mount(OnTheWayOrdersList);
    await flushPromises();

    expect(wrapper.find('[role="alert"]').text()).toBe(
      "No se han podido cargar los pedidos en tránsito.",
    );
  });

  it("lists the orders with their payment method and total", async () => {
    vi.spyOn(ordersService, "getOrdersByStatus").mockResolvedValue([
      { id: 12, paymentMethod: "CASH_ON_DELIVERY", total: 21.5 },
    ]);

    const wrapper = mount(OnTheWayOrdersList);
    await flushPromises();

    expect(wrapper.text()).toContain("Pedido #12");
    expect(wrapper.text()).toContain("Efectivo a la entrega");
    expect(wrapper.text()).toContain("21,50");
  });

  it("marks an online-card order as delivered without asking for cash confirmation", async () => {
    vi.spyOn(ordersService, "getOrdersByStatus").mockResolvedValue([
      { id: 12, paymentMethod: "ONLINE_CARD", total: 21.5 },
    ]);
    vi.spyOn(deliveryService, "markOrderAsDelivered").mockResolvedValue({});
    const confirmSpy = vi.spyOn(window, "confirm");

    const wrapper = mount(OnTheWayOrdersList);
    await flushPromises();

    await wrapper.find(".on-the-way-orders__deliver-btn").trigger("click");
    await flushPromises();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(deliveryService.markOrderAsDelivered).toHaveBeenCalledWith(12, {
      cashCollected: false,
    });
    expect(wrapper.text()).toContain("No hay pedidos en tránsito ahora mismo.");
  });

  it("asks for cash confirmation before marking a cash-on-delivery order as delivered", async () => {
    vi.spyOn(ordersService, "getOrdersByStatus").mockResolvedValue([
      { id: 13, paymentMethod: "CASH_ON_DELIVERY", total: 30 },
    ]);
    vi.spyOn(deliveryService, "markOrderAsDelivered").mockResolvedValue({});
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const wrapper = mount(OnTheWayOrdersList);
    await flushPromises();

    await wrapper.find(".on-the-way-orders__deliver-btn").trigger("click");
    await flushPromises();

    expect(window.confirm).toHaveBeenCalled();
    expect(deliveryService.markOrderAsDelivered).toHaveBeenCalledWith(13, {
      cashCollected: true,
    });
  });

  it("does not mark the order as delivered when cash confirmation is declined", async () => {
    vi.spyOn(ordersService, "getOrdersByStatus").mockResolvedValue([
      { id: 13, paymentMethod: "CASH_ON_DELIVERY", total: 30 },
    ]);
    vi.spyOn(deliveryService, "markOrderAsDelivered");
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const wrapper = mount(OnTheWayOrdersList);
    await flushPromises();

    await wrapper.find(".on-the-way-orders__deliver-btn").trigger("click");
    await flushPromises();

    expect(deliveryService.markOrderAsDelivered).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Pedido #13");
  });
});
