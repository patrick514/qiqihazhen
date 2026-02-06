<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">动态字段配置</span>
          <p class="subtitle">
            在此配置各业务模块的可选属性。配置更改后，商品、客户等管理页面将自动调整表单和表格列。
          </p>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="商品模块字段" name="product">
          <field-table module="product" />
        </el-tab-pane>
        <el-tab-pane label="客户模块字段" name="customer">
          <field-table module="customer" />
        </el-tab-pane>
        <el-tab-pane label="供应商模块字段" name="supplier">
          <field-table module="supplier" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FieldTable from "./components/FieldTable.vue";

const activeTab = ref("product");
</script>

<style scoped lang="scss">
.card-header {
  .title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
  }
  .subtitle {
    margin: 8px 0 0;
    font-size: 13px;
    color: #909399;
  }
}

:deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
  .el-tabs__content {
    padding: 20px 0;
  }
}
</style>
