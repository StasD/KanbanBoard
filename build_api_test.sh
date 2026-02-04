#!/bin/sh

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

# buld backend app

cd "$SCRIPT_DIR/ApiTest"

dotnet restore
dotnet clean --configuration Debug
dotnet clean --configuration Release
dotnet build
rm -rf publish
dotnet publish -o publish -c Release

docker compose up api-test
