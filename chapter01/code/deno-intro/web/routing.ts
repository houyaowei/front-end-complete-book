import { Router } from "https://deno.land/x/oak/mod.ts";
import sayHello from "./handlers/hello.ts";
import main from "./handlers/main.ts"
const router = new Router();

router.get("/", sayHello);
router.get("/main", main);
export default router;