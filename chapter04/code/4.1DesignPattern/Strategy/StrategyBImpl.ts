/**
 * 策略实现类B
 */

import Strategy from "./Strategy";
export default class StrategyBImpl implements Strategy {
  public toHandleStringArray(_d: string[]): string[] {
    return _d.reverse();
  }
}
