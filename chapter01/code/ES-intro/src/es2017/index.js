const obj = { foo: "bar", baz: 42 };
console.log(Object.values(obj));

const person = { name: "houyw", age: 19 };
console.log(Object.entries(person));

const people = ['Fred', 'Tony']
console.log(Object.entries(people))

"x".padStart(4, "ab"); // 'abax'
"x".padEnd(5, "ab"); // 'xabab'

console.log(Object.getOwnPropertyDescriptors(person))