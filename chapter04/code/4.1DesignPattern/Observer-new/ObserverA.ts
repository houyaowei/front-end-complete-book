
import Observer from "./Observer"
import Subject from "./Subject"
import SubjectInstance from "./SubjectA"

export default class ObserverA implements Observer {
  public update(subject: Subject): void {
    // console.log("is ObserverA: " , subject instanceof SubjectInstance)

    if (subject instanceof SubjectInstance && subject.state < 13) {
        console.log('观察者A收到通知.');
    }
  }
}
