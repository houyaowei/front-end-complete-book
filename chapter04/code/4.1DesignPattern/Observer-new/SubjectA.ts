import Observer from "./Observer";
import Subject from "./Subject"

export default class SubjectA implements Subject {

  //状态码
  public state: number;
  //保存所有的订阅者
  private observers: Observer[] = [];

  //注册
  public register(observer: Observer): void {
    const isExist = this.observers.indexOf(observer);
    if (isExist != -1) {
        return console.log('订阅者已经存在');
    }
    this.observers.push(observer);
    console.log("订阅者添加完成");
  }
  //移出
  public remove(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
        return console.log('要删除的订阅者不存在');
    }

    this.observers.splice(observerIndex, 1);
    console.log('订阅已删除');
  }
  public notify() {
    for (const observer of this.observers) {
      // console.log(this)
      observer.update(this);
    }
  }
  public setSteateToNotify(): void {
    this.state = Math.floor(Math.random() * (10 + 1));
    console.log(`state已经更新为: ${this.state}，并开始通知`);
    this.notify();
  }
}
