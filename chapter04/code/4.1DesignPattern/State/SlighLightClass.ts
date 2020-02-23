/**
 * @author houyw
 * 弱光
 */
import State from "./State";
import HighLight from "./HighLightClass";

export default class SlighLightClass extends State {
  public slightLight(): void {
    console.log("state in SlighLightClass, I will change state to highLight");
    this.context.transitionTo(new HighLight());
  }

  public highLight(): void {
    console.log("hightstate state in SlighLightClass");
  }
  public close(): void {
    console.log("close state in SlighLightClass");
  }
}
