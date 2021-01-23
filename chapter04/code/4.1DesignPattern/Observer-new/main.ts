import SubjectA from "./SubjectA"
import ObserverA from "./ObserverA"
import ObserverB from "./ObserverB"
//发布者对象
const subject = new SubjectA();

//订阅者声明并增加到观察者列表
const observer1 = new ObserverA();
subject.register(observer1);

const observer2 = new ObserverB();
subject.register(observer2);
console.log("---------------")
//通知两次
subject.setSteateToNotify();
console.log("---------------")

subject.remove(observer2);

subject.setSteateToNotify();
