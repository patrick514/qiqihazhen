<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="table-header">
          <span class="title">商品列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>新增商品
          </el-button>
        </div>
      </template>

      <el-table :data="productStore.items" border stripe style="width: 100%">
        <!-- 基础列 -->
        <el-table-column
          prop="name"
          label="商品名称"
          min-width="150"
          fixed="left"
        />
        <el-table-column prop="code" label="商品编码" width="120" />
        <el-table-column prop="price" label="销售单价" width="120">
          <template #default="{ row }"> ¥{{ row.price?.toFixed(2) }} </template>
        </el-table-column>

        <!-- 动态配置列 -->
        <el-table-column
          v-for="field in dynamicFields"
          :key="field.key"
          :prop="field.key"
          :label="field.label"
          min-width="120"
        >
          <template #default="{ row }">
            <span v-if="field.type === 'select'">
              {{ getSelectLabel(field, row[field.key]) }}
            </span>
            <span v-else>{{ row[field.key] }}</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-divider direction="vertical" />
            <el-button link type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="650px"
    >
      <dynamic-form ref="formRef" v-model="formData" :fields="allFields" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { useProductStore, type Product } from "@/stores/product";
import { useFieldConfigStore } from "@/stores/fieldConfig";
import DynamicForm from "@/components/DynamicForm/index.vue";
import { ElMessageBox, ElMessage } from "element-plus";

const productStore = useProductStore();
const configStore = useFieldConfigStore();

// 区分固定字段和动态字段，但在表单中统一处理
const dynamicFields = computed(() => {
  // 过滤掉已经在静态列中展示的基础字段（如果配置中存在的话）
  return configStore.configs.product.filter(
    (f) => !["name", "code", "price"].includes(f.key),
  );
});

const allFields = computed(() => configStore.configs.product);

const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<any>();
const formData = ref<Partial<Product>>({});

const handleCreate = () => {
  isEdit.value = false;
  formData.value = {};
  dialogVisible.value = true;
};

const handleEdit = (row: Product) => {
  isEdit.value = true;
  formData.value = JSON.parse(JSON.stringify(row));
  dialogVisible.value = true;
};

const handleDelete = (row: Product) => {
  ElMessageBox.confirm(`确定删除商品 [${row.name}] 吗？`, "警告", {
    type: "warning",
  }).then(() => {
    productStore.removeItem(row.id);
    ElMessage.success("删除成功");
  });
};

const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  if (isEdit.value) {
    productStore.updateItem(formData.value as Product);
    ElMessage.success("更新成功");
  } else {
    productStore.addItem(formData.value as Product);
    ElMessage.success("添加成功");
  }
  dialogVisible.value = false;
};

const getSelectLabel = (field: any, value: any) => {
  const option = field.options?.find((opt: any) => opt.value === value);
  return option ? option.label : value;
};
</script>

<style scoped lang="scss">
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
