// Single-process harness: boots `vite preview` and drives Playwright inside
// the SAME shell invocation, sidestepping the sandbox's per-shell-call
// network namespace isolation that breaks cross-call browser testing.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const PORT = 4321;
const BASE = `http://127.0.0.1:${PORT}/`;
const SHOT_DIR = path.join(__dirname, "screenshots");

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        // not up yet
      }
      if (Date.now() - start > timeoutMs) return reject(new Error("server did not start in time"));
      setTimeout(tick, 300);
    };
    tick();
  });
}

async function main() {
  const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverLog = "";
  server.stdout.on("data", (d) => (serverLog += d.toString()));
  server.stderr.on("data", (d) => (serverLog += d.toString()));

  const consoleErrors = [];
  let browser;
  try {
    await waitForServer(BASE);
    browser = await chromium.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

    await page.goto(BASE, { waitUntil: "load" });
    await page.waitForSelector(".slide", { timeout: 10000 });

    // --- Slides 1-5 still work: walk through each, screenshot, check no overflow ---
    for (let i = 1; i <= 5; i += 1) {
      await page.keyboard.press(String(i));
      await page.waitForTimeout(450);
      const scrollHeight = await page.evaluate(() => document.querySelector(".slide")?.scrollHeight ?? 0);
      const clientHeight = await page.evaluate(() => window.innerHeight);
      console.log(`slide ${i}: scrollHeight=${scrollHeight} viewport=${clientHeight} overflow=${scrollHeight > clientHeight + 4}`);
      await page.screenshot({ path: path.join(SHOT_DIR, `slide-${i}.png`) });
    }

    // --- Slide 6: idle state ---
    await page.keyboard.press("6");
    await page.waitForTimeout(400);
    await page.waitForSelector(".live-input-row", { timeout: 5000 });
    await page.screenshot({ path: path.join(SHOT_DIR, "slide-6-idle.png") });
    console.log("slide 6 idle state rendered OK");

    // --- Slide 6: run real model ---
    const input = page.locator(".live-text-input");
    await input.fill("The trophy didn't fit in the suitcase because it was too big");
    await page.click("text=Run real model");

    await page.waitForSelector(".live-status", { timeout: 5000 }).catch(() => {});
    await page.screenshot({ path: path.join(SHOT_DIR, "slide-6-loading.png") });
    console.log("slide 6 loading state captured");

    // Model download + inference: generous timeout for the one-time ~91MB fetch.
    await page.waitForSelector(".live-grid", { timeout: 120000 });
    await page.waitForTimeout(300);

    const heatmapCells = await page.locator(".live-grid .heatmap span").count();
    const tokenPills = await page.locator(".live-grid .token-pill").count();
    const arcPaths = await page.locator(".live-grid .attention-arcs path").count();
    console.log(`slide 6 ready: heatmapCells=${heatmapCells} tokenPills=${tokenPills} arcPaths=${arcPaths}`);
    if (heatmapCells === 0 || tokenPills === 0) throw new Error("live model results did not render");

    await page.screenshot({ path: path.join(SHOT_DIR, "slide-6-ready.png") });

    // Switch layer + head, click a token, confirm re-render (heatmap cell count is n^2, constant; just confirm no crash + arcs update).
    await page.click(".layer-buttons >> text=L1");
    await page.waitForTimeout(200);
    await page.selectOption(".head-select", "0");
    await page.waitForTimeout(200);
    await page.click(".live-grid .token-pill >> nth=2");
    await page.waitForTimeout(200);
    const arcPathsAfter = await page.locator(".live-grid .attention-arcs path").count();
    console.log(`after layer/head/token switch: arcPaths=${arcPathsAfter}`);
    await page.screenshot({ path: path.join(SHOT_DIR, "slide-6-switched.png") });

    console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors));
    console.log(consoleErrors.length === 0 ? "PASS: no console errors" : "FAIL: console errors present");
    console.log("HARNESS_RESULT: SUCCESS");
  } catch (err) {
    console.log("SERVER_LOG_TAIL:", serverLog.slice(-2000));
    console.log("HARNESS_RESULT: FAILURE", err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main();
