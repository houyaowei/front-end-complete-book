import * as api from "../api/ajaxService";
import { XAHC_LOGIN_MUTATION,XAHC_NUMBERADD_MUTATION } from "./mutation-types";

export const loginAction = ({ commit }) => {
  api.login().then(messages => {
		console.log("message:",messages);
    commit(XAHC_LOGIN_MUTATION, messages.data.data);
  });
};

export const addNumber = ({ commit },{a,b}) => {
	console.log("a:",a ,",b:",b);
  api.addNumber(a,b).then(messages => {
		console.log("message:",messages);
    commit(XAHC_NUMBERADD_MUTATION, messages.result);
  });
};