#!/bin/sh

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

cd "$SCRIPT_DIR"

# stop docker containers
docker compose stop

# buld backend app
$SCRIPT_DIR/build_api.sh

# buld frontend app
$SCRIPT_DIR/build_app.sh

# start docker containers
docker compose up -d

echo "KanbanBoard application is now running. Open https://localhost to access it."
