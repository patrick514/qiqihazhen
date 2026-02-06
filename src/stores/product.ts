import { defineStore } from "pinia";
import { ref, watch, computed } from "vue";

export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  stock: number; // 当前库存
  [key: string]: any; // 支持动态属性
}

export const useProductStore = defineStore("product", () => {
  const items = ref<Product[]>(
    JSON.parse(localStorage.getItem("data_products") || "[]"),
  );

  // 初始化一些假数据
  if (items.value.length === 0) {
    items.value = [
      {
        id: "1",
        name: "齐齐哈尔烤肉",
        code: "SKU001",
        price: 88,
        stock: 100,
        category: "food",
      },
      {
        id: "2",
        name: "特级五花肉",
        code: "SKU002",
        price: 45,
        stock: 200,
        category: "food",
      },
    ];
  }

  watch(
    items,
    (newVal) => {
      localStorage.setItem("data_products", JSON.stringify(newVal));
    },
    { deep: true },
  );

  const addItem = (item: Product) => {
    items.value.push({ ...item, id: Date.now().toString() });
  };

  const updateItem = (item: Product) => {
    const index = items.value.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      items.value[index] = { ...item };
    }
  };

  const removeItem = (id: string) => {
    items.value = items.value.filter((i) => i.id !== id);
  };

  const updateStock = (productId: string, delta: number) => {
    const product = items.value.find((i) => i.id === productId);
    if (product) {
      product.stock += delta;
    }
  };

  const lowStockCount = computed(() => {
    return items.value.filter((i) => i.stock < 10).length;
  });

  return { items, addItem, updateItem, removeItem, updateStock, lowStockCount };
});
