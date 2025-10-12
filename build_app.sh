#!/bin/sh

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

# buld frontend app

cd "$SCRIPT_DIR/kanban-board-app"

npm install
# npm upgrade
npm run build
