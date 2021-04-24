
console.log("--------matchAll-----------")
const string = 'Magic hex numbers: DEADBEEF CAFE';
const regex = /\b\p{ASCII_Hex_Digit}+\b/gu;
for (const match of string.matchAll(regex)) {
  console.log(match);
}

console.log("--------bigint-----------")

let bn = BigInt(Number.MAX_SAFE_INTEGER) + 2n;
console.log(bn)
const alsoHuge = BigInt(9007199254740991);
console.log(alsoHuge)
const hugeString = BigInt("9007199254740991");
console.log(hugeString)
const hugeHex = BigInt("0x1fffffffffffff");
console.log(hugeHex)

console.log("is BigInt:", typeof 2n === 'bigint')


console.log("--------Optional Chaining----------")

var travelPlans = {
  destination: "xi'an",
  monday: {
    location: "shangxi",
    time: "23:20",
    no: "mu5716"
  },
};
console.log(travelPlans.tuesday?.location); 
console.log(travelPlans.monday?.location); 

console.log("--------Nullish----------")
console.log(false ?? true);   // => false
console.log(0 ?? 1);         // => 0
console.log('' ?? 'default');  // => ''
console.log(null ?? []);      // =>[]
console.log(undefined ?? []); // => []