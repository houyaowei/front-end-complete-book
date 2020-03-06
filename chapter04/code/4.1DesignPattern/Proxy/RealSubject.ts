/**
 * 真实对象
 */
import Subject from "./Subject";

export default class RealSubject implements Subject {
  public proposal() : void {
    console.log("Darling, Can you marray me?");
  }
}
