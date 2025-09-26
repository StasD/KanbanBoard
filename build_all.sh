#!/bin/sh

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

cd "$SCRIPT_DIR"

# buld frontend app
$SCRIPT_DIR/build_app.sh

# buld backend app
$SCRIPT_DIR/build_api.sh

# start docker containers
docker compose stop
docker compose up -d

echo "KanbanBoard application is now running. Open https://localhost to access it."
