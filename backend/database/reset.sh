#!/bin/bash

# Connect to PostgreSQL and drop/recreate the database
PGPASSWORD=postgres psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS quartermaster;"
PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE quartermaster OWNER postgres;"

echo "Database reset complete. Now run migrations." 