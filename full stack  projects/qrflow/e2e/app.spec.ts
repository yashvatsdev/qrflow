import { test, expect } from "@playwright/test";
import fs from "node:fs";
test("landing demo, FAQ, login and protected routes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Without",
  );
  await expect(page.getByAltText("Scannable QR code").first()).toHaveAttribute(
    "src",
    /^data:image\/png/,
  );
  await page
    .getByLabel("Destination URL", { exact: false })
    .fill("https://example.com/autumn-menu");
  await page
    .getByRole("button", { name: "Update destination", exact: true })
    .click();
  await expect(page.locator(".lp-redirect")).toContainText(
    "https://example.com/autumn-menu",
  );
  await page.getByText("Can I change the link after printing?").click();
  await expect(page.getByText("Yes. Edit the destination")).toBeVisible();
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
test("public routes reject unknown and malformed codes", async ({
  request,
}) => {
  expect((await request.get("/r/not-valid")).status()).toBe(404);
  expect((await request.get("/r/AAAAAAAAAAAAAAAAAAAAAA")).status()).toBe(404);
  const denied = await request.post("/api/qr", {
    headers: { origin: "https://evil.example" },
    data: { name: "Abuse" },
  });
  expect(denied.status()).toBe(403);
});
test("responsive landing has no horizontal overflow", async ({ page }) => {
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/landing-${width}.png`,
      fullPage: true,
    });
  }
});
test("authenticated create, download, redirect, update, analytics, pause, resume, delete", async ({
  page,
  context,
  request,
}) => {
  test.skip(
    !fs.existsSync(".e2e/storage.json"),
    "Requires a real Supabase test session; see README.",
  );
  const state = JSON.parse(fs.readFileSync(".e2e/storage.json", "utf8"));
  await context.addCookies(state.cookies);
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Your overview" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Create QR code", exact: true })
    .first()
    .click();
  await page.getByLabel("QR code name").fill(`E2E ${Date.now()}`);
  await page.getByLabel("Destination URL").fill("https://example.com/first");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("PNG download resolution").selectOption("512");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Create QR code", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Your next connection is ready." }),
  ).toBeVisible();
  const url = await page.locator("a.public-url").getAttribute("href");
  expect(url).toBeTruthy();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  expect((await download).suggestedFilename()).toMatch(/\.png$/);
  const svgDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download SVG" }).click();
  expect((await svgDownload).suggestedFilename()).toMatch(/\.svg$/);
  let result = await request.get(url!, { maxRedirects: 0 });
  expect(result.status()).toBe(302);
  expect(result.headers().location).toBe("https://example.com/first");
  await page.getByRole("button", { name: "View QR details" }).click();
  await page.getByRole("button", { name: "Edit QR code" }).click();
  await page.getByLabel("Destination URL").fill("https://example.com/updated");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Your QR code is updated." }),
  ).toBeVisible();
  result = await request.get(url!, { maxRedirects: 0 });
  expect(result.status()).toBe(302);
  expect(result.headers().location).toBe("https://example.com/updated");
  await page.getByRole("button", { name: "View QR details" }).click();
  await expect(page.getByText("2 total recorded scans")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  expect((await request.get(url!, { maxRedirects: 0 })).status()).toBe(410);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  expect((await request.get(url!, { maxRedirects: 0 })).status()).toBe(302);
  await page.getByRole("tab", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page).toHaveURL(/\/dashboard\/codes$/);
  expect((await request.get(url!, { maxRedirects: 0 })).status()).toBe(404);
});
