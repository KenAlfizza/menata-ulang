/**
 * Story routes integration tests (simplified)
 *
 * Run with:
 *   $env:DATABASE_URL = 'postgresql://user:password@localhost:5432/test_db?schema=public'
 *   $env:JWT_SECRET = 'test-secret'
 *   deno test --allow-env --allow-net tests/story_integration.ts
 */

import { assertEquals } from "@std/assert";
import { prisma } from "../lib/prisma.ts";
import story from "../routes/story.ts";
import { storage } from "../routes/story.ts";
import { signAccessToken } from "../lib/jwt.ts";

Deno.env.set("JWT_SECRET", "test-secret");

// Monkeypatch storage to avoid real file I/O
storage.save = async (_file: File, _dir: string) => `http://example.com/${Math.random()}.png`;
storage.delete = async (_url: string) => {};

// Shared test user/story fixtures
let testUser: any;
let testResearch: any;
let testStory: any;

// Setup: create a test user and published story
Deno.test("setup - create test data", {
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  testUser = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.test`,
      password: "hashed",
      name: "Test Author",
      role: "AUTHOR",
    },
  });

  testStory = await prisma.story.create({
    data: {
      title: "Integration Test Story",
      description: "A test story",
      text: "Full test content here",
      author: { connect: { id: testUser.id } },
      published: true,
      research: {
        create: {text: "Initial research data"}
      },
    },
    include: { research: true }
  });
});

Deno.test("GET / lists published stories", {
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  const res = await story.fetch(new Request("http://localhost/"));
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(Array.isArray(body.data), true);
  assertEquals(typeof body.meta.total, "number");
});

Deno.test("GET /:id returns published story", {
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  const res = await story.fetch(new Request(`http://localhost/${testStory.id}`));
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.story.title, "Integration Test Story");
});

Deno.test("POST / creates story (auth required)", {
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  const token = await signAccessToken({
    id: testUser.id,
    email: testUser.email,
    role: "AUTHOR",
  });

  const form = new FormData();
  form.append("title", "New Story");
  form.append("description", "Test");
  form.append("text", "Content");
  form.append("image", new File([new Uint8Array([1, 2, 3])], "img.png", { type: "image/png" }));
  form.append("published", "false");
  form.append("researchText", "This is the research data")

  const res = await story.fetch(
    new Request("http://localhost/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
  );

  assertEquals(res.status, 201);
  const body = await res.json();
  assertEquals(body.story.title, "New Story");
  assertEquals(body.story.research.text, "This is the research data")

  // Cleanup created story
  await prisma.story.delete({ where: { id: body.story.id } });
});

Deno.test("PATCH /:id updates story", {
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  const token = await signAccessToken({
    id: testUser.id,
    email: testUser.email,
    role: "AUTHOR",
  });

  const form = new FormData();
  form.append("title", "Updated Title");
  form.append("researchText", "Updated research content");

  const res = await story.fetch(
    new Request(`http://localhost/${testStory.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
  );

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.story.title, "Updated Title");
  assertEquals(body.story.research.text, "Updated research content");

  // Restore for other tests
  await prisma.story.update({
    where: { id: testStory.id },
    data: { title: "Integration Test Story" },
  });
});

// Cleanup: delete test data
Deno.test("cleanup - remove test data", {
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  if (testStory) await prisma.story.delete({ where: { id: testStory.id } });
  if (testUser) await prisma.user.delete({ where: { id: testUser.id } });
  await prisma.$disconnect();
});
