// We're importing the store Class here so we can test against it in the constructor
import Store from "../store/store.js";

export default class Component {
  constructor(props = {}) {
    let self = this;

    // 继承该类的组件应该实现该方法，用来渲染组件
    this.render = this.render || function() {};

    // If there's a store passed in, subscribe to the state change
    if (props.store instanceof Store) {
      props.store.events.subscribe("stateChange", () => self.render());
    }

    //如果element元素，就把改元素设置为元素挂载节点
    if (props.hasOwnProperty("element")) {
      this.element = props.element;
    }
  }
}
