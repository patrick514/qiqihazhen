<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">实时库存查询</span>
          <el-button
            type="primary"
            link
            @click="productStore.items.forEach((p) => (p.stock = 100))"
          >
            一键补货 (演示用)
          </el-button>
        </div>
      </template>

      <el-table :data="productStore.items" border stripe>
        <el-table-column prop="code" label="商品编码" width="120" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="stock" label="当前库存" width="150">
          <template #default="{ row }">
            <el-tag :type="row.stock < 10 ? 'danger' : 'success'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="参考售价" width="150">
          <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column
          label="库存市值"
          width="150"
          sortable
          :sort-method="sortStockValue"
        >
          <template #default="{ row }">
            ¥{{ (row.stock * row.price).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useProductStore, type Product } from "@/stores/product";

const productStore = useProductStore();

const sortStockValue = (a: Product, b: Product) => {
  return a.stock * a.price - b.stock * b.price;
};
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
