let origin = [1, ['aa','bb'], [3, ['cc','dd']]]
let _flat = origin.flat(2);
console.log(_flat)
console.log(origin)

const duplicate = (x) => [x, x];
let result = [2, 3, 4].flatMap(duplicate);
console.log(result)

let _entry = Object.entries({name:"ass",age:22})
console.log(_entry)

let putorigin = Object.fromEntries(_entry);
console.log(putorigin)


const s = "  houyw  ";

console.log(s.trim()); 
console.log(s.trimStart()); 
console.log(s.trimEnd()); 