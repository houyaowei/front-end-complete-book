import * as types from "./ActionsTypes.js";

export default {
  addItem(context, payload) {
    context.commit(types.ADDITEM, payload);
  },
  clearItem(context, payload) {
    context.commit(types.CLEARITEM, payload);
  }
};
