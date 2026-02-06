import { defineStore } from "pinia";
import { ref, watch } from "vue";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: FieldOption[];
  required?: boolean;
  span?: number;
}

export type ModuleName = "product" | "customer" | "supplier";

const DEFAULT_FIELDS: Record<ModuleName, FieldConfig[]> = {
  product: [
    { key: "name", label: "商品名称", type: "text", required: true },
    { key: "code", label: "商品编码", type: "text", required: true },
    { key: "price", label: "销售单价", type: "number" },
    {
      key: "category",
      label: "商品分类",
      type: "select",
      options: [
        { label: "食品", value: "food" },
        { label: "数码", value: "digital" },
      ],
    },
  ],
  customer: [
    { key: "name", label: "客户名称", type: "text", required: true },
    { key: "phone", label: "联系电话", type: "text" },
    { key: "address", label: "收货地址", type: "text" },
  ],
  supplier: [
    { key: "company", label: "供应商公司", type: "text", required: true },
    { key: "contact", label: "联系人", type: "text" },
    {
      key: "type",
      label: "供应类型",
      type: "select",
      options: [
        { label: "厂家", value: "factory" },
        { label: "代理商", value: "agent" },
      ],
    },
  ],
};

export const useFieldConfigStore = defineStore("fieldConfig", () => {
  const configs = ref<Record<ModuleName, FieldConfig[]>>(
    JSON.parse(
      localStorage.getItem("field_configs") || JSON.stringify(DEFAULT_FIELDS),
    ),
  );

  watch(
    configs,
    (newVal) => {
      localStorage.setItem("field_configs", JSON.stringify(newVal));
    },
    { deep: true },
  );

  const addField = (module: ModuleName, field: FieldConfig) => {
    configs.value[module].push(field);
  };

  const removeField = (module: ModuleName, key: string) => {
    configs.value[module] = configs.value[module].filter((f) => f.key !== key);
  };

  const updateField = (module: ModuleName, field: FieldConfig) => {
    const index = configs.value[module].findIndex((f) => f.key === field.key);
    if (index !== -1) {
      configs.value[module][index] = field;
    }
  };

  return {
    configs,
    addField,
    removeField,
    updateField,
  };
});
