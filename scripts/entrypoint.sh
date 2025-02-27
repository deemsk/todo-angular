#!/bin/sh
set -e

export NODE_ENV=production

npx conc --kill-others \
    "node dist/server/main.js" \
    "npx serve -s ./dist/client/browser -l 4200"
