/**
 *@author houyw
 **/
import Context from "./Context";

export default abstract class State {
  protected context: Context;

  public setContext(_c: Context) {
    this.context = _c;
  }

  public abstract slightLight(): void;
  public abstract highLight(): void;
  public abstract close(): void;
}
