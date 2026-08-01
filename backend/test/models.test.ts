import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Admin } from "../src/models/admin.js";
import { Like } from "../src/models/like.js";
import { Report } from "../src/models/report.js";
import { SavedRecipe } from "../src/models/savedRecipe.js";
import { User } from "../src/models/user.js";

function hasUniqueIndex(
  indexes: ReturnType<typeof Like.schema.indexes>,
  expectedFields: Record<string, number>,
): boolean {
  return indexes.some(([fields, options]) => (
    options.unique === true &&
    Object.entries(expectedFields).every(([key, value]) => fields[key] === value)
  ));
}

describe("database invariants", () => {
  it("does not select user or admin password by default", () => {
    assert.equal(User.schema.path("password").options.select, false);
    assert.equal(Admin.schema.path("password").options.select, false);
  });

  it("prevents duplicate like and save relationships", () => {
    assert.ok(hasUniqueIndex(Like.schema.indexes(), { recipe: 1, user: 1 }));
    assert.ok(hasUniqueIndex(SavedRecipe.schema.indexes(), { recipe: 1, user: 1 }));
  });

  it("prevents duplicate open reports from one user for one recipe", () => {
    assert.ok(hasUniqueIndex(Report.schema.indexes(), { recipe: 1, user: 1, status: 1 }));
  });
});
