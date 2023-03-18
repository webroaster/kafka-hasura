<script setup lang="ts">
import { onMounted, computed } from "vue"
import { useStore } from "vuex"

const store = useStore()

onMounted(async () => {
  await store.dispatch("getUsers")
})

const users = computed(() => store.getters.users)
</script>

<template>
  <table>
    <tr>
      <th>username</th>
      <th>email</th>
      <th>password</th>
    </tr>
    <tr v-for="(user, i) in users" :key="i">
      <td>{{ user.username }}</td>
      <td>{{ user.email }}</td>
      <td>{{ user.password }}</td>
    </tr>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  max-width: 800px;
  margin: 30px auto;
  border-collapse: collapse;
  background: #f8f8f8;
}
tr:nth-of-type(even) {
  background: #dcdcdc;
}
th {
  padding: 0.4em;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}
td {
  padding: 0.4em 1em;
  font-weight: normal;
  text-align: left;
}
</style>
