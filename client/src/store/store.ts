import { createStore } from "vuex"
import axios from "../axios-config"

// 全てのユーザーを取得
const getAllUser = async () => {
  const response = await (await axios.get("/users")).data.users
  return response
}

const store = createStore({
  state: {
    users: getAllUser(),
  },
  actions: {
    async getUsers({ commit }) {
      const response = await (await axios.get("/users")).data.users
      commit("setUsers", response)
    },
  },
  mutations: {
    setUsers(state, users) {
      state.users = users
    },
  },
  getters: {
    users: (state) => state.users,
  },
})

export default store
