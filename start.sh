#!/bin/sh

if [ "${RUN_POSTGRES}" = "true" ]; then
  # Wait for PostgreSQL to be ready
  echo "Waiting for PostgreSQL to start..."
  until pg_isready -h ${PG_HOST} -U ${PG_USER}; do
    sleep 1
    echo "Waiting for PostgreSQL to be ready..."
  done
  echo "PostgreSQL is ready."
fi

if pg_isready -h ${PG_HOST} -U ${PG_USER}; then
    echo "PostgreSQL is ready. Running schema setup..."
    npm run create-schema
else
    echo "Error: PostgreSQL is not reachable. Exiting..."
    exit 1
fi

npm start
