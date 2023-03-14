<script setup lang="ts">
import UsersTable from "./components/UsersTable.vue"
import InputArea from "./components/InputArea.vue"
</script>

<template>
  <header>
    <h2>test App</h2>
  </header>

  <InputArea />

  <UsersTable />
</template>

<style scoped>
header {
  background: #ccc;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.1em 2em;
}

h2 {
  text-align: left;
}
</style>
