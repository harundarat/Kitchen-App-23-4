import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import request from "supertest";

import app from "../src/app.js";
import { Recipe } from "../src/models/recipe.js";
import { User } from "../src/models/user.js";
import { createToken } from "../src/utils/token.js";

const USER_ID = "507f1f77bcf86cd799439012";
const ADMIN_ID = "507f1f77bcf86cd799439013";
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

afterEach(() => {
  while (restorers.length) restorers.pop()?.();
});

describe("home recommendations", () => {
  it("uses the anonymous fallback without a cookie and for an admin session", async () => {
    const fallbackRecipes = [{ _id: "fallback-recipe", title: "Resep acak" }];
    let userLookups = 0;

    replaceMethod(
      User,
      "findById",
      (() => {
        userLookups += 1;
        throw new Error("Admin and anonymous requests must not query a user profile");
      }) as unknown as typeof User.findById,
    );
    replaceMethod(
      Recipe,
      "aggregate",
      (async () => fallbackRecipes) as unknown as typeof Recipe.aggregate,
    );

    const anonymous = await request(app).get("/api/for-you").expect(200);
    assert.deepEqual(anonymous.body.recipes, fallbackRecipes);

    const adminToken = createToken({
      id: ADMIN_ID,
      username: "administrator",
      role: "admin",
    });
    const admin = await request(app)
      .get("/api/for-you")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    assert.deepEqual(admin.body.recipes, fallbackRecipes);
    assert.equal(userLookups, 0);
  });

  it("keeps preference-based recommendations for an authenticated user", async () => {
    const personalizedRecipes = [
      { _id: "personalized-recipe", title: "Sup seafood" },
    ];
    let recommendationFilter: unknown;

    replaceMethod(
      User,
      "findById",
      ((id: string) => {
        assert.equal(id, USER_ID);
        return {
          select: () => ({
            lean: async () => ({ preferences: ["Seafood"] }),
          }),
        };
      }) as unknown as typeof User.findById,
    );
    replaceMethod(
      Recipe,
      "find",
      ((filter: unknown) => {
        recommendationFilter = filter;
        return {
          select: () => ({
            populate: () => ({
              sort: () => ({
                limit: async () => personalizedRecipes,
              }),
            }),
          }),
        };
      }) as unknown as typeof Recipe.find,
    );

    const userToken = createToken({
      id: USER_ID,
      username: "koki",
      role: "user",
    });
    const response = await request(app)
      .get("/api/for-you")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    assert.deepEqual(recommendationFilter, {
      categories: { $in: ["Seafood"] },
    });
    assert.deepEqual(response.body.recipes, personalizedRecipes);
  });
});
