import assert from "node:assert/strict";
import { describe, it } from "node:test";

import request from "supertest";

import app from "../src/app.js";

describe("application shell", () => {
  it("returns API metadata", async () => {
    const response = await request(app).get("/api").expect(200);
    assert.equal(response.body.name, "KitchenCraft API");
    assert.equal(response.body.version, "2.0.0");
  });

  it("returns health information without leaking framework headers", async () => {
    const response = await request(app).get("/health").expect(200);
    assert.equal(response.body.status, "ok");
    assert.equal(response.headers["x-powered-by"], undefined);
  });

  it("allows a configured development origin", async () => {
    const response = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:5173")
      .expect(200);
    assert.equal(response.headers["access-control-allow-origin"], "http://localhost:5173");
    assert.equal(response.headers["access-control-allow-credentials"], "true");
  });

  it("rejects an unconfigured origin", async () => {
    const response = await request(app)
      .get("/health")
      .set("Origin", "https://blocked.example")
      .expect(403);
    assert.equal(response.body.code, "CORS_NOT_ALLOWED");
  });

  it("returns a structured 404", async () => {
    const response = await request(app).get("/does-not-exist").expect(404);
    assert.equal(response.body.error, "Route not found");
  });

  it("uses Express 5 async error propagation for validation failures", async () => {
    const response = await request(app).get("/api/recipes/not-an-object-id").expect(400);
    assert.equal(response.body.code, "INVALID_ID");
  });

  it("rejects protected routes without a JWT", async () => {
    const response = await request(app).post("/api/recipes").expect(401);
    assert.equal(response.body.code, "UNAUTHENTICATED");
  });

  it("returns structured Zod validation details", async () => {
    const response = await request(app)
      .post("/api/users/register")
      .send({ email: "not-an-email" })
      .expect(400);
    assert.equal(response.body.code, "VALIDATION_ERROR");
    assert.ok(response.body.details.fieldErrors.email);
  });

  it("maps malformed JSON to a client error", async () => {
    const response = await request(app)
      .post("/api/users/register")
      .set("Content-Type", "application/json")
      .send('{"email":')
      .expect(400);
    assert.equal(response.body.code, "INVALID_JSON");
  });

  it("rejects a tampered JWT", async () => {
    const response = await request(app)
      .get("/api/auth")
      .set("Authorization", "Bearer invalid.jwt.value")
      .expect(401);
    assert.equal(response.body.code, "UNAUTHENTICATED");
  });
});
