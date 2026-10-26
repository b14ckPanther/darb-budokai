# Contributing

Darb Budokai is a personal project by Nour Alden Mousa. The working rules live in
[`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) (code, tests, commits, branches, PRs) and the
agent manual (`CLAUDE.md`, summarised in `AGENTS.md`).

## Set up once

```bash
git config core.hooksPath .githooks   # commit-msg guard
tools/dev/gen-keys.sh                 # local .env and JWT key pair (git-ignored)
```

## Before every commit

```bash
./mvnw -q verify
npm --prefix web/budokai-web run lint && npm --prefix web/budokai-web test
tools/dev/check-no-emoji.sh
```

## Before every push

```bash
tools/dev/check-commits.sh            # only Nour as author and committer, no attribution, no emoji
```

Test first, keep game rules and copy in `config/`, keep secrets in `.env`, and open a PR from a
`phase/NN-name` branch using the template.
