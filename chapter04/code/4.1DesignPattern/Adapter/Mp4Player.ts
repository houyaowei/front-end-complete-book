/**
 * mp4播放器的实现类
 */
import AdvancePlayer from "./AdvanceTarget";

export default class Mp4Player implements AdvancePlayer {
  public playVlcType(fileName : string) : void {
    //空实现
  }
  public playMp4Type(fileName : string) : void {
    console.log(`${fileName} is palying`);
  }
}
