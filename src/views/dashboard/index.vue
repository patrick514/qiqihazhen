<template>
  <div class="app-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card revenue">
          <div class="stat-content">
            <div class="stat-label">今日销售额</div>
            <div class="stat-value">
              ¥{{ orderStore.todayRevenue.toFixed(2) }}
            </div>
          </div>
          <el-icon class="stat-icon"><Money /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card orders">
          <div class="stat-content">
            <div class="stat-label">本月订单数</div>
            <div class="stat-value">{{ orderStore.monthlyOrderCount }}</div>
          </div>
          <el-icon class="stat-icon"><Tickets /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card warning">
          <div class="stat-content">
            <div class="stat-label">库存预警商品</div>
            <div class="stat-value">{{ productStore.lowStockCount }}</div>
          </div>
          <el-icon class="stat-icon"><Warning /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card customers">
          <div class="stat-content">
            <div class="stat-label">总客户量</div>
            <div class="stat-value">{{ customerStore.items.length }}</div>
          </div>
          <el-icon class="stat-icon"><User /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售趋势 (最近7天)</span>
              <el-tag type="info">实时更新</el-tag>
            </div>
          </template>
          <div ref="chartRef" style="width: 100%; height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="notice-card overflow-auto">
          <template #header>库存预警明细</template>
          <div v-if="lowStockProducts.length === 0" class="empty-tip">
            <el-empty description="暂无预警商品" :image-size="60" />
          </div>
          <el-table v-else :data="lowStockProducts" size="small">
            <el-table-column
              prop="name"
              label="商品名称"
              show-overflow-tooltip
            />
            <el-table-column prop="stock" label="当前库存" width="80">
              <template #default="{ row }">
                <span class="text-danger">{{ row.stock }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="notice-card">
          <template #header>快速通道</template>
          <el-timeline>
            <el-timeline-item timestamp="推荐" color="#1890ff">
              <h4>完善基础资料</h4>
              <p>去添加更多商品和客户数据</p>
              <el-button
                size="small"
                link
                type="primary"
                @click="$router.push('/base/product')"
                >立即前往</el-button
              >
            </el-timeline-item>
            <el-timeline-item timestamp="关键" color="#67C23A">
              <h4>进行业务出库</h4>
              <p>尝试一笔销售并查看库存变化</p>
              <el-button
                size="small"
                link
                type="primary"
                @click="$router.push('/business/sales')"
                >开单出库</el-button
              >
            </el-timeline-item>
            <el-timeline-item timestamp="核心" color="#E6A23C">
              <h4>自定义表单</h4>
              <p>修改字段配置，查看系统如何自动伸缩</p>
              <el-button
                size="small"
                link
                type="primary"
                @click="$router.push('/system/config')"
                >字段配置</el-button
              >
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useProductStore } from "@/stores/product";
import { useCustomerStore } from "@/stores/customer";
import { useOrderStore } from "@/stores/order";
import { Money, Tickets, Warning, User } from "@element-plus/icons-vue";
import * as echarts from "echarts";

const productStore = useProductStore();
const customerStore = useCustomerStore();
const orderStore = useOrderStore();

const lowStockProducts = computed(() => {
  return productStore.items.filter((item) => item.stock < 10);
});

const chartRef = ref<HTMLElement>();
let myChart: echarts.ECharts | null = null;

onMounted(() => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value);
    const option = {
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisLine: { lineStyle: { color: "#999" } },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        splitLine: { lineStyle: { type: "dashed" } },
      },
      series: [
        {
          name: "销售额",
          type: "line",
          smooth: true,
          data: [1200, 1900, 1500, 2800, 2200, 3100, 2500],
          itemStyle: { color: "#1890ff" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(24,144,255,0.3)" },
              { offset: 1, color: "rgba(24,144,255,0)" },
            ]),
          },
        },
      ],
    };
    myChart.setOption(option);
    window.addEventListener("resize", handleResize);
  }
});

const handleResize = () => {
  myChart?.resize();
};

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped lang="scss">
.stat-card {
  height: 110px;
  position: relative;
  overflow: hidden;
  border: none;

  .stat-content {
    position: relative;
    z-index: 2;
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    .stat-value {
      font-size: 26px;
      font-weight: bold;
      color: #333;
    }
  }

  .stat-icon {
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 70px;
    opacity: 0.1;
    z-index: 1;
  }

  &.revenue {
    background-color: #eaf1ff;
    .stat-value {
      color: #1890ff;
    }
  }
  &.orders {
    background-color: #f0f9eb;
    .stat-value {
      color: #67c23a;
    }
  }
  &.warning {
    background-color: #fdf6ec;
    .stat-value {
      color: #e6a23c;
    }
  }
  &.customers {
    background-color: #fef0f0;
    .stat-value {
      color: #f56c6c;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.notice-card {
  height: 480px;
  &.overflow-auto {
    :deep(.el-card__body) {
      height: 400px;
      overflow-y: auto;
    }
  }
}

.empty-tip {
  padding-top: 50px;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>
