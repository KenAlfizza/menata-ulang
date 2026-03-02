/**
 * Tests usage
 *
 * These tests run against a real Postgres database. Before running:
 * - Set `DATABASE_URL` to a test database (do NOT use production DB).
 * - Set `JWT_SECRET` to any value.
 *
 * Example (PowerShell):
 *   $env:DATABASE_URL = 'postgresql://user:password@localhost:5432/menata-ulang-test?schema=public'
 *   $env:JWT_SECRET = 'test-secret'
 *   deno test --allow-env --allow-net backend/tests/story_test.ts
 *
 * Notes:
 * - Tests create and delete users/stories in the configured DB. Use an isolated
 *   test database or CI ephemeral DB to avoid data loss.
 * - `storage.save`/`storage.delete` are monkeypatched to avoid real file I/O.
 */
import { assertEquals } from "@std/assert";

// Prepare environment
Deno.env.set("JWT_SECRET", "test-secret");

import { prisma } from "../lib/prisma.ts";
import story from "../routes/story.ts";
import { storage } from "../routes/story.ts";
import { signAccessToken } from "../lib/jwt.ts";

// Monkeypatch storage to avoid file IO while testing
storage.save = async (_file: File, _dir: string) => "http://example.com/new.png";
storage.delete = async (_url: string) => {};

const makeToken = async (payload: { id: number; email: string; role: string }) => {
	return await signAccessToken(payload as any);
};

Deno.test("GET / list returns paginated published stories", async () => {
	const user = await prisma.user.create({ data: { email: `test-list-${Date.now()}@x.test`, password: 'x', name: 'List Tester', role: 'AUTHOR' } });
	const created = await prisma.story.create({ data: { title: 'S1', description: 'd', text: 't', author: { connect: { id: user.id } }, published: true } });

	const req = new Request("http://localhost/", { method: "GET" });
	const res = await story.fetch(req);
	assertEquals(res.status, 200);
	const body = await res.json();
	assertEquals(Array.isArray(body.data), true);

	await prisma.story.delete({ where: { id: created.id } });
	await prisma.user.delete({ where: { id: user.id } });
});

Deno.test("GET /:id returns single published story", async () => {
	const user = await prisma.user.create({ data: { email: `test-get-${Date.now()}@x.test`, password: 'x', name: 'Get Tester', role: 'AUTHOR' } });
	const created = await prisma.story.create({ data: { title: 'Single', description: 'd', text: 't', author: { connect: { id: user.id } }, published: true } });

	const req = new Request(`http://localhost/${created.id}`, { method: "GET" });
	const res = await story.fetch(req);
	assertEquals(res.status, 200);
	const body = await res.json();
	assertEquals(body.ok, true);
	assertEquals(body.story.title, 'Single');

	await prisma.story.delete({ where: { id: created.id } });
	await prisma.user.delete({ where: { id: user.id } });
});

Deno.test("POST / creates a story for AUTHOR role", async () => {
	const user = await prisma.user.create({ data: { email: `test-post-${Date.now()}@x.test`, password: 'x', name: 'Post Tester', role: 'AUTHOR' } });
	const token = await makeToken({ id: user.id, email: user.email, role: 'AUTHOR' });

	const file = new File([new Uint8Array([1,2,3])], "img.png", { type: "image/png" });
	const form = new FormData();
	form.append("title", "New Title");
	form.append("description", "New Desc");
	form.append("text", "Long text");
	form.append("image", file);
	form.append("published", "true");

	const req = new Request("http://localhost/", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
	const res = await story.fetch(req);
	assertEquals(res.status, 201);
	const body = await res.json();
	assertEquals(body.ok, true);
	assertEquals(body.story.title, "New Title");

	await prisma.story.delete({ where: { id: body.story.id } });
	await prisma.user.delete({ where: { id: user.id } });
});

Deno.test("PATCH /:id updates story for owner", async () => {
	const user = await prisma.user.create({ data: { email: `test-patch-${Date.now()}@x.test`, password: 'x', name: 'Patch Tester', role: 'AUTHOR' } });
	const created = await prisma.story.create({ data: { title: 'ToUpdate', description: 'd', text: 't', author: { connect: { id: user.id } }, published: true } });
	const token = await makeToken({ id: user.id, email: user.email, role: 'AUTHOR' });

	const form = new FormData();
	form.append("title", "Updated Title");

	const req = new Request(`http://localhost/${created.id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: form });
	const res = await story.fetch(req);
	assertEquals(res.status, 200);
	const body = await res.json();
	assertEquals(body.ok, true);
	assertEquals(body.story.title, "Updated Title");

	await prisma.story.delete({ where: { id: created.id } });
	await prisma.user.delete({ where: { id: user.id } });
});

// Cleanup: disconnect Prisma after tests to prevent resource leaks
const cleanupPrisma = async () => {
	await prisma.$disconnect().catch(() => {});
};

// Register cleanup on test finish
// Deno will call this when the test suite exits
globalThis.onunload = () => {
	cleanupPrisma();
};

// Also try explicit timeout-based cleanup
if (typeof Deno !== 'undefined') {
	const originalTestFn = Deno.test.bind(Deno);
	// After all tests, sleep briefly then cleanup
	setTimeout(async () => {
		await cleanupPrisma();
	}, 500);
}

