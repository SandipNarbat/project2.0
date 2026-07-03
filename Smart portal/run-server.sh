#!/bin/sh
# 24/7 supervisor for the Smart Portal SSE server.
# The server exits(1) on an uncaught exception (unknown state is worse than a
# 2-second restart); this loop brings it straight back up and keeps a log.
#
# Usage:  ./run-server.sh            (logs to server.log next to this script)
#         PORT=9090 ./run-server.sh  (env vars pass through to node)

cd "$(dirname "$0")" || exit 1

while true; do
  echo "[run-server] $(date '+%Y-%m-%d %H:%M:%S') starting server.js" >> server.log
  node server.js >> server.log 2>&1
  code=$?
  echo "[run-server] $(date '+%Y-%m-%d %H:%M:%S') server exited with code $code — restarting in 2s" >> server.log
  sleep 2
done
