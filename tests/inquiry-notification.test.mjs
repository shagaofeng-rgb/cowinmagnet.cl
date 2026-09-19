import test from "node:test";
import assert from "node:assert/strict";
import {
  INQUIRY_NOTIFICATION_RECIPIENT,
  buildInquiryNotification
} from "../lib/inquiryNotification.js";

test("inquiry notifications always go to the Cowinmagnet.cl inbox and identify their source", () => {
  const notification = buildInquiryNotification({
    name: "Test customer",
    email: "customer@example.com",
    sourceUrl: "https://cowinmagnet.cl/en/products/test-product?utm_source=test",
    createdAt: "2026-09-19T00:00:00.000Z"
  });

  assert.equal(INQUIRY_NOTIFICATION_RECIPIENT, "info@cowinmagnet.com");
  assert.equal(notification.to, "info@cowinmagnet.com");
  assert.match(notification.subject, /^\[cowinmagnet\.cl website\]/);
  assert.match(notification.text, /Website: cowinmagnet\.cl/);
  assert.match(notification.text, /Source page: https:\/\/cowinmagnet\.cl\/en\/products\/test-product/);
});
