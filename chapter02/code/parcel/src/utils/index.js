/**
 * 
 */
const _package = require("../../package.json")
export default {
  projectName: "parcel project",
  getAuthor: function(){
    return "houyw"
  },
  getVersion: ()=>{
    return _package.version
  }
}