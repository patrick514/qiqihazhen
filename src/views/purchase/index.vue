<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">采购入库单</span>
          <el-tag type="info">入库流程</el-tag>
        </div>
      </template>

      <!-- 顶部基础信息 -->
      <el-form :model="orderForm" label-width="100px" inline>
        <el-form-item label="选择供应商" required>
          <el-select
            v-model="orderForm.supplierId"
            placeholder="搜索/选择供应商"
            filterable
            style="width: 250px"
          >
            <el-option
              v-for="s in supplierStore.items"
              :key="s.id"
              :label="s.company"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入库日期" required>
          <el-date-picker
            v-model="orderForm.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="table-actions">
        <el-button type="success" plain @click="showProductSelect = true">
          <el-icon><Plus /></el-icon>选择待入库商品
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
        <el-table-column label="采购单价" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.price"
              :precision="2"
              :step="0.1"
              controls-position="right"
              style="width: 130px"
            />
          </template>
        </el-table-column>
        <el-table-column label="入库数量" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.quantity"
              :min="1"
              controls-position="right"
              style="width: 130px"
            />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            <span class="text-primary"
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

      <div class="footer-section">
        <div class="note-area">
          <el-input
            v-model="orderForm.note"
            type="textarea"
            placeholder="采购备注信息..."
            :rows="3"
            style="width: 400px"
          />
        </div>
        <div class="summary-area">
          <div class="total-row">
            <span>采购总额：</span>
            <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
          <div class="submit-btn">
            <el-button
              type="primary"
              size="large"
              @click="submitOrder"
              :disabled="!isReady"
            >
              确认商品入库
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="showProductSelect" title="选择商品" width="800px">
      <el-table
        :data="productStore.items"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="code" label="编码" />
        <el-table-column prop="stock" label="当前库存" />
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
import { useSupplierStore } from "@/stores/supplier";
import { useOrderStore, type OrderItem } from "@/stores/order";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();
const productStore = useProductStore();
const supplierStore = useSupplierStore();
const orderStore = useOrderStore();

const orderForm = ref({
  supplierId: "",
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
  return orderForm.value.supplierId && selectedItems.value.length > 0;
});

const handleSelectionChange = (val: any[]) => {
  selectedProducts.value = val;
};

const confirmAddProducts = () => {
  selectedProducts.value.forEach((p) => {
    if (!selectedItems.value.find((item) => item.id === p.id)) {
      selectedItems.value.push({
        ...p,
        quantity: 1,
        price: 0, // 采购价默认为0
        subtotal: 0,
      });
    }
  });
  showProductSelect.value = false;
};

const removeItem = (index: number) => {
  selectedItems.value.splice(index, 1);
};

const submitOrder = async () => {
  const supplier = supplierStore.items.find(
    (s) => s.id === orderForm.value.supplierId,
  );
  if (!supplier) return;

  try {
    await ElMessageBox.confirm(
      "确认入库吗？提交后将增加商品库存。",
      "操作提示",
      {
        type: "info",
      },
    );

    const orderItems: OrderItem[] = selectedItems.value.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    // 1. 增加库存
    selectedItems.value.forEach((item) => {
      productStore.updateStock(item.id, item.quantity);
    });

    // 2. 存入记录
    orderStore.addOrder({
      id: "PO" + Date.now(),
      type: "purchase",
      targetName: supplier.company,
      date: orderForm.value.date || "",
      items: orderItems,
      totalAmount: totalAmount.value,
      note: orderForm.value.note,
    });

    ElMessage.success("采购入库成功！库存已同步更新。");
    router.push("/dashboard");
  } catch (e) {}
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
        color: #1890ff;
        margin-left: 10px;
      }
    }
  }
}

.text-primary {
  color: #1890ff;
  font-weight: bold;
}
</style>
