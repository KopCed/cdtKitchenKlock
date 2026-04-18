#!/bin/bash
set -e

JAR_DIR="/opt/kitchenklock"
JAR="$JAR_DIR/kitchenklock-assembly.jar"

if [ ! -f "$JAR" ]; then
  echo "JAR not found at $JAR. Run install-service.sh first."
  exit 1
fi

echo "==> Starting KitchenKlock on http://localhost:8080"
exec java \
  -Xmx512m \
  -Xms128m \
  -XX:+UseSerialGC \
  -jar "$JAR"
