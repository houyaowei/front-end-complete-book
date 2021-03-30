import name from "./src/utils/index"
import ss from "./src/scripts/index"
import Person from "./src/models/person"
import "./style.scss"

const p = new Person("houyw",23)
console.log("class.name", p.getName())
console.log("class.name", p.getAge())
console.log("project name :", name.projectName)
console.log("project version :", name.getVersion() )
console.log("project create at:", ss.getCreateTime())
console.log("project created by:", name.getAuthor())