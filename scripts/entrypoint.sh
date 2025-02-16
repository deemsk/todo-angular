#!/bin/bash
set -e

# Start PostgreSQL in the background
# echo "Starting PostgreSQL..."
# pg_ctl start -D /var/lib/postgresql/data -l /var/lib/postgresql/data/logfile

# (Optional) Create a default user/db if you like. For example:
# su postgres -c "psql -c \"CREATE USER dev WITH PASSWORD 'dev';\""
# su postgres -c "psql -c \"CREATE DATABASE dev;\""

# Start the backend API (this process will run in the foreground)
echo "Starting backend API..."
pnpm run start:server &

# Start the backend API (this process will run in the foreground)
echo "Starting Angular client app..."
pnpm run start:client