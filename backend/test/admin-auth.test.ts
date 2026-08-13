import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import request from "supertest";

import app from "../src/app.js";
import { Admin } from "../src/models/admin.js";
import { User } from "../src/models/user.js";
import { createToken } from "../src/utils/token.js";

const ADMIN_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439012";
const restorers: Array<() => void> = [];

function replaceMethod<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: T[K],
): void {
  const writableTarget = target as Record<K, T[K]>;
  const original = writableTarget[key];
  writableTarget[key] = value;
  restorers.push(() => {
    writableTarget[key] = original;
  });
}

function setActiveAdmin(): void {
  replaceMethod(
    Admin,
    "findById",
    (() => ({
      select: () => ({ lean: async () => ({ username: "administrator" }) }),
    })) as unknown as typeof Admin.findById,
  );
}

function adminToken(): string {
  return createToken({ id: ADMIN_ID, username: "administrator", role: "admin" });
}

function userToken(): string {
  return createToken({ id: USER_ID, username: "koki", role: "user" });
}

afterEach(() => {
  while (restorers.length) restorers.pop()?.();
});

describe("administrator authorization and user update contract", () => {
  it("rejects absent and user-role access to protected administrator data", async () => {
    await request(app).get("/api/admin/users").expect(401);

    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${userToken()}`)
      .expect(403);
    assert.equal(response.body.code, "FORBIDDEN");
  });

  it("rejects administrator tokens for consumer-only recipe mutations", async () => {
    const response = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({})
      .expect(403);
    assert.equal(response.body.code, "FORBIDDEN");
  });

  it("rejects stale user and administrator principals during session refresh", async () => {
    replaceMethod(
      User,
      "findById",
      (() => ({
        select: () => ({ lean: async () => null }),
      })) as unknown as typeof User.findById,
    );
    await request(app)
      .get("/api/auth")
      .set("Authorization", `Bearer ${userToken()}`)
      .expect(401);

    replaceMethod(
      Admin,
      "findById",
      (() => ({
        select: () => ({ lean: async () => null }),
      })) as unknown as typeof Admin.findById,
    );
    await request(app)
      .get("/api/auth")
      .set("Authorization", `Bearer ${adminToken()}`)
      .expect(401);
  });

  it("hydrates a renamed user's current username for active sessions", async () => {
    replaceMethod(
      User,
      "findById",
      (() => ({
        select: () => ({ lean: async () => ({ username: "koki_baru" }) }),
      })) as unknown as typeof User.findById,
    );
    replaceMethod(
      User,
      "exists",
      (async (filter: { username?: string }) => {
        assert.equal(filter.username, "koki_baru");
        return { _id: USER_ID };
      }) as unknown as typeof User.exists,
    );

    const refreshed = await request(app)
      .get("/api/auth")
      .set("Authorization", `Bearer ${userToken()}`)
      .expect(200);
    assert.deepEqual(refreshed.body.user, {
      id: USER_ID,
      username: "koki_baru",
      role: "user",
    });

    const authorized = await request(app)
      .get("/api/auth/authorized/koki_baru")
      .set("Authorization", `Bearer ${userToken()}`)
      .expect(200);
    assert.equal(authorized.body.user.username, "koki_baru");
  });

  it("keeps existing admin list, detail, and delete endpoints protected", async () => {
    await request(app).get("/api/admin/users").expect(401);
    await request(app).get(`/api/admin/user/${USER_ID}`).expect(401);
    await request(app).delete(`/api/admin/user/${USER_ID}`).expect(401);
  });

  it("validates administrator user updates before querying a user", async () => {
    setActiveAdmin();

    const invalidId = await request(app)
      .put("/api/admin/user/not-an-id")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ username: "koki" })
      .expect(400);
    assert.equal(invalidId.body.code, "INVALID_ID");

    const empty = await request(app)
      .put(`/api/admin/user/${USER_ID}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({})
      .expect(400);
    assert.equal(empty.body.code, "EMPTY_UPDATE");

    const unknownField = await request(app)
      .put(`/api/admin/user/${USER_ID}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ website: "https://example.test" })
      .expect(400);
    assert.equal(unknownField.body.code, "VALIDATION_ERROR");

    const invalidUsername = await request(app)
      .put(`/api/admin/user/${USER_ID}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ username: "not valid" })
      .expect(400);
    assert.equal(invalidUsername.body.code, "VALIDATION_ERROR");

    const invalidEmail = await request(app)
      .put(`/api/admin/user/${USER_ID}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ email: "not-an-email" })
      .expect(400);
    assert.equal(invalidEmail.body.code, "VALIDATION_ERROR");
  });

  it("returns a not-found response when an administrator edits a missing user", async () => {
    setActiveAdmin();
    replaceMethod(
      User,
      "findById",
      (async () => null) as unknown as typeof User.findById,
    );

    const response = await request(app)
      .put(`/api/admin/user/${USER_ID}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ fullName: "Koki Baru" })
      .expect(404);
    assert.equal(response.body.code, "NOT_FOUND");
  });

  it("maps duplicate updates to 409 and returns successful updates without passwords", async () => {
    setActiveAdmin();
    const duplicateError = Object.assign(new Error("duplicate"), {
      code: 11000,
      keyValue: { email: "duplicate@example.test" },
    });
    replaceMethod(
      User,
      "findById",
      (async () => ({
        username: "koki",
        fullName: "Koki Lama",
        email: "duplicate@example.test",
        save: async () => {
          throw duplicateError;
        },
        toObject: () => ({}),
      })) as unknown as typeof User.findById,
    );

    const duplicate = await request(app)
      .put(`/api/admin/user/${USER_ID}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ email: "duplicate@example.test" })
      .expect(409);
    assert.equal(duplicate.body.code, "DUPLICATE_RECORD");

    const user = {
      username: "koki",
      fullName: "Koki Lama",
      email: "koki@example.test",
      save: async () => undefined,
      toObject: () => ({
        _id: USER_ID,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        password: "must-not-be-returned",
      }),
    };
    replaceMethod(
      User,
      "findById",
      (async () => user) as unknown as typeof User.findById,
    );

    const updated = await request(app)
      .put(`/api/admin/user/${USER_ID}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ username: "Koki_Baru", fullName: " Koki Baru ", email: "KOKI@EXAMPLE.TEST" })
      .expect(200);
    assert.equal(updated.body.message, "User updated successfully");
    assert.deepEqual(updated.body.user, {
      _id: USER_ID,
      username: "koki_baru",
      fullName: "Koki Baru",
      email: "koki@example.test",
    });
    assert.equal("password" in updated.body.user, false);
  });
});
