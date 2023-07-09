import settings from "./settings.json" assert { type: "json" }
import { Canvas, loadImage } from "skia-canvas"
import child_process from "node:child_process"
import Client from "ssh2-sftp-client"
import { Client as SSH } from "ssh2"
import schedule from "node-schedule"
import fs from "node:fs"

if (fs.existsSync("images")) fs.rmSync("images", { recursive: true, force: true })
fs.mkdirSync("images")

function spawn(exe, args, data = { stdio: "ignore" }) {
  const p = child_process.spawn(exe, args, data)
  p.promise = new Promise((fulfil, reject) => {
    p.on("close", fulfil)
    p.on("error", reject)
  })
  return p
}

const conn = new SSH()
const sftp = new Client()

let progress = 0

let running
async function run() {
  if (running) return
  running = true
  for (let x = 0; x < 5; x++) {
    conn.exec("activator send libactivator.camera.invoke-shutter", () => {})
    await new Promise(fulfil => setTimeout(fulfil, 1000))
  }
  await new Promise(fulfil => setTimeout(fulfil, 4000))
  const files = (await sftp.list("/private/var/mobile/Media/DCIM/100APPLE")).filter(e => e.name.endsWith(".JPG")).sort((a, b) => b.modifyTime - a.modifyTime).slice(0, 5)
  for (const [i, file] of files.entries()) {
    await sftp.get(`/private/var/mobile/Media/DCIM/100APPLE/${file.name}`, `images/${progress}.${i}.jpg`)
  }
  const p = spawn("ffmpeg", ["-i", `images/${progress}.%d.jpg`, "-lavfi", "tmix=frames=5:weights=1", `images/${progress}.png`])
  await p.promise
  console.log(`Photo ${progress + 1} taken at ${new Date}`)
  progress++
  running = false
  if (progress >= settings.photos) {
    job.cancel()
    finish()
  }
}

async function finish() {
  const images = []
  for (let x = 0; x < settings.photos; x++) {
    images.push(await loadImage(`images/${x}.png`))
  }
  const canvas = new Canvas(images[0].width, images[0].height)
  const ctx = canvas.getContext("2d")
  const width = canvas.width / settings.photos
  const w = Math.ceil(width)
  for (let [i, img] of images.entries()) {
    const x = Math.floor(i * width)
    ctx.drawImage(img, x, 0, w, canvas.height, x, 0, w, canvas.height)
  }
  canvas.saveAs("output.png")
  sftp.end()
  conn.end()
}

let job
conn.on("ready", () => {
  console.log("SSH connection established")
  job = schedule.scheduleJob(settings.cron, run)
})

await sftp.connect({
  host: settings.ip,
  port: 22,
  username: "root",
  password: settings.password
})

conn.connect({
  host: settings.ip,
  port: 22,
  username: "root",
  password: settings.password
})