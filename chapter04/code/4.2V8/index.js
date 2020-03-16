var obj ={
	name: "hyw"
}
obj[1] = "aaa";

console.log(obj.name);
console.log(obj["1"]);

fuction Person(name,age){
	this.name = name;
	this.age = age;
}

let p1 = new Person("zhangsan",22);
let p2 = new Person("lisi",22);

function getName(person){
	if(person && person.name){
		return person.name
	}
}


var name="houyw";
var age = 23;
var isMale = true;
var empty = null;

var person = {
	name: "houyw",
	age: 23,
	isMale: true;
}