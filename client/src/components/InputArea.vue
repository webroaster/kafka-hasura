<script setup lang="ts">
import { ref } from "vue"
import { useStore } from "vuex"

const store = useStore()

interface User {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const user: User = {
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
}

const formErrors = ref<string[]>([])
const isExists = ref(false)

// ユーザー作成
const createUser = async () => {
  console.log(formErrors)
  const errors = []
  if(!user.username) errors.push('ユーザー名を入力してください。')
  if(!user.email) errors.push('メールアドレスを入力してください。')
  if(!user.password) errors.push('パスワードを入力してください。')
  if(user.password !== user.confirmPassword) errors.push('確認用パスワードが一致しません。')
  if(errors.length > 0) {
    formErrors.value = errors
    console.log(formErrors.value)
  } else {
    const data = await store.dispatch('createUser', user)
    if(data.status == 201) {
      isExists.value = true
    } else {
      Object.assign(user, {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      formErrors.value = []
      isExists.value = false
    }
  }
}
</script>

<template>
  <form @submit.prevent="createUser">
    <p class="error-message" v-if="formErrors.length">
      <p v-for="error in formErrors" :key="error" class="error-message">{{ error }}</p>
    </p>
    <p class="error-message" v-if="isExists">
      このユーザーは既に登録されています。
    </p>
    <label for="username">ユーザー名</label>
    <input
      type="text"
      id="username"
      placeholder="username"
      v-model="user.username"
      required
    />
    <label for="email">メールアドレス</label>
    <input
      type="text"
      id="email"
      placeholder="foo@example.com"
      v-model="user.email"
      required
    />
    <label for="password">パスワード</label>
    <input
      type="password"
      placeholder="password"
      id="password"
      v-model="user.password"
      required
    />
    <label for="confirmPassword">確認用パスワード</label>
    <input
      type="password"
      placeholder="confirmPassword"
      id="confirmPassword"
      v-model="user.confirmPassword"
      required
    />
    <div>
      <button type="submit">ユーザー追加</button>
    </div>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  width: 100%;
  max-width: 700px;
  margin: 8em auto 2em;
}
input {
  padding: 0.7em;
  border: none;
  background: #eee;
  font-size: 16px;
  border-radius: 5px;
}
button {
  width: 100%;
  border: none;
  border-radius: 5px;
  font-size: 15px;
  font-weight: bold;
  padding: 0.5em 1em;
  margin-top: 1em;
  background: #58908a;
  color: white;
  cursor: pointer;
}
button + button {
  margin-left: 1em;
}
button:hover {
  opacity: 0.8;
}
.error-message {
  margin: 0;
  color: red;
}
</style>
