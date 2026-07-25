# Prototype: can DialKit work inside the playground?

**Question:** Can [dialkit](https://github.com/joshpuckett/dialkit) (Josh Puckett's
real-time parameter-tweaking library) be worked into the existing playground?

**Answer: yes.** DialKit v1.4.3 + `motion` v12 install and run under Next 16
(Turbopack) + React 19 with no console errors and a clean typecheck.

## What was built

A new **Motion → Interactive (DialKit)** playground section:

- `sections/motion-demo.tsx` — a live specimen card whose radius / padding /
  accent / elevation / lift-spring are all driven by `useDialKit`, animated with
  `motion/react`. `persist: true` + a stable `id` so tweaks survive reloads.
- `sections/motion.tsx` — loads the demo via `next/dynamic({ ssr: false })`.
  DialKit resolves values from a browser store, so client-only rendering avoids
  an SSR hydration mismatch.
- `playground-shell.tsx` — mounts `<DialRoot theme="system" defaultOpen={false}/>`
  (client-only via `next/dynamic`) and imports `dialkit/styles.css`.

## Key findings / decisions

- **React 19 / Next 16 compatible.** Peer dep is `react >=18`; works fine.
- **Theme sync is free** — `theme="system"` makes the dial panel follow our
  light/dark toggle.
- **SSR:** render DialKit (`DialRoot` + any `useDialKit` component) client-only.
- **TS:** the resolved `spring` value is typed as DialKit's broad
  `TransitionConfig`; cast to motion's `Transition` (runtime shape is
  motion-compatible — that's DialKit's whole point).
- **`defaultOpen` defaults to true**, and DialKit persists its open/position
  state per-browser. Set `defaultOpen={false}` so first-time users get a corner
  launcher instead of a panel that overlaps our right-side `TweakPanel`.
- **Two right-side panels.** DialKit's panel and our `TweakPanel` both anchor
  right; if both are opened at once they overlap. Left as a launcher to avoid it.

## Division of labor (the real reason to keep both)

- **TweakPanel** stays the owner of **persistent design-token overrides** — it
  writes CSS vars to `<html>` + a "Note/Sync to Claude" round-trip. DialKit
  isn't built for that.
- **DialKit** is great for **transient, per-component prop exploration** with
  springs/easing visualizers — motion design, not tokens.

## If we productionize

- `DialRoot` only renders when `productionEnabled` or in dev — fine for a
  dev-only playground. Set `productionEnabled` if the playground ships to prod.
- Consider auto-closing the `TweakPanel` when DialKit opens (and vice-versa) so
  the two never overlap, or move one to the opposite edge.
- `motion` (~large) is now a dependency purely for this demo; keep it if we lean
  into DialKit for motion specs, otherwise drop both when folding the decision.
