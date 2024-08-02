#!/bin/sh

# Check if the ENV_FILE variable is set
if [ -z "$1" ]; then
  echo "ENV_FILE is not set. Please set ENV_FILE to the appropriate environment file."
  exit 1
fi

ENV_FILE=$1

export $(grep -v '^#' $ENV_FILE | xargs)

if [ "$RUN_POSTGRES" = "true" ]; then
  docker-compose --env-file $ENV_FILE build --no-cache
  docker-compose --env-file $ENV_FILE --profile postgres up -d
else
   docker-compose --env-file $ENV_FILE build --no-cache
    docker-compose --env-file $ENV_FILE up -d
fi

