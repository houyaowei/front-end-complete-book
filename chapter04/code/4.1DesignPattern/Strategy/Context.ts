/**
 * Context类，保持对当前策略的引用
 */

import Strategy from "./Strategy";
const names: string[] = ["hou", "cao", "ss"];

export default class Context {
  private strategy: Strategy;
  constructor(_s: Strategy) {
    this.strategy = _s;
  }
  public setStrategy(_s: Strategy) {
    this.strategy = _s;
  }
  //执行的方法是策略中定义的方法
  public executeStrategy() {
    console.log(
      `Context: current strategy is ${(<any>this.strategy).constructor.name}`
    );
    const result = this.strategy.toHandleStringArray(names);

    console.log("result:", result.join("->"));
  }
}
