---
title: javscan
slug: javscan
tagline: Java static application security testing with real AST taint analysis, written in Rust.
repo: https://github.com/AYAN-AMBESH/javscan
language: Rust
license: MIT
status: active
order: 1
updated: 2026-07-21
tags:
  - sast
  - java
  - rust
  - taint-analysis
---

## What it is

`javscan` is a static application security testing (SAST) scanner for Java. It parses
source with a real grammar — tree-sitter, not regular expressions — and runs an
intraprocedural **taint analysis** that traces attacker-controlled data from a source
to a dangerous sink.

That distinction is the whole point of the tool. A regex scanner sees
`stmt.executeQuery(query)` and screams. javscan asks a harder question: *where did
`query` come from, and did anything neutralise it on the way?* If it was built from a
`PreparedStatement` with bind parameters, or passed through `Encode.forHtml()`, there is
no finding to report.

It is the sister project of [sapyscan](/docs/sapyscan), which does the same job for Python.

## Highlights

- **28 security rules**, each mapped to a CWE and to OWASP Top 10 (2021)
- **AST-based taint tracking** instead of pattern grepping
- **Fast** — parallel scanning via rayon; roughly 60k lines of Java in about a second
- **4 output formats** — coloured console, JSON, SARIF 2.1.0, and a self-contained interactive HTML dashboard
- **Baseline diffing** — snapshot what already exists, then fail CI only on *new* findings
- **Inline suppression**, a project config file, severity and confidence levels, configurable exit codes
- Automatically skips test sources (`src/test`, `*Test.java`) and build or generated directories

## Install

```sh
cargo install --path .
```

Or build it directly — the binary lands at `target/release/javscan`:

```sh
cargo build --release
```

## Usage

Scan a project and print to the console:

```sh
javscan src/
```

Generate the interactive HTML dashboard:

```sh
javscan . --format html --output report.html
```

Emit SARIF 2.1.0 for GitHub Code Scanning:

```sh
javscan . --format sarif --output results.sarif
```

Machine-readable JSON, for piping into anything else:

```sh
javscan . --format json --output results.json
```

Show only high and critical findings, and fail the build only on critical:

```sh
javscan . --min-severity high --fail-on critical
```

Disable rules, exclude paths, and include test sources:

```sh
javscan . --disable JS207 --disable log-injection --exclude "**/generated/**" --include-tests
```

## How the taint analysis works

The analysis runs per method, to a fixpoint, in four conceptual stages.

**1. Sources seed taint.** Parameters annotated `@RequestParam`, `@PathVariable`,
`@RequestBody`, `@RequestHeader`, or `@CookieValue`; parameters of `@GetMapping`-style
handlers and servlet `doGet` / `doPost` methods; `HttpServletRequest` accessors such as
`getParameter`, `getHeader`, and `getQueryString`; `main(String[] args)`; and reads from
`Scanner` or `BufferedReader`.

**2. Propagation spreads it.** Assignments, `+` concatenation,
`StringBuilder.append` / `insert`, the `String` transformation family
(`format`, `valueOf`, `substring`, `replace`, and friends), ternaries, casts, enhanced-for
loops over tainted collections, and — heuristically — calls that receive a tainted argument.

**3. Sanitizers kill it.** OWASP Java Encoder (`Encode.forHtml`, `Encode.forJavaScript`, …),
ESAPI encoders, commons-text (`escapeHtml4`, `escapeXml`, …), `URLEncoder.encode`,
`Integer.parseInt` and the other numeric parsers, `UUID.fromString`,
`FilenameUtils.getName`, and `Pattern.quote`.

**4. Sinks decide severity.** Sinks are rule-specific — SQL execution, `Runtime.exec`,
response writers, file constructors, and so on. A sink argument that is provably tainted
yields a high-confidence finding. Concatenation that is dynamic but unproven yields a
medium- or low-confidence finding at reduced severity, so the noise sorts itself to the
bottom of the report rather than into your face.

The analysis is intraprocedural with heuristic call propagation. That is the classic SAST
precision-versus-recall tradeoff, chosen deliberately in favour of scan speed.

## Rules

| ID | Rule | Severity | CWE |
|----|------|----------|-----|
| JS101 | sql-injection | CRITICAL | CWE-89 |
| JS102 | command-injection | CRITICAL | CWE-78 |
| JS103 | ldap-injection | HIGH | CWE-90 |
| JS104 | xpath-injection | HIGH | CWE-643 |
| JS105 | spel-injection | CRITICAL | CWE-917 |
| JS106 | script-engine-injection | CRITICAL | CWE-94 |
| JS107 | log-injection | LOW | CWE-117 |
| JS201 | cross-site-scripting | HIGH | CWE-79 |
| JS202 | open-redirect | MEDIUM | CWE-601 |
| JS203 | ssrf | HIGH | CWE-918 |
| JS204 | insecure-cookie | MEDIUM | CWE-614 |
| JS205 | csrf-disabled | HIGH | CWE-352 |
| JS206 | permissive-cors | MEDIUM | CWE-942 |
| JS207 | cleartext-http | LOW | CWE-319 |
| JS301 | weak-hash (MD5/SHA-1) | HIGH | CWE-328 |
| JS302 | weak-cipher (DES/RC4/ECB) | HIGH | CWE-327 |
| JS303 | weak-random | LOW–HIGH | CWE-330 |
| JS304 | hardcoded-crypto-material | HIGH | CWE-321 |
| JS305 | trust-all-tls | CRITICAL | CWE-295 |
| JS306 | weak-key-size | MEDIUM | CWE-326 |
| JS401 | hardcoded-secret | HIGH–CRITICAL | CWE-798 |
| JS402 | jwt-weak-signing | HIGH | CWE-347 |
| JS501 | insecure-deserialization | CRITICAL | CWE-502 |
| JS502 | xxe | HIGH | CWE-611 |
| JS601 | path-traversal | HIGH | CWE-22 |
| JS602 | zip-slip | HIGH | CWE-22 |
| JS701 | redos | MEDIUM | CWE-1333 |
| JS702 | unsafe-reflection | HIGH | CWE-470 |

Run `javscan --rules` for the full descriptions.

## Adopting it on an existing codebase

Nobody turns a scanner on a mature repository and fixes 400 findings that afternoon. The
baseline workflow exists so you do not have to:

```sh
javscan . --write-baseline .javscan-baseline.json   # accept current findings
javscan . --baseline .javscan-baseline.json          # from now on: only NEW findings
```

Fingerprints hash the rule, the file, and the normalised code line — deliberately *not*
the line number. Adding an import at the top of a file does not resurface every baselined
finding below it.

## Inline suppression

```java
Runtime.getRuntime().exec(cmd); // nosec
stmt.executeQuery(sql);         // javscan:ignore JS101
// javscan:ignore JS102,JS601   (a comment on the line above also applies)
```

## Configuration

Drop a `.javscan.json` at the project root:

```json
{
  "exclude": ["**/generated/**", "**/legacy/**"],
  "disabled_rules": ["JS207"],
  "min_severity": "low",
  "include_tests": false,
  "fail_on": "high"
}
```

CLI flags override the config file.

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | No findings at or above the `--fail-on` threshold (default `high`). Use `--fail-on never` to always exit 0. |
| `1` | Findings at or above the threshold. |
| `2` | Execution error — bad baseline, unwritable output, and so on. |

## Example output

```text
examples/vulnerable/UserController.java
  32:13  CRITICAL  JS101 [sql-injection] (high confidence, CWE-89)
      User-controlled data reaches SQL sink `executeQuery()`; the query is attacker-influenced.
      > stmt.executeQuery(query);
```

The `examples/` directory holds intentionally vulnerable and deliberately clean files that
serve as the acceptance corpus. The clean file must produce zero findings — that is the
regression test for false positives.

## License

MIT. Source at [github.com/AYAN-AMBESH/javscan](https://github.com/AYAN-AMBESH/javscan).
