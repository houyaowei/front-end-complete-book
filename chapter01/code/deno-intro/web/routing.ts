import { Router } from "https://deno.land/x/oak/mod.ts";
import sayHello from "./handlers/hello.ts";
const router = new Router();

router.get("/", sayHello);

export default router;