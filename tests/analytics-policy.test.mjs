import assert from "node:assert/strict";
import test from "node:test";
import { classifyTraffic, classifyVisitor, maskIp } from "../lib/analyticsPolicy.js";

test("marks explicit test, collector and automated traffic as excluded", () => {
  assert.deepEqual(classifyTraffic({ page: "/es-cl?analytics_test=1" }), { excluded: true, reason: "explicit-test" });
  assert.deepEqual(classifyTraffic({ referrer: "https://collects.example.test" }), { excluded: true, reason: "collector-traffic" });
  assert.deepEqual(classifyTraffic({ userAgent: "Mozilla/5.0 Lighthouse" }), { excluded: true, reason: "automated-agent" });
});

test("protects visitor IP details and assigns useful visitor classes", () => {
  assert.equal(maskIp("171.22.78.96"), "171.22.78.*");
  assert.equal(classifyVisitor({ sessions: 1, pageCount: 1 }), "New");
  assert.equal(classifyVisitor({ sessions: 2, pageCount: 2 }), "Returning");
  assert.equal(classifyVisitor({ sessions: 3, pageCount: 4 }), "High intent");
  assert.equal(classifyVisitor({ isLead: true }), "Lead");
});
