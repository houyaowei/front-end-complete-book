/**
 *
 */
import Subject from "./Subject";
import RealSubject from "./RealSubject";

export default class Proxy implements Subject {
  private realSubject : RealSubject;
  constructor(ro : RealSubject) {
    this.realSubject = ro;
  }

  private chcekIsGoodFriend() : boolean {
    console.log("It's checking if good friend");
    const r = Math.ceil(Math.random() * 10);
    //只有够意思才给你传话
    if (r > 6 || r == 6) {
      return true;
    } else {
      console.log("This friend is not worth be trusted. ")
      return false;
    }
  }
  private checkPromission() {
    console.log("It's checking the promission");
    if (this.chcekIsGoodFriend()) {
      return true;
    }
    return false;
  }

  public proposal() : void {
    if(this.checkPromission()) {
      this.realSubject.proposal();
      console.log("Maybe she is willing")
    } else {
      console.log("This friend is unwilling to talk to his girlfriend");
    }
  }
}
