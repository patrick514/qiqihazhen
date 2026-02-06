<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="table-header">
          <span class="title">客户列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>新增客户
          </el-button>
        </div>
      </template>

      <el-table :data="customerStore.items" border stripe style="width: 100%">
        <el-table-column
          prop="name"
          label="客户名称"
          min-width="150"
          fixed="left"
        />
        <el-table-column prop="phone" label="联系电话" width="150" />

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
      :title="isEdit ? '编辑客户' : '新增客户'"
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
import { useCustomerStore, type Customer } from "@/stores/customer";
import { useFieldConfigStore } from "@/stores/fieldConfig";
import DynamicForm from "@/components/DynamicForm/index.vue";
import { ElMessageBox, ElMessage } from "element-plus";

const customerStore = useCustomerStore();
const configStore = useFieldConfigStore();

const dynamicFields = computed(() => {
  return configStore.configs.customer.filter(
    (f) => !["name", "phone"].includes(f.key),
  );
});

const allFields = computed(() => configStore.configs.customer);

const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<any>();
const formData = ref<Partial<Customer>>({});

const handleCreate = () => {
  isEdit.value = false;
  formData.value = {};
  dialogVisible.value = true;
};

const handleEdit = (row: Customer) => {
  isEdit.value = true;
  formData.value = JSON.parse(JSON.stringify(row));
  dialogVisible.value = true;
};

const handleDelete = (row: Customer) => {
  ElMessageBox.confirm(`确定删除客户 [${row.name}] 吗？`, "警告", {
    type: "warning",
  }).then(() => {
    customerStore.removeItem(row.id);
    ElMessage.success("删除成功");
  });
};

const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  if (isEdit.value) {
    customerStore.updateItem(formData.value as Customer);
    ElMessage.success("更新成功");
  } else {
    customerStore.addItem(formData.value as Customer);
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
