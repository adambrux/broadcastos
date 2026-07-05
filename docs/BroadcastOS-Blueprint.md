# BroadcastOS Blueprint

## Product vision

BroadcastOS is a calm, intelligent production environment for Premier Gospel radio. It gives presenters and producers one place to prepare shows, manage reusable content, understand listeners, place station requirements, broadcast confidently and learn from every programme.

The product should feel like an experienced Executive Producer: clear about what matters now, sensitive to pastoral context and quiet enough to use under live-studio pressure.

## Architecture philosophy

BroadcastOS is organised around durable broadcast objects rather than loose notes.

- Shows define schedule, tone, mission and recurring structure.
- Content Library stores the reusable scripts and source material used by shows.
- Producer Desk assembles those objects into a dated running order.
- On Air reduces the running order to the next useful presenter action.
- Audience preserves listener relationships, consent and pastoral context.
- Station HQ translates station-wide briefings into assignable broadcast requirements.
- Aircheck records what happened and turns it into practical improvements.
- Today brings the highest-priority signals from every module into one daily command centre.

Content provenance is always visible. Current labels are `Manual for now`, `Imported from briefing`, `Imported from Notion`, `AI generated`, `Listener submitted`, `Station supplied`, `Future AI`, `RSS/API needed` and `Connected`.

AI must enhance an explicit content object and workflow. It must not silently invent a source, claim a connection exists or replace editorial judgement.

## Module map

| Module | Route | Responsibility |
| --- | --- | --- |
| Today | `/today` | Daily Executive Producer briefing, priorities and readiness |
| Shows | `/shows` | Show profiles, DNA, structures and recurring features |
| Producer Desk | `/producer` | Build and prepare a dated show |
| Content Library | `/content` | Master scripts, episodes, imported content and provenance |
| Newsroom | `/newsroom` | Source library, story scoring, radio prep and show assignment |
| Broadcast Brain | `/brain` | Recurring feature DNA, prompts, history, analytics and relationships |
| Intelligence | `/assistant` | Future assisted research and production workflows |
| On Air | `/broadcast` | Distraction-free presenter view |
| Audience | `/listeners` | Listener relationships, interactions and Congregation records |
| Station HQ | `/station` | Weekly briefs, liners, campaigns, standards and assignments |
| Aircheck | `/review` | Post-show review and improvement |
| Settings | `/settings` | Workspace and product configuration |

Legacy route `/dashboard` redirects to `/today`. Existing production routes remain available.

## Current build status

### Built

- Premium responsive application shell and Premier brand styling
- Today command centre using mock BroadcastOS data
- Three detailed Premier Gospel show profiles
- Sundays with Adam Producer Desk
- Sundays with Adam On Air mode
- Audience / Listener Hub and Sunday Show Congregation workflows
- Station HQ weekly brief extraction and assignment interface
- Content Library overview
- Master Roll Call Library
- Sunday School archive and manual paste workflow
- Import Centre with editable import cards
- Newsroom source library, story inbox, preparation and assignment workflows
- Broadcast Brain Feature Library and reusable feature DNA workflows
- Source labels and shared content structures

### Manual for now

- Show readiness calculations
- Story selection and editorial scoring
- Countdown and schedule status
- Document and screenshot extraction
- Listener interaction import
- Roll Call persistence
- Sunday School episode persistence
- Weekly briefing ingestion

### Not connected

- AI generation
- Live RSS or news APIs
- Notion database sync
- Zetta integration
- WhatsApp, SMS or telephony
- Authentication and database persistence
- Live playout, audio storage or compliance logging

## Future modules

1. Persistent data layer with role-based access and audit history
2. Real import pipeline for Word, PDF, email and Zetta screenshots
3. News discovery using approved RSS/API sources
4. Assisted editorial scoring, Christian perspective prompts and source verification
5. Notion Sunday School import with explicit sync status
6. Broadcast Brain reusable feature definitions and version history
7. Live producer-to-presenter updates
8. Audio asset storage, waveform review and playout references
9. Aircheck transcript, timing analysis and improvement summaries
10. Cross-show analytics for listener interaction and recurring feature performance

## Decision log

### 2026-07-05 — Today replaces Dashboard

`/today` becomes the primary landing page and daily Executive Producer desk. `/dashboard` remains as a redirect so existing links do not break.

### 2026-07-05 — Broadcast Brain resumes after content architecture

Reusable feature intelligence is organised as versioned templates after the Content Library established content objects and provenance. Future AI actions remain disconnected.

### 2026-07-05 — Content Library is the source layer

Roll Calls, Sunday School episodes, station brief extracts and reusable scripts live in a shared content structure. Producer Desk and Station HQ reference this layer instead of duplicating feature content.

### 2026-07-05 — Connections must be honest

The interface explicitly distinguishes manual workflows, future AI, required RSS/API connections and genuinely connected services. Placeholders must never imply that a sync or automated process is operational.

### 2026-07-05 — Mock data remains the implementation boundary

The current product demonstrates workflows and interaction design without a database, live AI, third-party API or station-system integration.
