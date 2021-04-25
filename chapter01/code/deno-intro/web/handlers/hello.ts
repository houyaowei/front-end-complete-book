import { Response, RouteParams } from "https://deno.land/x/oak/mod.ts";
export default async ({
  params,
  response
}: {
  params: RouteParams;
  response: Response;
}) => {
  response.body = "hello,oak router" ;
};