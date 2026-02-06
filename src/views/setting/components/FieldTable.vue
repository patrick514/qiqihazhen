<template>
  <div>
    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>新增字段
      </el-button>
    </div>

    <el-table :data="fields" border stripe>
      <el-table-column prop="label" label="显示名称" />
      <el-table-column prop="key" label="字段键名" />
      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag>{{ typeMap[row.type] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="选项" min-width="150">
        <template #default="{ row }">
          <div v-if="row.type === 'select'">
            <el-tag
              v-for="opt in row.options"
              :key="opt.value"
              size="small"
              style="margin-right: 5px"
            >
              {{ opt.label }}
            </el-tag>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)"
            >编辑</el-button
          >
          <el-button link type="danger" @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑字段' : '新增字段'"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="显示名称" required>
          <el-input v-model="form.label" placeholder="例如：商品品牌" />
        </el-form-item>
        <el-form-item label="字段键名" required>
          <el-input
            v-model="form.key"
            :disabled="isEdit"
            placeholder="例如：brand (英文)"
          />
        </el-form-item>
        <el-form-item label="字段类型" required>
          <el-select
            v-model="form.type"
            placeholder="选择类型"
            style="width: 100%"
          >
            <el-option label="文本" value="text" />
            <el-option label="数字" value="number" />
            <el-option label="下拉框" value="select" />
            <el-option label="日期" value="date" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.type === 'select'" label="配置选项">
          <div
            v-for="(opt, index) in form.options"
            :key="index"
            style="display: flex; gap: 10px; margin-bottom: 10px"
          >
            <el-input v-model="opt.label" placeholder="选项名称" />
            <el-input v-model="opt.value" placeholder="值" />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="removeOption(index)"
            />
          </div>
          <el-button type="success" size="small" @click="addOption"
            >添加选项</el-button
          >
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  useFieldConfigStore,
  type FieldConfig,
  type ModuleName,
} from "@/stores/fieldConfig";
import { ElMessageBox, ElMessage } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";

const props = defineProps<{
  module: ModuleName;
}>();

const store = useFieldConfigStore();
const fields = computed(() => store.configs[props.module]);

const typeMap: Record<string, string> = {
  text: "文本",
  number: "数字",
  select: "下拉框",
  date: "日期",
};

const dialogVisible = ref(false);
const isEdit = ref(false);
const form = ref<Partial<FieldConfig>>({
  label: "",
  key: "",
  type: "text",
  options: [],
});

const handleCreate = () => {
  isEdit.value = false;
  form.value = { label: "", key: "", type: "text", options: [] };
  dialogVisible.value = true;
};

const handleEdit = (row: FieldConfig) => {
  isEdit.value = true;
  form.value = JSON.parse(JSON.stringify(row));
  dialogVisible.value = true;
};

const handleDelete = (row: FieldConfig) => {
  ElMessageBox.confirm(`确定删除字段 [${row.label}] 吗？`, "警告", {
    type: "warning",
  }).then(() => {
    store.removeField(props.module, row.key);
    ElMessage.success("删除成功");
  });
};

const addOption = () => {
  if (!form.value.options) form.value.options = [];
  form.value.options.push({ label: "", value: "" });
};

const removeOption = (index: number) => {
  form.value.options?.splice(index, 1);
};

const handleSubmit = () => {
  if (!form.value.label || !form.value.key) {
    ElMessage.error("请填写必填项");
    return;
  }

  if (isEdit.value) {
    store.updateField(props.module, form.value as FieldConfig);
  } else {
    // 检查重复 key
    if (fields.value.some((f) => f.key === form.value.key)) {
      ElMessage.error("字段键名已存在");
      return;
    }
    store.addField(props.module, form.value as FieldConfig);
  }

  dialogVisible.value = false;
  ElMessage.success("保存成功");
};
</script>
