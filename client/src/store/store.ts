import { createStore } from "vuex"
import axios from "../axios-config"

interface User {
  id: number
  username: string
  email: string
  password: string
}

const store = createStore({
  state() {
    return {
      users: [] as Array<User>,
    }
  },
  actions: {
    async getUsers({ commit }) {
      const response = await (await axios.get("/users")).data.users
      commit("setUsers", response)
    },
    async createUser({ commit, dispatch }, newUser) {
      const response = await axios.post("/create", newUser)
      if (response.status === 200) {
        setTimeout(async () => {
          await dispatch("getUsers")
        }, 1000)
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
