#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
yarn prisma migrate deploy

# Start the application
echo "Starting application..."
node dist/main.js 