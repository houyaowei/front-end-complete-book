import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

const hash = await bcrypt.hash("hello,world");

console.log(hash)