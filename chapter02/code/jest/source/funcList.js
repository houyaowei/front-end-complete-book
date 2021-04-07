/**
 * 模拟开发环境中的api接口
 * @returns 
 */

const axios = require("axios")
function listApps() {
  return axios.get("http://sss.test.socm/getApps")
      .then(res => res.data)
      .catch(error => console.log(error));
}
module.exports = {
  getApplist: listApps
}