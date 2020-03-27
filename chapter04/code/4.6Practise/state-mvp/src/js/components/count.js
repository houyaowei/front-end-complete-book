import Component from "../lib/component.js";
import store from "../store/index.js";
import _ from "../lib/utils.js";

export default class Count extends Component {
  constructor() {
    super({
      store,
      element: _.$(".js-count")
    });
  }

  /**
   *
   * @returns {void}
   */
  render() {
    let emoji = store.state.items.length > 0 ? "🙌" : "😢";

    this.element.innerHTML = `
            <small>你今天已完成</small>
            <span>${store.state.items.length}</span>
            <small>条任务 ${emoji}</small>
        `;
  }
}
