import Observer from "./Observer"
import Subject from "./Subject"
import SubjectInstance from "./SubjectA"

export default class ObserverB implements Observer {
  public update(subject: Subject): void {
    // console.log("is observerB: " , subject instanceof SubjectInstance)
    if (subject instanceof SubjectInstance && (subject.state < 12)) {
        console.log('观察者B收到通知');
    }
  }
}
