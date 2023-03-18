import { createStore } from "vuex"
import axios from "../axios-config"

const store = createStore({
  state: {
    users: [],
  },
  actions: {
    async getUsers({ commit }) {
      const response = await axios.get("/users")
      const users = response.data.users
      commit("setUsers", users)
    },
    async createUser({ dispatch }, newUser) {
      const response = await axios.post("/create", newUser)
      if (response.status === 200) {
        setTimeout(() => dispatch("getUsers"), 500)
      }
      return response
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
