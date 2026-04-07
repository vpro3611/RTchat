#!/bin/sh

# Exit on error
set -e

echo "Running migrations..."
# Use the connection string from env
# node-pg-migrate uses DATABASE_URL by default
npm run migrate up

echo "Starting application..."
exec "$@"
