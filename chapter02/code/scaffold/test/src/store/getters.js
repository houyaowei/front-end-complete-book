export const getStatus = state => {
  return state.show ? "成功" : "失败";
};

export const getResult = state => {
	console.log("getters:",state.result);
  return state.result ? state.result : "得数未知";
};