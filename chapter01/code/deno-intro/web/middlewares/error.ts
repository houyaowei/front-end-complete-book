import { Response } from "https://deno.land/x/oak/mod.ts";

export default async (
  { res }: { res: Response },next: () => Promise<void>
) => {
  try {
    await next();
  } catch (err) {
    res.status = 500;
    res.body = { msg: err.message };
  }
};
