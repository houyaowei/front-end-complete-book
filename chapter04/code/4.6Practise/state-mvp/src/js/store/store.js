import PubSub from "../lib/pubsub.js";

export default class Store {
  constructor(params) {
    let self = this;

    //定义actions,mutations和state，
    //在初始化中，需要把action和mutation都初始化进来
    self.actions = {};
    self.mutations = {};
    self.state = {};

    // A status enum to set during actions and mutations
    self.status = "resting";

    // 初始化发布-订阅模型
    self.events = new PubSub();

    //如果传入actions，就使用传入的actions
    if (params.hasOwnProperty("actions")) {
      self.actions = params.actions;
    }

    if (params.hasOwnProperty("mutations")) {
      self.mutations = params.mutations;
    }

    //对state的值设置拦截
    self.state = new Proxy(params.state || {}, {
      set: function(state, key, value) {
        state[key] = value;

        console.log(`stateChange: ${key}: ${value}`);

        // 发布 stateChage通知
        self.events.publish("stateChange", self.state);

        // Give the user a little telling off if they set a value directly
        if (self.status !== "mutation") {
          console.warn(`You should use a mutation to set ${key}`);
        }

        // Reset the status ready for the next operation
        self.status = "resting";

        return true;
      }
    });
  }

  /**
   *分发action，如果能找到对应的action，立即执行
   */
  dispatch(actionKey, payload) {
    let self = this;

    // 校验action是否存在
    if (typeof self.actions[actionKey] !== "function") {
      console.error(`Action "${actionKey} doesn't exist.`);
      return false;
    }

    // 分组显示action 信息
    console.groupCollapsed(`ACTION: ${actionKey}`);

    // 设置action，说明我们正在dispatch一个action
    self.status = "action";

    //调用action
    self.actions[actionKey](self, payload);

    // Close our console group to keep things nice and neat
    console.groupEnd();

    return true;
  }

  /**
   * 查找mutation，更新state的值
   */
  commit(mutationKey, payload) {
    let self = this;

    // 校验mutation是否存在
    if (typeof this.mutations[mutationKey] !== "function") {
      console.log(`Mutation "${mutationKey}" doesn't exist`);
      return false;
    }

    // 设置状态为mutation
    this.status = "mutation";

    // 创建一个新的state，并将新的值附在state上
    let newState = this.mutations[mutationKey](this.state, payload);

    // 替换旧的state值
    this.state = Object.assign(this.state, newState);

    return true;
  }
}
