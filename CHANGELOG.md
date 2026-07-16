# BroadcastOS Changelog

Every push bumps the minor version. Adam decides when a major version lands.

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
