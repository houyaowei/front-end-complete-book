setTimeout(() => console.log("setTimeout"))

async function main() {
  console.log("before resovle")
  await Promise.resolve();
  console.log("after resovle")
}
main()
console.log("global console");
