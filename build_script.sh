#!/bin/sh

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

# buld frontend app

cd "$SCRIPT_DIR/kanban-board-app"

npm install
npm upgrade
npm run build

# buld backend app

cd "$SCRIPT_DIR/KanbanBoardApi"

dotnet restore
dotnet clean --configuration Debug
dotnet clean --configuration Release
dotnet build
rm -rf publish
dotnet publish -o publish -c Release
rm ./publish/appsettings.Development.json

# start docker containers

cd "$SCRIPT_DIR"

docker compose up -d

echo "KanbanBoard application is now running. Open https://localhost to access it."
