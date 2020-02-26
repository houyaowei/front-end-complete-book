/**
 * 适配器类
 */
import Target from "./Target";
import AdvanceTarget from "./AdvanceTarget";
import VlcPlayer from "./VlcPlayer";
import Mp4Player from "./Mp4Player";

export default class MediaAdatper implements Target {
  private advanceTarget: AdvanceTarget;
  constructor(type: string) {
    if (type === "vlc") {
      this.advanceTarget = new VlcPlayer();
    }
    if (type == "mp4") {
      this.advanceTarget = new Mp4Player();
    }
  }
  public play(type: string, fileName: string): void {
    if (type === "vlc") {
      this.advanceTarget.playVlcType(fileName);
    }
    if (type == "mp4") {
      this.advanceTarget.playMp4Type(fileName);
    }
  }
}
