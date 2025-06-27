<template>
  <div class="layout-wrapper">
    <main class="layout-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.layout-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.layout-header nav a {
  color: white;
  text-decoration: none;
  margin: 0 1rem;
  padding: 0.5rem;
}
.layout-main {
  flex: 1;
  padding: 2rem;
}
</style>
