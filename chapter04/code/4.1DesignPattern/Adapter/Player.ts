/**
 *
 */
import Target from "./Target";
import MediaAdapter from "./Adapter";

export default class Player implements Target {
  mediaAdapter : MediaAdapter;

  play(type : string, fileName : string) : void {
    if(type === "vlc" || type == "mp4") {
      this.mediaAdapter = new MediaAdapter(type);
      this
        .mediaAdapter
        .play(type, fileName);
    } else {
      console.error(`sorry,type ${type} is not support`);
    }
  }
}
