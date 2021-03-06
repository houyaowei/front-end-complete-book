import Vue from "vue";

import { XAHC_LOGIN_MUTATION,XAHC_NUMBERADD_MUTATION } from "./mutation-types";

export default {
  [XAHC_LOGIN_MUTATION](state, data) {
	 console.log("mutation");
	 if(data.language == "GraphQL"){
		 state.show = true;
	 }
	 else {
		 state.show = false;
	 }
  },
	[XAHC_NUMBERADD_MUTATION](state, data) {
	  if(data){
			state.result = data;
		}
	}
};
