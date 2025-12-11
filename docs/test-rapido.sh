#!/bin/bash
# test-rapido.sh - Test de Regresión Rápido

echo "🧪 Test de Regresión Rápido"
echo ""

# 1. API Health
echo "1️⃣ Verificando API health..."
API_HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo "")
if [ -z "$API_HEALTH" ]; then
  echo "❌ API no responde en puerto 3000"
  echo "   Verificar que el servidor esté corriendo"
  exit 1
fi
echo "✅ API health OK"
echo ""

# 2. Auth funciona
echo "2️⃣ Testeando autenticación..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' 2>/dev/null)

# Verificar si jq está disponible
if command -v jq &> /dev/null; then
  TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token' 2>/dev/null)
else
  # Extracción simple sin jq (menos confiable)
  TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ] || [ "$TOKEN" == "undefined" ]; then
  echo "❌ Auth falló"
  echo "   Response: $AUTH_RESPONSE"
  exit 1
fi
echo "✅ Auth OK (token obtenido)"
echo ""

# 3. Endpoint protegido funciona
echo "3️⃣ Testeando endpoints protegidos..."
EVENTS=$(curl -s http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)
if echo "$EVENTS" | grep -q "error"; then
  echo "❌ Endpoints protegidos fallan"
  echo "   Response: $EVENTS"
  exit 1
fi
echo "✅ Protected endpoints OK"
echo ""

# 4. Socket.io disponible
echo "4️⃣ Verificando Socket.io..."
SOCKET=$(curl -s http://localhost:3000/socket.io/ 2>/dev/null)
if echo "$SOCKET" | grep -q "Upgrade Required" || echo "$SOCKET" | grep -q "WebSocket"; then
  echo "✅ Socket.io OK"
else
  echo "⚠️  Socket.io puede tener problemas"
fi
echo ""

echo "=============================="
echo "✅ TODOS LOS TESTS PASARON"
echo "=============================="
