import Component from "../lib/component.js";
import store from "../store/index.js";
import _ from "../lib/utils.js";

export default class List extends Component {
  constructor() {
    super({
      store,
      element: _.$(".js-items")
    });
  }

  render() {
    let self = this;

    // If there are no items to show, render a little status instead
    if (store.state.items.length === 0) {
      self.element.innerHTML = `<p class="no-items">今天还没有开始 😢</p>`;
      return;
    }

    // Loop the items and generate a list of elements
    self.element.innerHTML = `
            <ul class="app__items">
                ${store.state.items
                  .map(item => {
                    return `
                        <li>${item}<button aria-label="Delete">×</button></li>
                    `;
                  })
                  .join("")}
            </ul>
        `;

    self.element.querySelectorAll("button").forEach((button, index) => {
      button.addEventListener("click", () => {
        store.dispatch("clearItem", { index });
      });
    });
  }
}
