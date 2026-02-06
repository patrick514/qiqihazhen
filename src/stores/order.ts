import { defineStore } from "pinia";
import { ref, watch, computed } from "vue";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  type: "sale" | "purchase";
  targetName: string; // 客户或供应商名
  date: string;
  items: OrderItem[];
  totalAmount: number;
  note: string;
}

export const useOrderStore = defineStore("order", () => {
  const orders = ref<Order[]>(
    JSON.parse(localStorage.getItem("data_orders") || "[]"),
  );

  watch(
    orders,
    (newVal) => {
      localStorage.setItem("data_orders", JSON.stringify(newVal));
    },
    { deep: true },
  );

  const addOrder = (order: Order) => {
    orders.value.unshift(order);
  };

  const todayRevenue = computed(() => {
    const today = new Date().toISOString().split("T")[0];
    return orders.value
      .filter((o) => o.type === "sale" && o.date === today)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  });

  const monthlyOrderCount = computed(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return orders.value.filter((o) => o.date.startsWith(currentMonth)).length;
  });

  return { orders, addOrder, todayRevenue, monthlyOrderCount };
});
