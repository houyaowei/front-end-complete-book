const person = {
  firstName: 'yw',
  lastName: 'hou',
  country: 'henan',
  state: 'cn',
};
const { firstName, lastName, ...rest } = person;
console.log(firstName); 
console.log(lastName); 
console.log(rest); 

// Spread properties for object literals:
const personCopy = { firstName, lastName, ...rest };
console.log(personCopy);

let _r = /obj.name/s.test("obj\nname");
console.log(_r)

const RE_DATE = /(?<year>\d{4})-(?<month>\d{1,2})-(?<day>\d{2})/;

let matchObj = RE_DATE.exec("2021-4-24");
console.log(matchObj.groups.year); 
console.log(matchObj.groups.month); 
console.log(matchObj.groups.day); 