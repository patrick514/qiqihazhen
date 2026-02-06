<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="table-header">
          <span class="title">供应商列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>新增供应商
          </el-button>
        </div>
      </template>

      <el-table :data="supplierStore.items" border stripe style="width: 100%">
        <el-table-column
          prop="company"
          label="供应商公司"
          min-width="200"
          fixed="left"
        />
        <el-table-column prop="contact" label="联系人" width="120" />

        <!-- 动态配置列 -->
        <el-table-column
          v-for="field in dynamicFields"
          :key="field.key"
          :prop="field.key"
          :label="field.label"
          min-width="150"
        >
          <template #default="{ row }">
            <span v-if="field.type === 'select'">
              {{ getSelectLabel(field, row[field.key]) }}
            </span>
            <span v-else>{{ row[field.key] }}</span>
          </template>
        </el-table-column>

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

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑供应商' : '新增供应商'"
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
import { useSupplierStore, type Supplier } from "@/stores/supplier";
import { useFieldConfigStore } from "@/stores/fieldConfig";
import DynamicForm from "@/components/DynamicForm/index.vue";
import { ElMessageBox, ElMessage } from "element-plus";

const supplierStore = useSupplierStore();
const configStore = useFieldConfigStore();

const dynamicFields = computed(() => {
  return configStore.configs.supplier.filter(
    (f) => !["company", "contact"].includes(f.key),
  );
});

const allFields = computed(() => configStore.configs.supplier);

const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<any>();
const formData = ref<Partial<Supplier>>({});

const handleCreate = () => {
  isEdit.value = false;
  formData.value = {};
  dialogVisible.value = true;
};

const handleEdit = (row: Supplier) => {
  isEdit.value = true;
  formData.value = JSON.parse(JSON.stringify(row));
  dialogVisible.value = true;
};

const handleDelete = (row: Supplier) => {
  ElMessageBox.confirm(`确定删除供应商 [${row.company}] 吗？`, "警告", {
    type: "warning",
  }).then(() => {
    supplierStore.removeItem(row.id);
    ElMessage.success("删除成功");
  });
};

const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  if (isEdit.value) {
    supplierStore.updateItem(formData.value as Supplier);
    ElMessage.success("更新成功");
  } else {
    supplierStore.addItem(formData.value as Supplier);
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
