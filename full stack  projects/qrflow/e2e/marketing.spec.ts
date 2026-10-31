import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { PNG } from "pngjs";
import jsQR from "jsqr";

test("demo validates URLs and preserves a real QR through updates and scans", async ({
  page,
}) => {
  await page.goto("/");
  const demo = page.locator("#live-demo");
  const qr = demo.getByAltText("Scannable QR code");
  await expect(qr).toHaveAttribute("src", /^data:image\/png/);
  const src = await qr.getAttribute("src");
  await demo.getByLabel("Destination URL").fill("javascript:alert(1)");
  await demo.getByRole("button", { name: "Update destination" }).click();
  await expect(
    demo.getByText("Enter a valid HTTP or HTTPS URL", { exact: false }),
  ).toBeVisible();
  await demo.getByLabel("Destination URL").fill("https://example.com/new-menu");
  await demo.getByRole("button", { name: "Update destination" }).click();
  await expect(demo.locator(".lp-redirect")).toContainText(
    "https://example.com/new-menu",
  );
  await expect(qr).toHaveAttribute("src", src!);
  await demo.getByRole("button", { name: "Simulate scan" }).click();
  await expect(demo.getByRole("status")).toContainText(
    "Simulated scan successful",
  );
  await expect(demo.locator(".lp-simulate")).toContainText("1 demo scans");
  const png = PNG.sync.read(Buffer.from(src!.split(",")[1], "base64"));
  expect(
    jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data,
  ).toBe("https://github.com/yashvatsdev/qrflow");
});

test("all feature previews work, with readable colors and actual export files", async ({
  page,
}) => {
  await page.goto("/");
  const tabs = page.getByRole("tablist", { name: "Explore QRFlow features" });
  await tabs.getByRole("tab", { name: "Dynamic destinations" }).click();
  await page.getByRole("button", { name: "Switch to autumn menu" }).click();
  await expect(page.locator(".lp-mini-destination")).toContainText(
    "autumn-menu",
  );
  await tabs.getByRole("tab", { name: "Scan analytics" }).click();
  await page.getByRole("button", { name: "30 days", exact: true }).click();
  await expect(page.locator(".lp-feature-panel .lp-chart-value")).toContainText(
    "1,724",
  );
  await tabs.getByRole("tab", { name: "Custom QR colors" }).click();
  await page.getByLabel("Foreground", { exact: true }).fill("#ffffff");
  await expect(
    page.locator(".lp-feature-panel").getByRole("alert"),
  ).toContainText("at least 4.5:1 contrast");
  await page.getByLabel("Foreground", { exact: true }).fill("#123456");
  await expect(page.getByText("Contrast check passed")).toBeVisible();
  await tabs.getByRole("tab", { name: "Instant updates" }).click();
  await page.getByRole("button", { name: "Switch to summer menu" }).click();
  await expect(page.locator(".lp-mini-destination")).toContainText(
    "summer-menu",
  );
  await tabs.getByRole("tab", { name: "PNG & SVG exports" }).click();
  const pngEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  const pngDownload = await pngEvent;
  expect(pngDownload.suggestedFilename()).toBe("qrflow-demo.png");
  const bytes = await fs.readFile((await pngDownload.path())!);
  const png = PNG.sync.read(bytes);
  expect(png.width).toBe(1024);
  expect(
    jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data,
  ).toBe("https://github.com/yashvatsdev/qrflow");
  const svgEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download SVG" }).click();
  const svg = await svgEvent;
  expect(svg.suggestedFilename()).toBe("qrflow-demo.svg");
  expect(await fs.readFile((await svg.path())!, "utf8")).toContain("<svg");
  await tabs.getByRole("tab", { name: "Active / paused" }).click();
  await page.getByRole("button", { name: "Pause demo code" }).click();
  await page.getByRole("button", { name: "Test demo scan" }).click();
  await expect(page.locator(".lp-lab-status")).toContainText("410");
  await page.getByRole("button", { name: "Resume demo code" }).click();
  await page.getByRole("button", { name: "Test demo scan" }).click();
  await expect(page.locator(".lp-lab-status")).toContainText("302");
});

test("use cases support keyboard navigation and FAQ opens accessibly", async ({
  page,
}) => {
  await page.goto("/");
  const tab = page.getByRole("tab", { name: "Restaurants", exact: true });
  await expect(
    page.locator(".lp-usecases").getByAltText("Scannable QR code"),
  ).toHaveAttribute("src", /^data:image\/png/);
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Events", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Every detail. Up to date." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next use case" }).click();
  await expect(
    page.getByRole("heading", { name: "Make every package a beginning." }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Creators", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your work keeps evolving." }),
  ).toBeVisible();
  const question = page.getByRole("button", {
    name: "Can I change the link after printing?",
  });
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("region", { name: "Can I change the link after printing?" }),
  ).toContainText("Yes. Edit the destination");
  await question.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "false");
});

test("mobile navigation traps focus, closes on Escape and has no pinned story", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.locator("#live-demo").getByAltText("Scannable QR code"),
  ).toHaveAttribute("src", /^data:image\/png/);
  const open = page.getByRole("button", { name: "Open navigation" });
  await open.click();
  await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  for (let index = 0; index < 10; index++) {
    await page.keyboard.press("Tab");
    expect(
      await page
        .getByRole("dialog")
        .evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await expect(page.getByRole("dialog")).toContainText("Create your free QR");
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await open.click();
  await page
    .getByRole("navigation", { name: "Mobile" })
    .getByRole("link", { name: "Features" })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".lp-story")).not.toHaveAttribute(
    "data-pinned",
    "true",
  );
  for (const title of ["Create.", "Share.", "Update.", "Track."]) {
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("reduced motion shows every scene without a pinned scroll spacer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".lp-story")).not.toHaveAttribute(
    "data-pinned",
    "true",
  );
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  for (const scene of await page.locator(".lp-scene").all())
    await expect(scene).toHaveCSS("opacity", "1");
});

test("desktop scroll story advances through four scenes and cleans up on resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".lp-story")).toHaveAttribute(
    "data-pinned",
    "true",
  );
  const start = await page
    .locator(".pin-spacer")
    .evaluate((el) => el.getBoundingClientRect().top + window.scrollY - 80);
  for (const [index, progress] of [0.05, 0.4, 0.65, 0.95].entries()) {
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      start + progress * 2000,
    );
    await expect
      .poll(() =>
        page
          .locator(".lp-story")
          .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBe(80);
    await expect(page.locator(".lp-scene").nth(index)).toHaveCSS(
      "opacity",
      "1",
      { timeout: 5000 },
    );
  }
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  for (const scene of await page.locator(".lp-scene").all())
    await expect(scene).toHaveCSS("opacity", "1");
  await page.setViewportSize({ width: 1440, height: 650 });
  await expect(page.locator(".lp-story")).not.toHaveAttribute(
    "data-pinned",
    "true",
  );
  expect(errors).toEqual([]);
});
