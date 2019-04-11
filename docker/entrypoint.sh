#!/bin/sh

set -e

export PGHOST=${BLACKHOLE_POSTGRESQL_SERVICE_HOST:-postgres}
export PGUSER=${POSTGRES_USER:-postgres}
export PGPASSWORD=$BLACKHOLE_DB_PASSWORD
export PGDATABASE=${BLACKHOLE_POSTGRES_DB:-blackhole_production}

yarn setupdb
yarn production

exec "$@"
