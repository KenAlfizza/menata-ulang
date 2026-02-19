import { assertEquals } from "@std/assert";
import app from "./main.ts";

Deno.test("GET / returns Hello World!", async () => {
  const req = new Request("http://localhost/");
  const res = await app.fetch(req);
  const text = await res.text();
  assertEquals(text, "Hello World!");
});
