import { execSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outputPath = join(root, "src", "generated", "build-info.ts")

function read(command, fallback) {
  try {
    return execSync(command, { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || fallback
  } catch {
    return fallback
  }
}

const commit = process.env.VERCEL_GIT_COMMIT_SHA || read("git rev-parse HEAD", "local")
const shortCommit = commit === "local" ? "local" : commit.slice(0, 7)
const builtAt = new Date().toISOString()

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(
  outputPath,
  `export const buildInfo = ${JSON.stringify({ commit, shortCommit, builtAt }, null, 2)} as const\n`
)
