#!/usr/bin/env bash
set -euo pipefail
review_session=odyssey-production
review_root=/home/sanchit/projects/odyssey
review_round=${1:-r02}
mkdir -p "$review_root/cook/stills/$review_round"
for review_size in desktop mobile; do
  if [ "$review_size" = desktop ]; then agent-browser --session "$review_session" set viewport 1440 1000; else agent-browser --session "$review_session" set viewport 390 844; fi
  for review_route in tasks quests insights journals help settings check-in; do
    agent-browser --session "$review_session" open "http://127.0.0.1:15177/$review_route"
    agent-browser --session "$review_session" wait --fn "location.pathname === '/$review_route' && !!document.querySelector('main h1') && !document.querySelector('[aria-busy=true]') && !document.querySelector('.ody-skeleton')"
    agent-browser --session "$review_session" eval --stdin < /tmp/odyssey-settle.js > "$review_root/cook/layout-$review_route-$review_size.json"
    agent-browser --session "$review_session" screenshot "./cook/stills/$review_round/$review_route-$review_size.png"
    agent-browser --session "$review_session" eval --stdin < /tmp/odyssey-axe-run.js > "$review_root/cook/axe-$review_route-$review_size.json"
  done
done
