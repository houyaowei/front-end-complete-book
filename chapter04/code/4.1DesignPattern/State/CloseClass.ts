/**
 * @author houyw
 * 强光
 */
import State from "./State";
import SlightLight from "./SlightLightClass";

export default class ColseClass extends State {
  public slightLight(): void {}

  public highLight(): void {
    console.log("highLight in HighLightClass");
  }
  public close(): void {
    console.log("state in closeClass, I will change state to slight");
    this.context.transitionTo(new SlightLight());
  }
}
