#!/bin/bash
set -e
cd "$(dirname "$0")"

JAR="backend/target/scala-3.6.3/kitchenklock-assembly.jar"

if [ ! -d "backend/src/main/resources/public" ] || [ -z "$(ls -A backend/src/main/resources/public 2>/dev/null)" ]; then
  echo "==> Building frontend..."
  cd frontend
  npm install
  npm run build
  cd ..
fi

if [ ! -f "$JAR" ]; then
  echo "==> Building backend JAR..."
  cd backend
  sbt assembly
  cd ..
fi

echo "==> Starting KitchenKlock on http://localhost:8080"
java -jar "$JAR"
