import { NextResponse } from "next/server"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

// Writes to the filesystem — Node runtime, dev-only design tooling.
export const runtime = "nodejs"

type SyncPayload = {
  tokens?: Record<string, string>
  components?: Record<string, Record<string, string>>
  note?: string
}

export async function POST(request: Request) {
  let body: SyncPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const tokens = body.tokens ?? {}
  const components = body.components ?? {}
  const note = (body.note ?? "").trim()

  const count =
    Object.keys(tokens).length +
    Object.values(components).reduce((sum, k) => sum + Object.keys(k).length, 0)

  if (count === 0 && !note) {
    return NextResponse.json(
      { ok: false, error: "Nothing to sync" },
      { status: 400 }
    )
  }

  const generatedAt = new Date().toISOString()
  const payload = { generatedAt, note, tokens, components }

  const dir = path.join(process.cwd(), ".playground")
  try {
    await mkdir(dir, { recursive: true })
    await writeFile(
      path.join(dir, "tokens.json"),
      JSON.stringify(payload, null, 2) + "\n",
      "utf8"
    )
    await writeFile(path.join(dir, "HANDOFF.md"), renderHandoff(payload), "utf8")
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Write failed" },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, count, dir: ".playground" })
}

function renderHandoff({
  generatedAt,
  note,
  tokens,
  components,
}: {
  generatedAt: string
  note: string
  tokens: Record<string, string>
  components: Record<string, Record<string, string>>
}) {
  const lines: string[] = []
  lines.push("# Playground tweaks → apply to the design system")
  lines.push("")
  lines.push(`_Staged ${generatedAt} from the /playground tweak panel._`)
  lines.push("")
  lines.push(
    "When the user asks to **apply my tweaks**, edit the source so these become the committed defaults, then delete this file and `tokens.json`."
  )
  lines.push("")

  if (note) {
    lines.push("## Note from the user")
    lines.push("")
    lines.push("> " + note.split("\n").join("\n> "))
    lines.push("")
  }

  const tokenEntries = Object.entries(tokens)
  lines.push(`## Token overrides (${tokenEntries.length})`)
  lines.push("")
  if (tokenEntries.length === 0) {
    lines.push("_None._")
  } else {
    lines.push("| CSS var | New value |")
    lines.push("| --- | --- |")
    for (const [name, value] of tokenEntries) {
      lines.push(`| \`${name}\` | \`${value}\` |`)
    }
    lines.push("")
    lines.push(
      "Apply in `app/globals.css`: `--radius` in the `:root` base; every other role in **both** `:root` (light) and `.dark` (dark) as appropriate. Keep referencing primitives (`var(--color-*)`) — don't inline raw colors."
    )
  }
  lines.push("")

  const componentEntries = Object.entries(components)
  lines.push(`## Component overrides (${componentEntries.length})`)
  lines.push("")
  if (componentEntries.length === 0) {
    lines.push("_None._")
  } else {
    for (const [component, knobs] of componentEntries) {
      lines.push(`### \`${component}\``)
      lines.push("")
      lines.push("| Knob | Value |")
      lines.push("| --- | --- |")
      for (const [key, value] of Object.entries(knobs)) {
        lines.push(`| \`${key}\` | \`${value}\` |`)
      }
      lines.push("")
    }
  }

  return lines.join("\n") + "\n"
}
