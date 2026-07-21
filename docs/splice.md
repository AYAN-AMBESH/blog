---
title: splice
slug: splice
tagline: An intercepting proxy where scope is enforced policy, the site map is a real graph, and the whole thing ships as one signed binary.
repo: https://github.com/AYAN-AMBESH/splice
language: Mutant
status: active
order: 3
updated: 2026-07-21
tags:
  - proxy
  - pentesting
  - opa
  - tooling
---

> For authorized security testing only. Splice is an interception tool — run it
> exclusively against systems you have written permission to test.

## What it is

Splice is a MITM HTTP/HTTPS intercepting proxy — the Burp / ZAP / mitmproxy slot — written
entirely in the Mutant language and running on the `dev-sec` secure-networking runtime.

What separates it from a general-purpose intercept proxy is that the things those tools
leave advisory, or bolt on afterwards, are native and load-bearing here.

## The three ideas

### 1. Scope is enforced policy, not a UI hint

Every request is evaluated against `policy/scope.rego` (OPA/Rego) *before* it can reach the
forwarding path. An out-of-scope host is literally unreachable through the proxy, and every
allow or deny is traceable via `policy_trace` — a compliance artifact that proves you stayed
inside the Rules of Engagement.

In Burp, scope is advisory, and one fat-fingered click puts you out of bounds. Here it is a
version-controlled file that gets reviewed and diffed like any other artifact.

### 2. The site map is a real graph

Endpoints, parameters, and findings become nodes and edges in an embedded graph database
(the `db_*` builtins). `db_shortest_path` answers the question you actually care about —
*what is the chain from an unauthenticated entry point to this sensitive sink?* — instead of
handing you a flat tree plus a separate issue list to correlate by hand.

### 3. Checks are sandboxed, hot-loadable Lua plugins

Everything under `plugins/` loads at runtime. Burp-extension power without the JVM, and the
signed core binary never changes when you add a check.

Match/replace, secret hunting, and session state come from the runtime's `regex_*` and
`cache_*` builtins.

## Why the Mutant substrate matters

The whole engagement proxy ships as **one signed, encrypted, cross-compiled binary** that
you drop on a client box. No Python, no Java, no Node, no dependency tree — tamper-evident
and provenance-stamped. The policy that governs it is a file in version control rather than
a sequence of clicks in a GUI.

## Layout

| Path | Purpose |
|------|---------|
| `splice.mut` | The tool: policy engine, graph site-map, secret hunt, plugin runner, match/replace, and the live proxy loop. |
| `splice.config.json` | Runtime config — mode, bind address, paths, timeouts. |
| `policy/scope.rego` | The enforced Rules of Engagement: in-scope hosts, allowed methods, denied paths. **Edit this per engagement.** |
| `matchreplace/rules.json` | Burp-style match/replace rules, regex over the outgoing request wire. |
| `plugins/*.lua` | Hot-loadable check plugins — secret leak, missing security headers, reflected input. |
| `ca/splice-ca.pem` | Persistent CA, generated on first proxy run. Import once into your browser or Burp. |
| `splice-audit.log` | On-disk decision trail, one ALLOW/DENY line per request — the proof-of-scope artifact. |
| `docs/USING_WITH_BROWSER_AND_BURP.md` | Step-by-step: run Splice, import the CA, chain Browser → Splice → Burp → target. |
| `docs/DESIGN.md` | Architecture, plugin contract, threat model, and Mutant-runtime notes. |

## Running

Splice runs on the Mutant `dev-sec` runtime. `splice.mut` reads its config path from the
`CONFIG_PATH` constant at the top of the file — set it to the absolute path of
`splice.config.json` — and the config's `root` field is the base for every other relative
path. Then compile and run:

```sh
# from the mutant runtime directory:
mutant.exe /path/to/splice.mut --password test          # compiles -> splice.mu
mutant.exe /path/to/splice.mu  --password test --compat
```

Run with `--compat` rather than `--dev`: the security machinery stays active and the
anti-sandbox check still runs, but on a virtualized or WSL box the `sandbox_detected` signal
is advisory instead of fatal. On a bare-metal deployment box, run with **no flags** for full
terminate-on-tamper enforcement.

Once Splice is up, trust the generated CA:

```pwsh
certutil -addstore -user Root "splice\ca\splice-ca.pem"
```

## Two modes

Set `mode` in `splice.config.json`.

### `"mode": "proxy"`

The shipped engagement default. Runs the live intercepting proxy on `cfg.bind`, which
defaults to `127.0.0.1:8080`. It prints a freshly generated CA certificate — trust that CA
in your client to intercept HTTPS — then enforces scope on every connection. Out-of-scope
requests get a `403` and never touch the upstream:

```text
out-of-scope CONNECT   => HTTP/1.1 403 Forbidden
out-of-scope plain GET => HTTP/1.1 403 Forbidden
```

### `"mode": "selftest"`

Drives the entire engine against synthetic flows — policy, match/replace, graph, secret
hunt, all three plugins, and an entry→sink attack-path query — with no sockets at all, and
asserts every outcome:

```text
=== Splice self-test (engine, no sockets) ===
[1] Policy enforcement (scope / RoE)        PASS x7
[2] Match / replace on outgoing request     PASS x3
[3] Graph site-map + finding correlation    PASS x3   (12 nodes, 12 edges)
[4] Attack-path query (entry -> sink)        PASS
=== Self-test complete: 14 passed, 0 failed ===
RESULT: OK
```

## Chaining with Burp, ZAP, or mitmproxy

Splice speaks the standard HTTP proxy protocol, so it chains. Set
`"upstream_proxy": "127.0.0.1:8080"` in the config to run **Browser → Splice → Burp →
target**: Splice enforces scope and records the site map and findings, then forwards to Burp
for interactive work. Out-of-scope hosts are denied at Splice and never reach Burp at all.

The full walkthrough — CA import, browser and Burp settings, both topologies — lives in
`docs/USING_WITH_BROWSER_AND_BURP.md`.

## Status

Both paths are verified end-to-end on the real runtime. The engine self-test passes 14/14,
and the live proxy has been shown to deny out-of-scope `CONNECT` and plain-HTTP requests
over real TCP without ever contacting the upstream. `docs/DESIGN.md` covers the full
architecture and the language constraints the implementation works within.

## Source

[github.com/AYAN-AMBESH/splice](https://github.com/AYAN-AMBESH/splice)
