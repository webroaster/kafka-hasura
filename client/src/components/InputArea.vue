<script setup lang="ts">
import axios from "../axios-config"
import { ref } from "vue"
import { useStore } from "vuex"

const store = useStore()

const username = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const isError = ref(false)
const isExists = ref(false)

// ユーザー作成
const createUser = async () => {
  if (
    username.value === "" ||
    email.value === "" ||
    password.value === "" ||
    password.value !== confirmPassword.value
  ) {
    isError.value = true
  } else {
    const data = await axios.post("/create", {
      username: username.value,
      email: email.value,
      password: password.value,
    })
    if (data.status === 201) {
      isExists.value = true
    } else {
      // ユーザーテーブルコンポーネント際レンダリングしたい
      username.value = ""
      email.value = ""
      password.value = ""
      confirmPassword.value = ""
      await store.dispatch("getUsers")
    }
  }
}
</script>

<template>
  <form @submit.prevent="createUser">
    <p class="error-message" v-if="isError">
      入力欄が正しく入力されていません。
    </p>
    <p class="error-message" v-if="isExists">
      このユーザーは既に登録されています。
    </p>
    <label for="username">ユーザー名</label>
    <input
      type="text"
      id="username"
      placeholder="username"
      v-model="username"
      required
    />
    <label for="email">メールアドレス</label>
    <input
      type="text"
      id="email"
      placeholder="foo@example.com"
      v-model="email"
      required
    />
    <label for="password">パスワード</label>
    <input
      type="password"
      placeholder="password"
      id="password"
      v-model="password"
      required
    />
    <label for="confirmPassword">確認用パスワード</label>
    <input
      type="password"
      placeholder="confirmPassword"
      id="confirmPassword"
      v-model="confirmPassword"
      required
    />
    <div>
      <button>ユーザー追加</button>
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
  color: red;
}
</style>
