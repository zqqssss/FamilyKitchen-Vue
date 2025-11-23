<template>
  <router-view />
</template>

<style>
/* 全局重置与主题色覆盖 */
:root {
  /* 核心主色：活力橙 (代替默认的蓝色) */
  --el-color-primary: #ff9c00;
  --el-color-primary-light-3: #ffb84d;
  --el-color-primary-light-5: #ffd180;
  --el-color-primary-light-7: #ffead0;
  --el-color-primary-light-9: #fff5e6;
  --el-color-primary-dark-2: #d68200;

  /* 背景色：暖白/米色 (代替冷灰) */
  --bg-color-warm: #fdfbf7;
  --text-color-main: #4a4a4a;
}

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Nunito', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: var(--bg-color-warm);
  color: var(--text-color-main);
}

/* 让所有卡片变得圆润可爱 */
.el-card {
  border-radius: 16px !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(255, 156, 0, 0.08) !important;
}

/* 按钮圆角 */
.el-button {
  border-radius: 8px !important;
  font-weight: bold;
}
</style>
