#!/bin/bash

set -e

APP_ENV=${1:-development}
ENV_FILE=".env.${APP_ENV}"

if [ ! -f "$ENV_FILE" ]; then
  echo "$ENV_FILE not found."
  echo "Create it from .env.example, then run this command again."
  exit 1
fi

cp "$ENV_FILE" ".env"
echo "Copied $ENV_FILE -> .env"

node ./node_modules/react-native-superconfig/scripts/generate-config.js
