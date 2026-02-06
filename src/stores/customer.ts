import { defineStore } from "pinia";
import { ref, watch } from "vue";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  [key: string]: any;
}

export const useCustomerStore = defineStore("customer", () => {
  const items = ref<Customer[]>(
    JSON.parse(localStorage.getItem("data_customers") || "[]"),
  );

  if (items.value.length === 0) {
    items.value = [
      {
        id: "1",
        name: "张三",
        phone: "13800138000",
        address: "齐齐哈尔市龙沙区",
      },
    ];
  }

  watch(
    items,
    (newVal) => {
      localStorage.setItem("data_customers", JSON.stringify(newVal));
    },
    { deep: true },
  );

  const addItem = (item: Customer) => {
    items.value.push({ ...item, id: Date.now().toString() });
  };

  const updateItem = (item: Customer) => {
    const index = items.value.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      items.value[index] = { ...item };
    }
  };

  const removeItem = (id: string) => {
    items.value = items.value.filter((i) => i.id !== id);
  };

  return { items, addItem, updateItem, removeItem };
});
