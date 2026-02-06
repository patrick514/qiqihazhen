<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">销售出库单</span>
          <el-tag type="warning">草稿状态</el-tag>
        </div>
      </template>

      <!-- 顶部基础信息 -->
      <el-form :model="orderForm" label-width="100px" inline>
        <el-form-item label="选择客户" required>
          <el-select
            v-model="orderForm.customerId"
            placeholder="搜索/选择客户"
            filterable
            style="width: 250px"
          >
            <el-option
              v-for="c in customerStore.items"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出库日期" required>
          <el-date-picker
            v-model="orderForm.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>

      <el-divider />

      <!-- 中间商品明细 -->
      <div class="table-actions">
        <el-button type="primary" plain @click="showProductSelect = true">
          <el-icon><Plus /></el-icon>添加商品
        </el-button>
      </div>

      <el-table
        :data="selectedItems"
        border
        stripe
        style="width: 100%; margin-top: 15px"
      >
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="stock" label="当前库存" width="100" />
        <el-table-column label="销售单价" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.price"
              :precision="2"
              :step="0.1"
              controls-position="right"
              style="width: 130px"
              @change="calculateTotal"
            />
          </template>
        </el-table-column>
        <el-table-column label="销售数量" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.quantity"
              :min="1"
              :max="row.stock"
              controls-position="right"
              style="width: 130px"
              @change="calculateTotal"
            />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            <span class="text-danger"
              >¥{{ (row.price * row.quantity).toFixed(2) }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ $index }">
            <el-button link type="danger" @click="removeItem($index)"
              >移除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部统计 -->
      <div class="footer-section">
        <div class="note-area">
          <el-input
            v-model="orderForm.note"
            type="textarea"
            placeholder="订单备注信息..."
            :rows="3"
            style="width: 400px"
          />
        </div>
        <div class="summary-area">
          <div class="total-row">
            <span>合计金额：</span>
            <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
          <div class="submit-btn">
            <el-button
              type="success"
              size="large"
              @click="submitOrder"
              :disabled="!isReady"
            >
              确认出库并提交
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 商品选择弹窗 -->
    <el-dialog v-model="showProductSelect" title="添加商品" width="800px">
      <el-table
        :data="productStore.items"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="code" label="编码" />
        <el-table-column prop="stock" label="库存" />
        <el-table-column prop="price" label="标准售价">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showProductSelect = false">取消</el-button>
        <el-button type="primary" @click="confirmAddProducts"
          >确认添加</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { useProductStore } from "@/stores/product";
import { useCustomerStore } from "@/stores/customer";
import { useOrderStore, type OrderItem } from "@/stores/order";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();
const productStore = useProductStore();
const customerStore = useCustomerStore();
const orderStore = useOrderStore();

const orderForm = ref({
  customerId: "",
  date: new Date().toISOString().split("T")[0],
  note: "",
});

const showProductSelect = ref(false);
const selectedProducts = ref<any[]>([]);
const selectedItems = ref<any[]>([]);

const totalAmount = computed(() => {
  return selectedItems.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
});

const isReady = computed(() => {
  return orderForm.value.customerId && selectedItems.value.length > 0;
});

const handleSelectionChange = (val: any[]) => {
  selectedProducts.value = val;
};

const confirmAddProducts = () => {
  selectedProducts.value.forEach((p) => {
    // 检查是否已存在
    if (!selectedItems.value.find((item) => item.id === p.id)) {
      selectedItems.value.push({
        ...p,
        quantity: 1, // 默认数量 1
        subtotal: p.price,
      });
    }
  });
  showProductSelect.value = false;
  calculateTotal();
};

const removeItem = (index: number) => {
  selectedItems.value.splice(index, 1);
  calculateTotal();
};

const calculateTotal = () => {
  // 仅为了触发视图更新或处理额外逻辑
};

const submitOrder = async () => {
  const customer = customerStore.items.find(
    (c) => c.id === orderForm.value.customerId,
  );
  if (!customer) return;

  try {
    await ElMessageBox.confirm(
      "确认提交此销售订单吗？提交后将扣减库存。",
      "确认操作",
      {
        type: "success",
      },
    );

    const orderItems: OrderItem[] = selectedItems.value.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    // 1. 扣减库存
    selectedItems.value.forEach((item) => {
      productStore.updateStock(item.id, -item.quantity);
    });

    // 2. 存入订单历史
    orderStore.addOrder({
      id: "SO" + Date.now(),
      type: "sale",
      targetName: customer.name,
      date: orderForm.value.date || "",
      items: orderItems,
      totalAmount: totalAmount.value,
      note: orderForm.value.note,
    });

    ElMessage.success("销售订单提交成功！库存已更新。");
    router.push("/dashboard");
  } catch (e) {
    // 取消提交
  }
};
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    font-size: 18px;
    font-weight: bold;
  }
}

.table-actions {
  display: flex;
  margin-bottom: 5px;
}

.footer-section {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  .summary-area {
    text-align: right;
    .total-row {
      margin-bottom: 15px;
      font-size: 16px;
      color: #606266;
      .total-amount {
        font-size: 28px;
        font-weight: bold;
        color: #f5222d;
        margin-left: 10px;
      }
    }
  }
}

.text-danger {
  color: #f5222d;
  font-weight: bold;
}
</style>
