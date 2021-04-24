const text = Deno.readTextFile("./person.json");

text.then(res => {
  console.log(res)
});