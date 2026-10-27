# Event contracts

Every event that crosses a service or project boundary is listed here. The JSON Schema files in `contracts/events/<type>/v<N>.schema.json` are the source of truth once Phase 5 creates them; this file is the human index and must be updated in the same commit as any schema change.

Format (JSON Schema 2020-12 inside CloudEvents 1.0) is **confirmed in Phase 1 (2026-10-27, under Nour's delegation; see `docs/specs/2026-10-27-phase-01-budokai-spec.md`)** (ADR-016). Field names and the non-Darb event types are proposed too.

## 1. Envelope (all events)

CloudEvents 1.0, structured JSON mode (`Content-Type: application/cloudevents+json`). Batch ingest uses `application/cloudevents-batch+json`.

```json
{
  "specversion": "1.0",
  "id": "0192f1d2-7a3c-7cde-9b1a-3f0e5c2a9d10",
  "source": "urn:budokai:producer:darb-juryoku",
  "type": "posture.session.recorded",
  "dataschema": "https://github.com/b14ckPanther/darb-budokai/contracts/events/posture.session.recorded/v1.schema.json",
  "subject": "user:7b1e...",
  "time": "2026-11-03T08:41:00+02:00",
  "datacontenttype": "application/json",
  "budokaiuserid": "7b1e5c0a-...",
  "budokaievidence": { "tier": "verified", "ref": "darb-juryoku:session:8812" },
  "budokaimode": "live",
  "correlationid": "day:7b1e...:2026-11-03",
  "data": { }
}
```

| Field | Required | Rule |
|---|---|---|
| `id` | yes | UUIDv7 from the producer. Idempotency key. |
| `source` | yes | `urn:budokai:producer:<project>` or `urn:budokai:service:<service>`. Must match the producer key's scope. |
| `type` | yes | `<domain>.<thing>.<pasttense-verb>` or the established Darb names. |
| `dataschema` | yes | URI of the schema file; the major version is the `vN` in the path. |
| `time` | yes | RFC 3339 with offset, when it happened in real life. |
| `budokaiuserid` | yes | Darb Budokai user id (producer maps its own account to it via the producer key). |
| `budokaievidence` | yes | `{tier: verified|attested|self_reported|simulated, ref: string, url?: string}` |
| `budokaimode` | yes | `live`, `simulation` or `demo`. Non-live events only affect matching users. |
| `causationid` | effects only | `id` of the event that caused this one. |
| `correlationid` | no | Groups a chain (default: user-day). |
| `rulebookversion` | effects only | Semver of the rulebook that produced the effect. |

Kafka record key = `budokaiuserid`. Kafka headers mirror `ce_id`, `ce_type`, `ce_source` for cheap filtering.

## 2. Ingest API

```
POST /ingest/v1/events            single CloudEvent
POST /ingest/v1/events:batch      up to N events (N in config, 100 proposed)
Headers: X-Budokai-Producer: <keyId>
         X-Budokai-Signature: t=<unix>,v1=<hex hmac-sha256(secret, t + "." + rawBody)>
202 Accepted   {"accepted": ["<id>"], "duplicates": [], "rejected": []}
400 schema error (details per event) · 401 bad signature · 403 type outside key scope · 409 never (duplicates are 202)
```

## 3. Events from sibling projects (external)

### 3.1 Darb Scouter (exists today)

Darb Scouter (Python/FastAPI, repo `b14ckPanther/darb-scouter`, local `~/Documents/GitHub/darb-scouter`) writes rows to an `events` table in its Postgres:

```
events(id SERIAL PK, type TEXT, payload JSONB, at TIMESTAMP DEFAULT now())
```

Observed payloads in `backend/src/scouter/repo.py` (October 2026; **re-check in Phase 9**):
- `job.applied` → `{"jobId": "<id>", "at": "<iso>"}`
- `stage.changed` → `{"applicationId": "app-<jobId>", "from": "<stage>", "to": "<stage>"}` (time is the row's `at`)
- `milestone.earned` → described in Darb's spec §9, not yet emitted in code.

Stages: `saved, applied, hr_call, tech_interview, home_task, final_interview, offer, rejected, withdrawn`.

**Connector:** ingest-service's `DarbPoller` (RabbitMQ `ingest.poll-darb`) reads new rows with a read-only Postgres role, cursor = last `events.id` stored in `ingest_db.producer_cursors`, maps each row to a Darb Budokai CloudEvent (below), evidence tier `verified`, `id` = UUIDv5(namespace "darb-scouter", row id) so re-polling is idempotent. Later Darb may push to the HTTP ingest instead; the Darb Budokai-side contracts stay the same.

#### `job.applied` v1 (Darb Budokai form)
```json
{ "applicationId": "app-123", "jobId": "123",
  "company": "string?", "roleTitle": "string?", "listingUrl": "uri?",
  "appliedAt": "date-time" }
```
Required: `applicationId`, `jobId`, `appliedAt`. Company, title and URL are optional because Darb's event payload does not carry them today; the connector may enrich them from Darb's `applications`/`jobs` tables in Phase 9 if Nour agrees. Natural key: `applicationId`.

#### `stage.changed` v1
```json
{ "applicationId": "app-123", "fromStage": "applied", "toStage": "tech_interview",
  "changedAt": "date-time" }
```
`fromStage`/`toStage` enum: the nine Darb stages. Natural key: `applicationId + toStage + changedAt`. Game mapping in `GAME_DESIGN.md` §3.

#### `milestone.earned` v1
```json
{ "milestoneKey": "string", "applicationId": "string?", "earnedAt": "date-time",
  "meta": { "additionalProperties": true } }
```
Natural key: `milestoneKey + applicationId`. Milestone keys are defined by Darb; Darb Budokai maps known keys in `config/rulebook/v1/quests.yaml` and ignores unknown ones (logged, no reward).

### 3.2 Darb Juryoku (later)

#### `posture.session.recorded` v1
```json
{ "sessionId": "string", "startedAt": "date-time", "endedAt": "date-time",
  "goodMinutes": 0, "badMinutes": 0, "longestBadStreakMinutes": 0,
  "sampleCount": 0, "device": "string?" }
```
Natural key: `sessionId`. Producer scope: `posture.*`. Effect: stamina and Vigor.

### 3.3 Darb Sennin (later)

#### `review.completed` v1
```json
{ "reviewId": "string", "repo": "owner/name", "pullRequest": 0, "commitSha": "string",
  "findings": [ { "id": "string", "severity": "critical|major|minor|nit",
                  "tags": ["concurrency"], "resolved": true } ],
  "completedAt": "date-time", "url": "uri?" }
```
Opens a boss (HP from findings) or updates it if `reviewId` was seen.

#### `finding.resolved` v1
```json
{ "reviewId": "string", "findingId": "string", "resolvedAt": "date-time", "commitSha": "string?" }
```
Deals boss damage. Natural key: `reviewId + findingId`.

### 3.3b Cosmetic events from other Darb apps (ADR-034)

Every Darb app other than the core producers (Darb Scouter, Darb Juryoku, Darb Sennin) integrates through **optional cosmetic events**. Rules for these contracts:

- Their rulebook mapping may only produce map-visual effects (marker, banner, light). XP, stamina, quest, loot, boss and raid effects are rejected for them by `RealRulebookValidTest` (Phase 4).
- Producer keys are scoped to the app's own types, as for every producer.
- No content payloads (file names, messages, amounts); identifiers and timestamps only.
- No money or financial data in any contract (ADR-035).
- `kinton.portal.opened` v1 below is the template.

### 3.4 Darb Kinton (later)

#### `kinton.portal.opened` v1
```json
{ "transferId": "string", "fromDevice": "string", "toDevice": "string",
  "kind": "file|text|link", "openedAt": "date-time" }
```
Cosmetic only (portal marker). No payload content is ever sent to Darb Budokai.

### 3.5 Darb Kaio (later)

#### `plan.week.published` v1
```json
{ "planId": "string", "weekStart": "date",
  "proposals": [ { "proposalId": "string", "title": "string", "objective": "count|duration|event|checkin",
                   "target": 0, "eventType": "string?", "day": "date?" } ] }
```
Creates **proposed** quests that Nour accepts or rejects. No XP for the plan itself.

### 3.6 Darb Capsule (later)

Capsule uses the public GraphQL API for normal actions. It sends events only for offline batches:

#### `habit.checked` v1 (also produced by budokai-web through quest-service)
```json
{ "habitId": "uuid", "checkedAt": "date-time", "note": "string?", "evidenceUrl": "uri?" }
```
Evidence tier `self_reported` unless `evidenceUrl` is present (`attested`).

### 3.7 Darb Genki

No domain events. Consumes OpenTelemetry traces, metrics and logs (ARCHITECTURE.md §11).

### 3.8 Darb Enmacho

Consumer only (reads `budokai.*` topics with its own consumer group). Produces nothing into Darb Budokai for now.

## 4. Events produced inside Darb Budokai

### 4.1 Life events from Darb Budokai itself (go through ingest's internal endpoint)

| Type | Producer | Payload sketch |
|---|---|---|
| `study.session.completed` v1 | spellbook-service | `{sessionId, deckId, startedAt, endedAt, reviewed, correct}` |
| `card.reviewed` v1 | spellbook-service | `{cardId, deckId, grade (0-5), reviewedAt, previousIntervalDays}` |
| `habit.checked` v1 | quest-service (from GraphQL mutation) | see 3.6 |
| `raid.reported` v1 | quest-service (manual "raid done" with evidence) | `{applicationId, stage, reportedAt, evidenceUrl}` |

### 4.2 Effect events (Kafka effect topics)

All carry `causationid` and `rulebookversion`.

| Topic | Type | Payload sketch |
|---|---|---|
| `budokai.character.effects.v1` | `character.xp.awarded` | `{stat?, amount, totalXp, reasonRuleId}` |
| | `character.level.reached` | `{level, previousLevel}` |
| | `character.stamina.changed` | `{delta, value, max, status: normal|exhausted}` |
| | `character.skill.unlocked` | `{nodeId}` |
| `budokai.quest.effects.v1` | `quest.created` | `{questId, kind: daily|main|raid|dungeon|boss|final_boss, title, objective}` |
| | `quest.progressed` | `{questId, progress, target}` |
| | `quest.completed` | `{questId, kind, tier}` |
| | `quest.failed` | `{questId, kind, reason: missed_day|rejected|abandoned}` |
| | `boss.engaged` | `{bossId, reviewId, hp, maxHp, tier}` |
| | `boss.damaged` | `{bossId, damage, hp, spellBonus}` |
| | `boss.defeated` | `{bossId, tier}` |
| | `raid.started` / `raid.cleared` | `{raidId, applicationId, stage}` |
| | `region.fog.changed` | `{regionId, fog: 0..1}` |
| `budokai.inventory.effects.v1` | `loot.dropped` | `{rollId, tableId, itemId, rarity}` |
| | `item.equipped` | `{itemId, slot}` |
| `budokai.spellbook.effects.v1` | `spell.learned` | `{cardId, deckId, school}` |
| | `spell.mastered` | `{cardId, intervalDays}` |
| | `spell.faded` | `{cardId, overdueDays}` |
| `budokai.battlelog.effects.v1` | `battlelog.compiled` | `{date, battleLogId, encounterCount}` |

## 5. Versioning checklist (for any schema change)

1. Additive optional field? Edit `v1.schema.json`, add an example, run `./mvnw -pl libs/budokai-contracts verify`.
2. Anything else? Create `v2.schema.json`, keep `v1`, add consumers for `v2` while still handling `v1`, add an ADR, update this file.
3. Update the simulator scenarios that emit this type.
4. Never edit a published schema's required fields in place.
