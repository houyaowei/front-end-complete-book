/**
 * 策略实现类A
 */

import Strategy from "./Strategy";
export default class StrategyAImpl implements Strategy {
  public toHandleStringArray(_d: string[]): string[] {
    return _d.sort();
  }
}
