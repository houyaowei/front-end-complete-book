/**
 * @author houyw
 * 策略接口
 */

export default interface Strategy {
  toHandleStringArray(_d: string[]): string[];
}
