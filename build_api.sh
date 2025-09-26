#!/bin/sh

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

# buld backend app

cd "$SCRIPT_DIR/KanbanBoardApi"

dotnet restore
dotnet clean --configuration Debug
dotnet clean --configuration Release
dotnet build
rm -rf publish
dotnet publish -o publish -c Release
rm ./publish/appsettings.Development.json
