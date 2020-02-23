/**
 * @author houyw
 * 强光
 */
import State from "./State";
import SlightLight from "./SlighLightClass";

export default class ColseClass extends State {
  public slightLight(): void {
    console.log("state in closeClass, I will change state to slight");
    this.context.transitionTo(new SlightLight());
  }

  public highLight(): void {
    console.log("highLight in HighLightClass");
  }
  public close(): void {
    console.log("close in HighLightClass");
  }
}
