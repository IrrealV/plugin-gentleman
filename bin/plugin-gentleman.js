#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { homedir } from "node:os"

const name = "plugin-gentleman"
const defaultConfig = () => resolve(homedir(), ".config", "opencode", "tui.json")

const help = `Usage:
  plugin-gentleman setup [flags]
  plugin-gentleman configure [flags]

Flags:
  --mode auto|off          Set Mustachi personality mode
  --model provider/model   Set preferred personality model; empty clears it
  --enable                 Enable Mustachi personality UX
  --disable                Disable Mustachi personality UX
  --config <path>          Use a custom OpenCode TUI config path
  --dry-run                Print the updated JSON without writing
  -h, --help               Show this help

Examples:
  plugin-gentleman setup --mode auto --model google/gemini-2.5-flash
  plugin-gentleman configure --disable
  plugin-gentleman configure --model ""
`

const fail = (message) => {
  console.error(`plugin-gentleman: ${message}`)
  process.exit(1)
}

const readValue = (args, index, flag) => {
  const current = args[index]
  const eq = current.indexOf("=")
  if (eq !== -1) return [current.slice(eq + 1), index]
  const value = args[index + 1]
  if (value === undefined || value.startsWith("--")) fail(`${flag} requires a value`)
  return [value, index + 1]
}

const parseArgs = (argv) => {
  const [command = "help", ...args] = argv
  const opts = { config: defaultConfig(), dryRun: false }

  if (["help", "--help", "-h"].includes(command)) return { command: "help", opts }
  if (!["setup", "configure"].includes(command)) fail(`unknown command "${command}"\n\n${help}`)

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]

    if (arg === "--dry-run") opts.dryRun = true
    else if (arg === "--enable") opts.personality_enabled = true
    else if (arg === "--disable") opts.personality_enabled = false
    else if (arg === "--help" || arg === "-h") return { command: "help", opts }
    else if (arg === "--mode" || arg.startsWith("--mode=")) {
      const [value, next] = readValue(args, i, "--mode")
      i = next
      opts.personality_mode = value
    } else if (arg === "--model" || arg.startsWith("--model=")) {
      const [value, next] = readValue(args, i, "--model")
      i = next
      opts.personality_model = value
    } else if (arg === "--config" || arg.startsWith("--config=")) {
      const [value, next] = readValue(args, i, "--config")
      i = next
      opts.config = resolve(value)
    } else fail(`unknown flag "${arg}"`)
  }

  return { command, opts }
}

const validate = (opts) => {
  if (opts.personality_mode && !["auto", "off"].includes(opts.personality_mode)) {
    fail(`invalid --mode "${opts.personality_mode}"; expected auto or off`)
  }

  if (opts.personality_model && !/^[^/\s]+\/[^/\s]+$/.test(opts.personality_model)) {
    fail(`invalid --model "${opts.personality_model}"; expected provider/model`)
  }
}

const readConfig = async (path) => {
  try {
    return JSON.parse(await readFile(path, "utf8"))
  } catch (error) {
    if (error?.code === "ENOENT") return {}
    if (error instanceof SyntaxError) fail(`invalid JSON in ${path}: ${error.message}`)
    throw error
  }
}

const pluginId = (entry) => {
  const value = Array.isArray(entry) ? entry[0] : entry
  if (typeof value !== "string") return ""
  const base = value.startsWith(`${name}@`) ? name : value
  return base === name ? value : ""
}

const applyOptions = (options, updates) => ({
  ...options,
  ...(updates.personality_enabled === undefined ? {} : { personality_enabled: updates.personality_enabled }),
  ...(updates.personality_mode === undefined ? {} : { personality_mode: updates.personality_mode }),
  ...(updates.personality_model === undefined ? {} : { personality_model: updates.personality_model }),
})

const updateConfig = (config, updates) => {
  const key = Array.isArray(config.plugin) ? "plugin" : Array.isArray(config.plugins) ? "plugins" : "plugin"
  const plugins = Array.isArray(config[key]) ? [...config[key]] : []
  const index = plugins.findIndex((entry) => pluginId(entry))

  if (index === -1) {
    plugins.push([name, applyOptions({}, updates)])
  } else {
    const entry = plugins[index]
    const id = pluginId(entry)
    if (Array.isArray(entry)) {
      const [, options, ...rest] = entry
      const nextOptions = options && typeof options === "object" && !Array.isArray(options) ? options : {}
      plugins[index] = [id, applyOptions(nextOptions, updates), ...rest]
    } else {
      plugins[index] = [id, applyOptions({}, updates)]
    }
  }

  return { ...config, [key]: plugins }
}

const main = async () => {
  const { command, opts } = parseArgs(process.argv.slice(2))
  if (command === "help") {
    console.log(help)
    return
  }

  const updates = { ...opts }
  delete updates.config
  delete updates.dryRun
  if (Object.keys(updates).length === 0) {
    updates.personality_enabled = true
    updates.personality_mode = "auto"
  }

  validate(updates)

  const config = await readConfig(opts.config)
  const next = updateConfig(config, updates)
  const json = `${JSON.stringify(next, null, 2)}\n`

  if (opts.dryRun) {
    process.stdout.write(json)
    return
  }

  await mkdir(dirname(opts.config), { recursive: true })
  await writeFile(opts.config, json)
  console.log(`Updated ${opts.config}`)
}

main().catch((error) => fail(error?.message || String(error)))
