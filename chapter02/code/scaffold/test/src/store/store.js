import Vue from "vue";
import Vuex from "vuex";
import * as actions from "./actions";
import mutations from "./mutations";
import * as getters from "./getters";

Vue.use(Vuex);

const state = {
  show: false,
	result: 0
};
export default new Vuex.Store({
  state,
  actions,
  mutations,
  getters
});
