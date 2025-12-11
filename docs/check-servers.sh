#!/bin/bash
# check-servers.sh - Verifica que todos los servidores necesarios estén corriendo

echo "🔍 Verificando servidores..."

# API (puerto 3000)
if lsof -i :3000 > /dev/null 2>&1; then
  echo "✅ API Server (puerto 3000) - CORRIENDO"
else
  echo "❌ API Server (puerto 3000) - DETENIDO"
  echo "   Iniciar con: cd apps/api && SPOTIFY_CLIENT_ID=4b5dd84006a74b5a88379c5d12a08335 SPOTIFY_CLIENT_SECRET=e811dcf747e245078883fb4c654d296a NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx watch src/server.ts"
  exit 1
fi

# Web Client (puerto 5173)
if lsof -i :5173 > /dev/null 2>&1; then
  echo "✅ Web Client (puerto 5173) - CORRIENDO"
else
  echo "⚠️  Web Client (puerto 5173) - DETENIDO"
  echo "   Iniciar con: cd apps/web-client && NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm dev"
fi

# Web Operator (puerto 5174)
if lsof -i :5174 > /dev/null 2>&1; then
  echo "✅ Web Operator (puerto 5174) - CORRIENDO"
else
  echo "⚠️  Web Operator (puerto 5174) - DETENIDO"
  echo "   Iniciar con: cd apps/web-operator && NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm dev"
fi

echo ""
echo "✅ Verificación de servidores completa"
