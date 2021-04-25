import { serve } from "https://deno.land/std@0.95.0/http/server.ts";
const server = serve({ port: 9001 });
console.log("http://localhost:9001/");
for await (const req of server) {
  req.respond({ body: "Hello, this is from deno server" });
}