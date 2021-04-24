
interface Person {
  name: string;
  age: number;
}

function greeter(person: Person) {
  return "I'm " + person.name + ", age: " + person.age;
}

let _name: string = "houyw";
let _age: number = 18;

let info = greeter({
  name: _name,
  age: _age
});

console.log(info)