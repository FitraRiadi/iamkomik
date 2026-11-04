import { chromium } from "playwright-core"
import fs from "node:fs"
import path from "node:path"

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const root = process.cwd()
const iconDir = path.join(root, "public", "icons")
fs.mkdirSync(iconDir, { recursive: true })

const favicon = fs.readFileSync(path.join(root, "public", "favicon.svg"), "utf8")
const logoSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="width:62%;height:62%">
  <path d="M17 18h9v12.5l8.5-12.5H45L34.5 32 46 46h-11l-9-13v13h-9V18Z" fill="#fff"/>
  <circle cx="49" cy="16" r="5" fill="#fff" opacity=".55"/>
</svg>`

const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
})

async function render(file, size, html, omitBackground) {
  const context = await browser.newContext({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.setContent(
    `<html><head><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: ${size}px; height: ${size}px; }
      body { overflow: hidden; }
      svg { display: block; }
    </style></head><body>${html}</body></html>`,
    { waitUntil: "load" },
  )
  await page.screenshot({
    path: path.join(iconDir, file),
    omitBackground,
    clip: { x: 0, y: 0, width: size, height: size },
  })
  await context.close()
  console.log("generated", path.join("public", "icons", file))
}

await render(
  "icon-192.png",
  192,
  `<div style="width:192px;height:192px">${favicon.replace("<svg", '<svg width="192" height="192"')}</div>`,
  true,
)
await render(
  "icon-512.png",
  512,
  `<div style="width:512px;height:512px">${favicon.replace("<svg", '<svg width="512" height="512"')}</div>`,
  true,
)
await render(
  "icon-maskable-512.png",
  512,
  `<div style="width:512px;height:512px;background:#e11d48;display:grid;place-items:center">${logoSvg}</div>`,
  false,
)

const appleContext = await browser.newContext({
  viewport: { width: 180, height: 180 },
  deviceScaleFactor: 1,
})
const applePage = await appleContext.newPage()
await applePage.setContent(
  `<html><body style="margin:0;width:180px;height:180px;background:#e11d48;display:grid;place-items:center;overflow:hidden">
    ${logoSvg}
  </body></html>`,
  { waitUntil: "load" },
)
await applePage.screenshot({
  path: path.join(root, "public", "apple-touch-icon.png"),
  clip: { x: 0, y: 0, width: 180, height: 180 },
})
console.log("generated public/apple-touch-icon.png")
await appleContext.close()

await browser.close()
