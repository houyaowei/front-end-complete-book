export default class PubSub {
  constructor() {
    this.events = {};
  }

  /**
   * 订阅事件，并注册回调方法
   */
  subscribe(event, callback) {
    let self = this;

    if (!self.events.hasOwnProperty(event)) {
      self.events[event] = [];
    }

    return self.events[event].push(callback);
  }

  /**
   * 寻找注册的事件回调，执行调用
   */
  publish(event, data = {}) {
    let self = this;

    if (!self.events.hasOwnProperty(event)) {
      return [];
    }
    return self.events[event].map(callback => callback(data));
  }
}
