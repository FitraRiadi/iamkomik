import { chromium } from "playwright-core"
import fs from "node:fs"

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const out = "C:\\Users\\DADEUNK\\AppData\\Local\\Temp\\iamkomik-shots"
fs.mkdirSync(out, { recursive: true })

const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
})

const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
})
await context.addInitScript(() => {
  localStorage.setItem("iamkomik-reader-id", "fresh-reader-2026")
  localStorage.setItem("iamkomik-theme", "light")
})
const page = await context.newPage()

const targets = [
  { name: "home-top", url: "http://127.0.0.1:5173/", scroll: 0 },
  { name: "home-trending", url: "http://127.0.0.1:5173/", scroll: 780 },
  { name: "explore", url: "http://127.0.0.1:5173/jelajah", scroll: 0 },
  { name: "comic-detail", url: "http://127.0.0.1:5173/komik/solo-swordmaster", scroll: 0 },
  { name: "reader", url: "http://127.0.0.1:5173/baca/solo-swordmaster/solo-swordmaster-chapter-1", scroll: 0 },
  { name: "library", url: "http://127.0.0.1:5173/koleksi", scroll: 0 },
  { name: "dashboard", url: "http://127.0.0.1:5173/dashboard", scroll: 0 },
  { name: "anime", url: "http://127.0.0.1:5173/anime", scroll: 0 },
]

for (const target of targets) {
  await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60000 })
  await page.waitForTimeout(9000)
  if (target.scroll) {
    await page.evaluate((y) => window.scrollTo(0, y), target.scroll)
    await page.waitForTimeout(1200)
  }
  await page.screenshot({ path: `${out}\\${target.name}.png` })
  console.log("shot", target.name)
}

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
})
await mobile.addInitScript(() => {
  localStorage.setItem("iamkomik-reader-id", "fresh-reader-2026")
  localStorage.setItem("iamkomik-theme", "light")
})
const mobilePage = await mobile.newPage()
await mobilePage.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded", timeout: 60000 })
await mobilePage.waitForTimeout(9000)
await mobilePage.screenshot({ path: `${out}\\mobile-home.png` })
console.log("shot mobile-home")

await browser.close()
