/**
 * vlc播放器的实现类
 */
import AdvancePlayer from "./AdvanceTarget";

export default class VlcPlayer implements AdvancePlayer {
  public playVlcType(fileName : string) : void {
    console.log(`${fileName} is palying!`);
  }
  public playMp4Type(fileName : string) : void {
    //空实现
  }
}
