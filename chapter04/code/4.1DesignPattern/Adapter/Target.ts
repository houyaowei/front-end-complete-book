/**
 * 目标对象，我们把它定义成接口的形式，
 */
export default interface Target {
  play(autoType: string, fileName: string): void;
}
