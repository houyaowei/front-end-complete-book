import name from "./src/utils/index"
import ss from "./src/scripts/index"
// import "./style.css"

document.writeln("hello,parcel<br>")
document.writeln("project name :", name.projectName ,"<br>")
document.writeln("project version :", name.getVersion() ,"<br>")
document.writeln("project create at:", ss.getCreateTime(),"<br>")
document.writeln("project created by:", name.getAuthor(),"<br>")