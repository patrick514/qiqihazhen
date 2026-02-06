<template>
  <el-form
    ref="formRef"
    :model="modelValue"
    :label-width="labelWidth"
    class="dynamic-form"
  >
    <el-row :gutter="20">
      <el-col v-for="field in fields" :key="field.key" :span="field.span || 12">
        <el-form-item
          :label="field.label"
          :prop="field.key"
          :rules="[
            {
              required: field.required,
              message: field.label + '不能为空',
              trigger: 'blur',
            },
          ]"
        >
          <!-- 文本类型 -->
          <el-input
            v-if="field.type === 'text'"
            v-model="modelValue[field.key]"
            :placeholder="'请输入' + field.label"
            clearable
          />

          <!-- 数字类型 -->
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="modelValue[field.key]"
            :placeholder="'请输入' + field.label"
            style="width: 100%"
            controls-position="right"
          />

          <!-- 下拉选择类型 -->
          <el-select
            v-else-if="field.type === 'select'"
            v-model="modelValue[field.key]"
            :placeholder="'请选择' + field.label"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="opt in field.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <!-- 日期选择类型 -->
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="modelValue[field.key]"
            type="date"
            :placeholder="'请选择' + field.label"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FormInstance } from "element-plus";
import type { FieldConfig } from "@/stores/fieldConfig";

const props = withDefaults(
  defineProps<{
    fields: FieldConfig[];
    modelValue: any;
    labelWidth?: string | number;
  }>(),
  {
    labelWidth: "100px",
  },
);

const formRef = ref<FormInstance>();

// 暴露校验方法给父组件使用
const validate = async () => {
  if (!formRef.value) return false;
  try {
    return await formRef.value.validate();
  } catch (error) {
    return false;
  }
};

// 暴露重置方法
const resetFields = () => {
  formRef.value?.resetFields();
};

defineExpose({
  validate,
  resetFields,
});
</script>

<style scoped lang="scss">
.dynamic-form {
  margin-top: 10px;
}
</style>
