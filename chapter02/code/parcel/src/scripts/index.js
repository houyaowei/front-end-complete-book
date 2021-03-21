export default {
  getCreateTime: ()=> {
    let d = new Date()
    return d.getFullYear()+  "-"+ (d.getMonth()+1) + "-"+ d.getDate()
  }
}