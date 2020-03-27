import store from "./store/index.js";

// 加载组件
import Count from "./components/count.js";
import List from "./components/list.js";
import Status from "./components/status.js";
import _ from "./lib/utils.js";
import * as types from "./store/ActionsTypes.js";

const formElement = _.$(".js-form");
const inputElement = _.$("#new-item-field");

formElement.addEventListener("submit", evt => {
  evt.preventDefault();
  let value = inputElement.value.trim();

  if (value.length) {
    store.dispatch(types.ADDITEM, value);
    inputElement.value = "";
    inputElement.focus();
  } else {
    alert("亲，请输入工作条目");
  }
});

// 组件实例化并完成渲染
new Count().render();
new List().render();
// new Status().render();
