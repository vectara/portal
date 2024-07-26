# Function to run PostgreSQL container
run_postgres() {
  echo "Running PostgreSQL container..."
  docker container inspect postgres-db &>/dev/null && docker rm -f postgres-db
  docker run --name postgres-db --network portal-network -e POSTGRES_USER=$PG_USER -e POSTGRES_PASSWORD=$PG_PASSWORD -e POSTGRES_DB=$PG_NAME -e POSTGRES_PORT=$PG_PORT -p $PG_PORT:5432 -d postgres

  # Check if the container started successfully
    if [ $? -ne 0 ]; then
      docker logs postgres-db
      echo "Failed to start PostgreSQL container"
      exit 1
    fi

  # Wait for PostgreSQL to start
    echo "Waiting for PostgreSQL to start..."
    until docker exec postgres-db pg_isready -U $PG_USER; do
      sleep 1
      echo "Waiting for PostgreSQL to be ready..."
    done
    echo "PostgreSQL is ready."
}


# Check if the ENV_FILE variable is set
if [ -z "$ENV_FILE" ]; then
  echo "ENV_FILE is not set. Please set ENV_FILE to the appropriate environment file."
  exit 1
fi

# Read environment variables from the env file
set -a
source ./$ENV_FILE
set +a


docker network create portal-network

# Build docker container
docker build -f Dockerfile . --tag=v-portal

# Remove old container if it exists
docker container inspect v-portal &>/dev/null && docker rm -f v-portal

# Decide whether to run PostgreSQL container based on the argument
if [ "$1" == "start-postgres" ]; then
  run_postgres
  POSTGRES_LINK="--link postgres-db:db"
else
  POSTGRES_LINK=""
fi

# Run the container
docker run -d --name v-portal --env-file ./$ENV_FILE -p 8080:3000 $POSTGRES_LINK --network portal-network v-portal
