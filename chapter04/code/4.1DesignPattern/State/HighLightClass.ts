/**
 * @author houyw
 * 强光
 */
import State from "./State";
import Context from "./Context";
import CloseClass from "./CloseClass";

export default class HighLightClass extends State {
  public slightLight(): void {
    console.log("slight state in HighLightClass");
  }

  public highLight(): void {
    console.log("highLight state in HighLightClass");
  }
  public close(): void {
    console.log("state in hightLight, I will change state to close");
    this.context.transitionTo(new CloseClass());
  }
}
