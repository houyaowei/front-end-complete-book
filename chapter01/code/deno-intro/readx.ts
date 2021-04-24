const text = Deno.readTextFile("./person.json");

text.then((response) => console.log(response));