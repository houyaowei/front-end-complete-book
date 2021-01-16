/**
 * @author houyw
 */

import State from "./State";

export default class Context {
  // refer to current State
  private state: State;

  constructor(state: State) {
    this.transitionTo(state);
  }

  public transitionTo(_s: State): void {
    console.log(`Context: transition to ${(<any>_s).constructor.name}`);
    this.state = _s;
    this.state.setContext(this);
  }

  public setSlighLight(): void {
    this.state.slightLight();
  }
  public setHightLight(): void {
    this.state.highLight();
  }
  public close(): void {
    this.state.close();
  }
}
