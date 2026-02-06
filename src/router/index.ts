import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("@/layout/MainLayout.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "仪表盘", icon: "Odometer" },
      },
      {
        path: "base",
        name: "BaseInfo",
        meta: { title: "基础资料", icon: "Files" },
        children: [
          {
            path: "product",
            name: "Product",
            component: () => import("@/views/product/index.vue"),
            meta: { title: "商品管理" },
          },
          {
            path: "customer",
            name: "Customer",
            component: () => import("@/views/customer/index.vue"),
            meta: { title: "客户管理" },
          },
          {
            path: "supplier",
            name: "Supplier",
            component: () => import("@/views/supplier/index.vue"),
            meta: { title: "供应商管理" },
          },
        ],
      },
      {
        path: "business",
        name: "Business",
        meta: { title: "业务中心", icon: "Suitcase" },
        children: [
          {
            path: "purchase",
            name: "Purchase",
            component: () => import("@/views/purchase/index.vue"),
            meta: { title: "采购入库" },
          },
          {
            path: "sales",
            name: "Sales",
            component: () => import("@/views/sales/index.vue"),
            meta: { title: "销售出库" },
          },
        ],
      },
      {
        path: "stock",
        name: "Stock",
        component: () => import("@/views/stock/index.vue"),
        meta: { title: "库存查询", icon: "Box" },
      },
      {
        path: "finance",
        name: "Finance",
        component: () => import("@/views/finance/index.vue"),
        meta: { title: "财务流水", icon: "Money" },
      },
      {
        path: "system",
        name: "System",
        meta: { title: "系统设置", icon: "Setting" },
        children: [
          {
            path: "config",
            name: "FieldConfig",
            component: () => import("@/views/setting/index.vue"),
            meta: { title: "字段配置" },
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
