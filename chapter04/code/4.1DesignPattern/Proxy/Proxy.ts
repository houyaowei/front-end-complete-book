/**
 *
 */
import Subject from "./Subject";
import RealSubject from "./RealSubject";

export default class Proxy implements Subject {
  private realSubject: RealSubject;
  constructor(ro: RealSubject) {
    this.realSubject = ro;
  }

  private chcekIsGoodFriend() {
    console.log("It's is checking if good friend");
    const r = Math.ceil(Math.random() * 10);
    //只有够意思才给你传话
    if (r > 6 || r == 6) {
      return true;
    } else {
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

  public proposal(): void {
    if (this.checkPromission()) {
      this.realSubject.proposal();
    }
  }
}
