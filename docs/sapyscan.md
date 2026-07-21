---
title: sapyscan
slug: sapyscan
tagline: Python SAST that walks the AST, tracks taint, and hands you a dashboard instead of a wall of text.
repo: https://github.com/AYAN-AMBESH/sapyscan
language: Python
status: active
order: 2
updated: 2026-07-21
tags:
  - sast
  - python
  - taint-analysis
  - static-analysis
---

## What it is

`sapyscan` parses Python source into an abstract syntax tree and looks for security
vulnerabilities in the structure of the code rather than in its text. It ships with an
HTML report dashboard that puts the finding, the offending snippet, and the remediation
advice in the same place.

It is the Python counterpart to [javscan](/docs/javscan).

## Features

**AST-based vulnerability scanning.** User-controlled values are tracked through local
assignments, imports of scanned modules, relative imports, and instance or parameter
method calls before anything is reported as an injection sink.

**Sanitizer and escaper detection.** Taint propagation stops at the standard escaping and
coercion functions — `html.escape()`, `shlex.quote()`, `int()`, `float()` — which is where
most of the false-positive reduction comes from.

**Performance scaling.** AST traversal is optimised with cached parent-node mapping and
call graphs, and multiprocessing is available for large codebases.

**Configuration file support.** A `.sapyscan.json` is resolved automatically for
directory exclusions, rule overrides, and defaults.

**Test file exclusion.** Any file with `test` in its name is skipped by default, since
deliberately unsafe fixtures are the single largest source of noise in a Python scan.

**Interactive report dashboard.** A responsive HTML report with statistics, code
snippets, location mapping, and remediation steps.

## Rule coverage

- Hardcoded secrets and credentials
- Weak cryptographic hashes and ciphers
- Command injection, SQL injection, and XSS risk patterns
- Insecure deserialization and SSL/TLS misconfiguration
- SSRF risk, path traversal risk, weak random usage, and dangerous `eval` usage
- Insecure JWT verification, ReDoS risk, and XXE vulnerability patterns

## Install

```bash
# install the package in development mode
pip install -e .

# with development dependencies (pytest, ruff, etc.)
pip install -e ".[dev]"
# or
pip install -r requirements-dev.txt
```

Verify the scanner works:

```bash
pytest
```

## Usage

Scan a single file and write an HTML report:

```bash
sapyscan tests/vulnerable_app.py --html report.html
```

Scan a directory recursively, in two formats at once:

```bash
sapyscan tests --html report.html --json report.json
```

Use multiprocessing on a large codebase:

```bash
sapyscan my_big_project --html report.html --parallel
```

Exclude directories:

```bash
sapyscan my_big_project --exclude tests --exclude migrations --html report.html
```

Filter by minimum severity:

```bash
sapyscan my_big_project --min-severity HIGH --html report.html
```

Produce SARIF for CI/CD and pull-request integrations:

```bash
sapyscan my_big_project --sarif report.sarif
```

Rewrite detected SQL injections in place:

```bash
sapyscan my_big_project --autofix
```

> `--autofix` edits your files. Run it on a clean working tree and read the diff before
> committing.

## Configuration

sapyscan searches up the directory tree — as far as five levels — for a
`.sapyscan.json`, so the configuration can be committed to the repository and shared
across the team:

```json
{
  "disabled_rules": ["OWASP_A03_2021_EVAL"],
  "exclude_dirs": ["ignored_subdir", "venv", ".git"],
  "min_severity": "MEDIUM",
  "parallel": true
}
```

Command-line arguments (`--exclude`, `--min-severity`, `--parallel`, …) override whatever
the config file says.

## Inline suppression

Individual findings can be silenced on the line they occur:

| Comment | Effect |
|---------|--------|
| `# nosec` | Universal suppression, matching Bandit's syntax |
| `# sapyscan: ignore` | Universal suppression |
| `# sapyscan: ignore <rule_id>` | Suppress one specific rule |

```python
eval(user_input) # nosec
query = f"SELECT * FROM users WHERE id = '{user_id}'" # sapyscan: ignore OWASP_A03_2021_SQLI
```

## Project structure

```text
sapyscan/
  cli.py          CLI entry point and argument parsing
  config.py       configuration resolution and loading
  scanner.py      file traversal and AST parsing engine
  reporter.py     HTML report rendering
  rules/          security rule implementations
tests/            unit tests and the vulnerable sample application
pyproject.toml    project metadata and console script configuration
```

Each rule is its own module under `rules/` — `hardcoded_secrets.py`, `weak_hash.py`,
`weak_cipher.py`, `command_injection.py`, `sql_injection.py`, `xss_risk.py`,
`dangerous_eval.py`, `insecure_deserialization.py`, `insecure_ssl.py`, `ssrf.py`,
`path_traversal.py`, `weak_random.py`, `assert_check.py`, `flask_debug.py`,
`jwt_security.py`, `redos_risk.py`, and `xxe_risk.py` — which makes adding a new check a
matter of adding one file rather than editing a monolith.

## Source

[github.com/AYAN-AMBESH/sapyscan](https://github.com/AYAN-AMBESH/sapyscan)
