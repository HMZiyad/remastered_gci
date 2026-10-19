#!/bin/sh
set -e

echo "=========================================================="
echo " Good Car Imports — Container Initialization"
echo "=========================================================="

# Ensure upload directory exists
mkdir -p /app/public/uploads/vehicles

# Wait for MariaDB and synchronize Prisma database schema
echo "==> Synchronizing database schema with MariaDB..."
MAX_RETRIES=30
RETRY_COUNT=0

until npx prisma db push --skip-generate; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "ERROR: Could not connect to MariaDB after $MAX_RETRIES attempts."
    exit 1
  fi
  echo "MariaDB is not ready yet... Retrying in 2 seconds ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "==> MariaDB schema synchronized successfully!"

# Check if auto-seed is enabled and database needs seeding
if [ "${AUTO_SEED:-true}" = "true" ]; then
  node prisma/init-db.js
fi

echo "=========================================================="
echo " Starting Good Car Imports on port ${PORT:-3000}"
echo "=========================================================="

exec "$@"
