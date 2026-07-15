# BroadcastOS Blueprint

## Product vision

BroadcastOS is a calm, intelligent production environment for Premier Gospel radio. It gives presenters and producers one place to prepare shows, manage reusable content, understand listeners, place station requirements, broadcast confidently and learn from every programme.

The product should feel like an experienced Executive Producer: clear about what matters now, sensitive to pastoral context and quiet enough to use under live-studio pressure.

## Architecture philosophy

BroadcastOS is organised around durable broadcast objects rather than loose notes.

- The usable studio shell stays deliberately small: Today, Producer Desk, Newsroom and On Air.
- Working mode is location-aware: In-studio companion keeps only planning, links and On Air; Remote production adds manually pasted listener messages.
- Producer Desk is local-first: a dated running order can start blank or from a show template and is saved in the browser.
- Every substantive link follows the Context First rule: Show ID, Feature ID, context, recap, progress, one CTA and tease ahead.
- On Air reads the exact same local workspace rather than presenting separate mock content.
- Listener messages enter the workspace through explicit manual paste.
- Zetta remains the authority for live songs, timing and playout until a real integration exists.
- Shows define schedule, tone, mission and recurring structure.
- Schedule maps the manually curated Premier Gospel week into a shared UK-time on-air state.
- Content Library stores the reusable scripts and source material used by shows.
- Producer Desk assembles those objects into a dated running order.
- On Air reduces the running order to the next useful presenter action.
- Audience preserves listener relationships, consent and pastoral context.
- Station HQ translates station-wide briefings into assignable broadcast requirements.
- Aircheck records what happened and turns it into practical improvements.
- Today brings the highest-priority signals from every module into one daily command centre.

Content provenance is always visible. Current labels are `Manual for now`, `Imported from briefing`, `Imported from Notion`, `AI generated`, `Listener submitted`, `Station supplied`, `Future AI`, `RSS/API needed` and `Connected`.

AI must enhance an explicit content object and workflow. It must not silently invent a source, claim a connection exists or replace editorial judgement.

## Global Link Writing Standard

BroadcastOS writes every presenter link using the BroadcastOS Link Framework:

Context → Recap → The Moment → Call To Action → Tease Ahead

Every listener joins mid-story. Context first, always.

Each link must answer:

- Context: “Where am I?”
- Recap: “What are we doing?”
- The Moment: “Why is this worth listening to?”
- Call To Action: “What should I do?”
- Tease Ahead: “Why should I stay?”

Links are incomplete if any of the five sections are empty. BroadcastOS should warn when Context does not mention the show or feature, Recap is missing, Call To Action contains more than one competing listener action, or Tease Ahead is missing.

### Script Format v2 and the Response Gate

From 15 July 2026, BroadcastOS show plans use Script Format v2: a show header, three hours with exactly six links per hour, and a final Pre-Show Promo section.

The old `Fallback If Quiet` field is abolished. Listener-led links use the Response Gate instead:

- `The Moment · If Responses` contains the version where Adam reads real listener messages.
- `The Moment · If No Responses` contains a complete, equally good version for when no messages have arrived.
- Context, Recap, Call To Action and Tease Ahead are shared by both versions.
- On Air asks Adam one question first: “Do you have responses?” YES shows only the response version; NO shows only the no-response version.
- The unused version is never displayed during live reading.

Liner links are dedicated links, marked by titles such as `LINER LINK · P1` or by `[LINER STARTS HERE · …]` inside The Moment. BroadcastOS visually distinguishes these so Adam sees the gear-change before reading.

## Module map

| Module | Route | Responsibility |
| --- | --- | --- |
| Today | `/today` | Daily Executive Producer briefing, priorities and readiness |
| Executive Producer | `/executive-producer` | Cross-module daily briefing, risks and next actions |
| Shows | `/shows` | Show profiles, DNA, structures and recurring features |
| Schedule | `/schedule` | Premier Gospel week, UK-time Now On Air and Up Next |
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

- Simplified four-item studio navigation
- Local-first blank and template show builder
- Drag-reorderable running order with editable titles, types, scripts, objectives, CTAs and producer notes
- Context First readiness checks for every link
- BroadcastOS Link Framework data model, reusable component and validation
- Detailed Afternoons with Adam template: Afternoon Conversation, Adam’s Afternoon Arcade and Afternoon Uplift
- On Air display for Context, Recap, The Moment, Call To Action and Tease Ahead
- Manual WhatsApp/text message paste workflow
- Shared On Air mode with live item progression
- Persistent In-studio companion and Remote production modes
- Premium responsive application shell and Premier brand styling
- Today command centre using mock BroadcastOS data
- Executive Producer daily briefing across shows, station, audience, stories and content
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
- Premier Gospel weekly Schedule with shared Now On Air and Up Next banners
- Source labels and shared content structures

### Manual for now

- Show readiness calculations
- Story selection and editorial scoring
- Countdown status
- Premier Plus schedule refresh
- Document and screenshot extraction
- Listener interaction import
- Roll Call persistence
- Sunday School episode persistence
- Weekly briefing ingestion

### Not connected

- Zetta live playout, song title and remaining time
- WhatsApp message feed
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
11. Approved Premier Plus schedule sync or station schedule API

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

### 2026-07-06 — Schedule is a shared station object

The Premier Gospel week lives in one manual schedule structure. A UK-time resolver supplies Now On Air and Up Next across Today, Producer Desk, On Air and Station HQ, including programmes that cross midnight. The public Premier Plus pages are source references only; website sync/API is not connected.

### 2026-07-06 — Usability before platform breadth

The primary navigation is reduced to Today, Producer Desk, Newsroom and On Air. Producer Desk and On Air share a browser-saved local workspace that works without a database. Zetta and WhatsApp are treated as manual external studio systems: BroadcastOS never claims live playout or message-feed access it does not have.

### 2026-07-06 — Working location controls tool depth

In-studio companion mode assumes Zetta and WhatsApp remain on Premier’s studio systems, so BroadcastOS focuses on planning, links and On Air. Remote production mode keeps the fuller workflow and reveals manual WhatsApp paste tools. The selected mode persists with the local show workspace.

### 2026-07-08 — Every link starts with context

BroadcastOS now treats late joiners as the default listener. Before a link is ready, it must answer: “If somebody turned the radio on right now, would they understand what’s happening within 10 seconds?” The required link structure is Show ID, Feature ID, context, recap, progress, one CTA and tease ahead. Afternoons with Adam is structured around The Afternoon Conversation at 1PM, Adam’s Afternoon Arcade at 2PM and Afternoon Uplift at 3PM. Each hour must include at least two time checks, two station IDs and two presenter IDs.

### 2026-07-08 — BroadcastOS Link Framework becomes global

The Context First rule is now formalised as the BroadcastOS Link Framework across the whole app. Every future generated presenter link should use Context, Recap, The Moment, Call To Action and Tease Ahead by default across all shows, features and modes. Producer Desk, On Air, Content Library and Broadcast Brain all reference the shared framework.
