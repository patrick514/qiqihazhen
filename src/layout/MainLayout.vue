<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h3 class="logo-text">齐齐哈真零售</h3>
      </div>
      <el-menu
        :default-active="route.path"
        router
        class="el-menu-vertical"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>

        <el-sub-menu index="base">
          <template #title>
            <el-icon><Files /></el-icon>
            <span>基础资料</span>
          </template>
          <el-menu-item index="/base/product">商品管理</el-menu-item>
          <el-menu-item index="/base/customer">客户管理</el-menu-item>
          <el-menu-item index="/base/supplier">供应商管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="business">
          <template #title>
            <el-icon><Suitcase /></el-icon>
            <span>业务中心</span>
          </template>
          <el-menu-item index="/business/purchase">采购入库</el-menu-item>
          <el-menu-item index="/business/sales">销售出库</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/stock">
          <el-icon><Box /></el-icon>
          <span>库存查询</span>
        </el-menu-item>

        <el-menu-item index="/finance">
          <el-icon><Money /></el-icon>
          <span>财务流水</span>
        </el-menu-item>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/system/config">字段配置</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="parentTitle">{{
              parentTitle
            }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <span class="system-name">齐齐哈真零售系统</span>
          <el-divider direction="vertical" />
          <el-avatar
            :size="32"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <span class="username">管理员</span>
        </div>
      </el-header>

      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  Odometer,
  Files,
  Suitcase,
  Box,
  Money,
  Setting,
} from "@element-plus/icons-vue";

const route = useRoute();

const currentTitle = computed(() => route.meta.title as string);
const parentTitle = computed(() => {
  const matched = route.matched;
  if (matched.length > 2) {
    const parent = matched[matched.length - 2];
    return (parent?.meta?.title as string) || "";
  }
  return "";
});
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #001529;
  color: #fff;
  transition: width 0.3s;
  overflow-x: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #002140;

    .logo-text {
      color: #fff;
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 1px;
    }
  }

  .el-menu {
    border-right: none;
  }
}

.header {
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;

    .system-name {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .username {
      font-size: 14px;
      color: #606266;
    }
  }
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* transition */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
