<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">财务流水 / 业务单据历史</span>
          <div class="filter-tools">
            <el-input
              v-model="searchQuery"
              placeholder="搜索单据号/往来对象/备注"
              size="small"
              clearable
              prefix-icon="Search"
              style="margin-right: 15px; width: 220px"
            />
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              value-format="YYYY-MM-DD"
              style="margin-right: 15px; width: 240px"
            />
            <el-radio-group v-model="filterType" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="sale">仅销售</el-radio-button>
              <el-radio-button label="purchase">仅采购</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <el-table :data="filteredOrders" border stripe>
        <el-table-column prop="id" label="单据编号" width="180" />
        <el-table-column prop="date" label="业务日期" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'sale' ? 'success' : 'primary'">
              {{ row.type === "sale" ? "销售出库" : "采购入库" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="往来对象" min-width="150" />
        <el-table-column prop="totalAmount" label="总金额" width="150">
          <template #default="{ row }">
            <span :class="row.type === 'sale' ? 'amount-in' : 'amount-out'">
              {{ row.type === "sale" ? "+" : "-" }} ¥{{
                row.totalAmount.toFixed(2)
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="详情" type="expand">
          <template #default="{ row }">
            <div style="padding: 10px 50px">
              <el-table :data="row.items" size="small" border>
                <el-table-column prop="name" label="商品" />
                <el-table-column prop="price" label="单价" />
                <el-table-column prop="quantity" label="数量" />
                <el-table-column prop="subtotal" label="小计" />
              </el-table>
              <p v-if="row.note" style="margin-top: 10px; color: #909399">
                备注: {{ row.note }}
              </p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useOrderStore } from "@/stores/order";

const orderStore = useOrderStore();
const filterType = ref("all");
const dateRange = ref<[string, string] | null>(null);
const searchQuery = ref("");

const filteredOrders = computed(() => {
  return orderStore.orders.filter((o) => {
    // 1. 类型筛选
    const matchType = filterType.value === "all" || o.type === filterType.value;

    // 2. 日期筛选
    let matchDate = true;
    if (dateRange.value && dateRange.value.length === 2) {
      const [start, end] = dateRange.value;
      matchDate = o.date >= start && o.date <= end;
    }

    // 3. 关键字搜索
    let matchQuery = true;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      matchQuery =
        o.id.toLowerCase().includes(q) ||
        o.targetName.toLowerCase().includes(q) ||
        !!(o.note && o.note.toLowerCase().includes(q));
    }

    return matchType && matchDate && matchQuery;
  });
});
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
  .filter-tools {
    display: flex;
    align-items: center;
  }
}

.amount-in {
  color: #67c23a;
  font-weight: bold;
}

.amount-out {
  color: #f56c6c;
  font-weight: bold;
}
</style>
