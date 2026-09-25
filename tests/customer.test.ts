import assert from "node:assert/strict";
import test from "node:test";

import { customerSummary, localSession } from "../src/domain/customer.ts";

test("local mode never invents a customer identity", () => {
  assert.equal(customerSummary(localSession).title, "Seu espaço, sem conta");
});

test("account presentation uses the identity supplied by an authenticated adapter", () => {
  assert.deepEqual(
    customerSummary({
      status: "authenticated",
      customer: { id: "test", displayName: "Ana", email: "ana@example.test" },
    }),
    { title: "Ana", detail: "ana@example.test" },
  );
});
