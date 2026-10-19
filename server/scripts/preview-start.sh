#!/usr/bin/env bash
# Preview-only bootstrap: embedded PostgreSQL (from node_modules) + migrations + seed + API with watch mode.
set -e
cd /app/server
ARCH=$(uname -m); [ "$ARCH" = "aarch64" ] && PGPKG=linux-arm64 || PGPKG=linux-x64
PGROOT=/app/server/node_modules/@embedded-postgres/$PGPKG/native
PGBIN=$PGROOT/bin
PGDATA=/app/server/.pgdata
PGPORT=5433
export LD_LIBRARY_PATH=$PGROOT/lib

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  mkdir -p "$PGDATA"
  chown nobody:nogroup "$PGDATA"
  echo "prpt_local_pw" > /tmp/pgpw && chown nobody /tmp/pgpw
  runuser -u nobody -- env LD_LIBRARY_PATH=$LD_LIBRARY_PATH "$PGBIN/initdb" -D "$PGDATA" -U prpt --pwfile=/tmp/pgpw -A scram-sha-256 -E UTF8 --no-locale
  rm -f /tmp/pgpw
fi

if ! runuser -u nobody -- env LD_LIBRARY_PATH=$LD_LIBRARY_PATH "$PGBIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
  rm -f "$PGDATA/postmaster.pid"
  runuser -u nobody -- env LD_LIBRARY_PATH=$LD_LIBRARY_PATH "$PGBIN/pg_ctl" -D "$PGDATA" -l /tmp/postgres.log \
    -o "-p $PGPORT -k /tmp -c listen_addresses=127.0.0.1" -w start
fi

npx prisma migrate deploy
node prisma/seed.js
exec node --watch-path=src src/index.js
