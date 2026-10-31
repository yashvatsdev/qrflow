import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import axe from "axe-core";

// Real client components in an isolated test server; no app auth bypass or fixture route.
let server: { close: () => Promise<void> };
const origin = "http://127.0.0.1:3210";
test.beforeAll(async () => {
  const resolve = createRequire(require.resolve("vitest/package.json"));
  const { createServer } = await import(
    pathToFileURL(resolve.resolve("vite")).href
  );
  const fixture = path.resolve("e2e/workspace-fixture");
  const vite = await createServer({
    configFile: false,
    root: fixture,
    publicDir: false,
    server: {
      host: "127.0.0.1",
      port: 3210,
      strictPort: true,
      fs: { allow: [path.resolve(".")] },
    },
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve("src") },
        {
          find: "next/navigation",
          replacement: path.join(fixture, "navigation.tsx"),
        },
        { find: "next/link", replacement: path.join(fixture, "link.tsx") },
        { find: "next/image", replacement: path.join(fixture, "image.tsx") },
      ],
    },
    oxc: { jsx: { runtime: "automatic" } },
    plugins: [
      {
        name: "fixture-global-css",
        enforce: "pre",
        transform(code: string, id: string) {
          if (id.endsWith("/globals.css"))
            return code
              .replace(/@import[^;]+;/g, "")
              .replace(/@custom-variant[^;]+;/g, "")
              .replace(/@theme inline \{[\s\S]*?\n\}/, "");
        },
      },
    ],
  });
  await vite.listen();
  server = vite;
});
test.afterAll(async () => {
  await server?.close();
});

const code = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "fixture-owner",
  slug: "AAAAAAAAAAAAAAAAAAAAAA",
  name: "Summer menu",
  destination_url: "https://example.com/menu",
  status: "active",
  style_config: {
    foreground: "#0b0f14",
    background: "#ffffff",
    resolution: 1024,
  },
  created_at: "2026-10-29T10:00:00Z",
  updated_at: "2026-10-29T10:00:00Z",
};

test("management searches, sorts, filters, and applies only successful server responses", async ({
  page,
}) => {
  await page.goto(`${origin}/?view=list`);
  await expect(page.locator(".dw-code-item")).toHaveCount(2);
  await page.getByLabel("Search QR codes").fill("exhibition");
  await expect(page.locator(".dw-code-item")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear search" }).click();
  await page.getByLabel("Sort QR codes").selectOption("name");
  await expect(page.locator(".dw-code-item").first()).toContainText(
    "Exhibition guide",
  );
  await page.getByLabel("Status", { exact: true }).selectOption("active");
  await expect(page.locator(".dw-code-item")).toHaveCount(1);
  await page.route("**/api/qr/*", (route) =>
    route.fulfill({
      status: 503,
      json: { error: { message: "Database unavailable. Retry." } },
    }),
  );
  await page
    .getByRole("button", { name: "Pause Summer menu", exact: true })
    .click();
  await expect(page.locator(".dw-inline-error")).toContainText(
    "Database unavailable",
  );
  await expect(page.locator(".dw-code-item .badge")).toHaveText("active");
  await page.unroute("**/api/qr/*");
  await page.route("**/api/qr/*", (route) =>
    route.fulfill({ json: { data: { ...code, status: "paused" } } }),
  );
  await page
    .getByRole("button", { name: "Pause Summer menu", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "No matching QR codes" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search & filters" }).click();
  await page
    .getByRole("button", { name: "Delete Summer menu", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Delete this QR code?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".dw-code-item")).toHaveCount(2);
  await page.unroute("**/api/qr/*");
  await page.route("**/api/qr/*", (route) =>
    route.fulfill({ json: { data: { deleted: true } } }),
  );
  await page
    .getByRole("button", { name: "Delete Summer menu", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page.locator(".dw-code-item")).toHaveCount(1);
});

test("studio preserves keyboard form state, validates contrast, and waits for save success", async ({
  page,
}) => {
  await page.goto(`${origin}/?view=editor`);
  await page.getByLabel("QR code name").fill("Studio integration code");
  await page
    .getByLabel("Destination URL", { exact: true })
    .fill("https://example.com/studio");
  await page.getByLabel("Destination URL", { exact: true }).press("Enter");
  await page.getByLabel("Foreground color").fill("#ffffff");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".error-text")).toContainText("4.5:1");
  await page.getByLabel("Foreground color").fill("#123456");
  await page.getByLabel("PNG download resolution").selectOption("512");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Foreground color")).toHaveValue("#123456");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.route("**/api/qr", (route) =>
    route.fulfill({
      status: 429,
      json: { error: { message: "Daily write limit reached." } },
    }),
  );
  await page
    .getByRole("button", { name: "Create QR code", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Your next connection is ready." }),
  ).toHaveCount(0);
  await expect(page.locator(".error-text")).toContainText("Daily write limit");
  await page.unroute("**/api/qr");
  await page.route("**/api/qr", (route) => {
    const input = route.request().postDataJSON();
    return route.fulfill({ json: { data: { ...code, ...input } } });
  });
  await page
    .getByRole("button", { name: "Create QR code", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Your next connection is ready." }),
  ).toBeVisible();
  await expect(page.getByAltText("Scannable QR code")).toHaveAttribute(
    "src",
    /^data:image\/png/,
  );
});

test("editing a destination preserves its QR image and details tabs work", async ({
  page,
}) => {
  await page.goto(`${origin}/?view=edit`);
  const qr = page.getByAltText("Scannable QR code");
  await expect(qr).toHaveAttribute("src", /^data:image\/png/);
  const before = await qr.getAttribute("src");
  await page
    .getByLabel("Destination URL", { exact: true })
    .fill("https://example.com/updated");
  await expect(qr).toHaveAttribute("src", before!);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.route("**/api/qr/*", (route) =>
    route.fulfill({
      json: {
        data: { ...code, destination_url: "https://example.com/updated" },
      },
    }),
  );
  await page.getByRole("button", { name: "Save changes" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Your QR code is updated." }),
  ).toBeVisible();
  await expect(qr).toHaveAttribute("src", before!);
  await page.goto(`${origin}/?view=detail`);
  await page.getByRole("tab", { name: "Analytics", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Scan activity" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Last 7 days", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Last 7 days", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: "Settings", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Availability" }),
  ).toBeVisible();
});

test("workspace layouts, navigation, empty states, and reduced motion", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const view of ["overview", "list", "editor", "detail", "empty"]) {
      await page.goto(`${origin}/?view=${view}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/workspace-${view}-${width}.png`,
        fullPage: true,
      });
    }
  }
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator(".dw-workspace")).toHaveAttribute(
    "data-collapsed",
    "true",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open workspace navigation" }).click();
  await expect(
    page.getByRole("dialog", { name: "Workspace navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open workspace navigation" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await expect(
    page.getByRole("menuitem", { name: "Profile & settings" }),
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "Sign out", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open profile menu" }),
  ).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${origin}/?view=editor`);
  await expect(
    page.getByRole("heading", { name: "Where are we going?" }),
  ).toBeVisible();
});

test("workspace accessibility across desktop, tablet, mobile and dialogs", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const view of ["overview", "list", "editor", "detail", "empty"]) {
      await page.goto(`${origin}/?view=${view}`);
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => {
        const result = await (
          window as typeof window & { axe: typeof axe }
        ).axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        });
        return result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        }));
      });
      expect(violations, `${view} at ${width}px`).toEqual([]);
    }
  }
  await page.goto(`${origin}/?view=list`);
  await page
    .getByRole("button", { name: "Delete Summer menu", exact: true })
    .click();
  await page.addScriptTag({ content: axe.source });
  await expect(
    page.getByRole("dialog", { name: "Delete this QR code?" }),
  ).toHaveCSS("opacity", "1");
  expect(
    await page.evaluate(async () => {
      const r = await (window as typeof window & { axe: typeof axe }).axe.run(
        document,
        { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } },
      );
      return r.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.failureSummary),
      }));
    }),
  ).toEqual([]);
});
