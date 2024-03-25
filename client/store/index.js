import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    tableName: ''
  },
  mutations: {
    setTableName(state, tableName) {
      state.tableName = tableName;
      localStorage.setItem('tableName', tableName);
    }
  }
})

export default store
