# BroadcastOS Changelog

Every push bumps the minor version. Adam decides when a major version lands.

## v2.15 · Made for live · 20 July 2026

- Find your place instantly: the words either side of every interaction marker in a script now glow green, so coming back from the WhatsApp screen your eyes land exactly where you left off.
- Scripts breathe: every sentence renders on its own line, and question or answer numbers are highlighted in violet so the payoff parade scans at a glance.
- New game scoreboard on the On Air page: add players as answers arrive (with name suggestions), tap each question box to mark right or wrong, and the ranking sorts itself live… winners declared without counting through the WhatsApp scroll.
- The end-of-show Zetta warning now flashes, and repeats right under the script on the final link until the studio reset is confirmed.

## v2.14 · Family memory · 20 July 2026

- On Air listener rows now have plus and minus buttons… tap to count another message or undo a slip, no retyping names ever.
- Each listener's row shows their most recent starred message right there while you're on air… an open prayer request takes priority, so you can refer to what they're carrying when you read their name.
- Pastoral care now keeps its history: a "Cared for" section in Insights lists every followed-up prayer request with when it came in and when you reached out.

## v2.13 · Pastoral care · 20 July 2026

- New Missing In Action care list: anyone in the family who's gone quiet for over a week appears on the Today page and in Insights, with how long they've been quiet and their history. Tick "I've checked in" after your personal WhatsApp and they leave the list… and if they stay silent, they gently resurface a fortnight later so nobody slips away unnoticed.
- Prayer requests now have their own path: star a message On Air as a Prayer Request and it joins a follow-up queue on Today and Insights until you've reached out personally. The request stays on their profile afterwards, so future conversations remember what they were carrying.

## v2.12 · The script sets the date · 16 July 2026

- Importing a show plan now reads the broadcast date from the script itself and sets it everywhere: the workspace, liner read dates and cloud saves all land on the right day and week automatically. No more stale dates filing liners under the wrong week.

## v2.11 · Liners only, everywhere · 16 July 2026

- Fixed script fragments being stored as liners: saving a show online was still using the old keyword guessing. Every route into the liner archive (import, cloud save) now only accepts links structurally marked as liners in the script, with the same one-read-per-show-day counting.
- Wrongly stored entries cleared from the archive again.

## v2.10 · Listener profiles · 16 July 2026

- Start typing a name On Air and known listeners are suggested… tap a suggestion and the message logs against them instantly.
- Every message carries its source: WhatsApp, Instagram or Text. Insights shows how each channel builds over time.
- Listener profiles: star any message On Air to save a birthday, favourite song or keeper message against that person. Tap a regular in Insights to see and edit their profile and saved messages.
- New five second countdown on Start reading: press it, fire the music, and the script starts scrolling as you sit back down. Tap anywhere to cancel.

## v2.9 · Reading view refined · 16 July 2026

- The link counter on the On Air screen is now big and unmissable: hour, link number out of the hour, and position in the whole show, right beside the link title.
- Fixed Start reading not scrolling: the auto-scroll now moves reliably on Safari and iPad, and rolls through the full page including producer notes.

## v2.8 · True read counts · 15 July 2026

- Liner read counts now show exactly what was counted at import time: one read per liner per show day. The old fuzzy text-matching that inflated counts is retired.
- Old wrongly-extracted "liners" (script fragments) cleared from the archive, which now holds the real station liners with honest counts.

## v2.7 · Presenter Hub repaired · 15 July 2026

- Found and fixed the root cause of the empty Presenter Hub: dates coming back from the database in a different shape than the page expected. Liners and imports now load correctly.

## v2.6 · Liners that save themselves · 15 July 2026

- Fixed the fault that stopped Presenter Hub loading and showing saved liners. If storage ever has a problem again, the page now says exactly what went wrong instead of showing nothing.
- Liner saving is now driven by the script itself: any link marked as a liner link is saved to Presenter Hub on import, with the read counted for that show day. Importing the same script twice does not double-count.
- Liner read counts rise day by day as the same liner appears in each day's script.
- Liners can be removed from the archive with one tap if a bad one sneaks in.

## v2.5 · The commercial cut · 15 July 2026

The big clean-up. BroadcastOS now looks and behaves like a commercial app a presenter walks up to and uses.

- Splash screen is now the front door: two choices, Produce or Go On Air. Clicking the Premier logo anywhere brings it back.
- Now On Air bar is permanent on every page, showing the live Premier Gospel show and what comes next.
- The studio indicator only lights up during Adam's actual broadcast hours: weekdays 1 to 4pm and Sundays 9am to midday, UK time.
- Response Gate answers can now be switched between YES and NO at any time while a link is open.
- New teleprompter: Start reading auto-scrolls the script at your talking pace. The WhatsApp button pauses it, Back to script resumes.
- WhatsApp paste tools are gone. In their place: log the name of anyone who messages in, tap their number when they message again, and shout them out with their all-time count to hand.
- New Insights page: messages per show, all-time regulars, and how often each station liner has been read.
- Liner tracking is fully automatic: importing a script saves it to Presenter Hub and counts liner reads with no extra steps.
- Launch check moved into the On Air header instead of floating over the page.
- Removed duplicated version badges, repeated link counters, internal status text and behind-the-scenes notes across every page.

## v2.4 · Paste-proof importing · 15 July 2026

- Script import now survives hostile clipboard formatting: non-breaking spaces, odd bullets, carriage returns and invisible characters are cleaned up automatically.

## v2.3 · Promo detection · 15 July 2026

- Pre-show promo sections written with headings are now detected and imported.

## v2.2 · Response Gate fixes · 15 July 2026

- The Response Gate now only triggers on links that read responses, never on links that just ask a question.
- Splash screen waits for a click instead of disappearing on a timer.
- Import warns when a message-reading link is missing its no-responses version.

## v2.1 · Response Gate · 15 July 2026

- Response-dependent links carry two versions of The Moment. On Air asks "Do you have responses?" and shows only the true one.
- The old Fallback field is retired.

## v2.0 and earlier

- Producer Desk, On Air reading view, show templates, launch sequence, cloud saved shows and Presenter Hub.
