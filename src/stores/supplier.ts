import { defineStore } from "pinia";
import { ref, watch } from "vue";

export interface Supplier {
  id: string;
  company: string;
  contact: string;
  [key: string]: any;
}

export const useSupplierStore = defineStore("supplier", () => {
  const items = ref<Supplier[]>(
    JSON.parse(localStorage.getItem("data_suppliers") || "[]"),
  );

  if (items.value.length === 0) {
    items.value = [
      {
        id: "1",
        company: "黑龙江牧业有限公司",
        contact: "王经理",
        type: "factory",
      },
    ];
  }

  watch(
    items,
    (newVal) => {
      localStorage.setItem("data_suppliers", JSON.stringify(newVal));
    },
    { deep: true },
  );

  const addItem = (item: Supplier) => {
    items.value.push({ ...item, id: Date.now().toString() });
  };

  const updateItem = (item: Supplier) => {
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
