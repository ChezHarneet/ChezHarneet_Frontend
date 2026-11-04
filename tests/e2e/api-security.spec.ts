import { test, expect } from "@playwright/test";

const api = "http://127.0.0.1:4000/api";

test("protected learner and admin APIs reject anonymous requests", async ({ request }) => {
  for (const path of ["/auth/me", "/progress/me", "/admin/users", "/admin/cms/dashboard"]) {
    const response = await request.get(`${api}${path}`);
    expect(response.status(), path).toBe(401);
  }
});

test("unknown courses return not found", async ({ request }) => {
  const unknownCourse = await request.get(`${api}/courses/no-such-course/library`);
  expect(unknownCourse.status()).toBe(404);
});

