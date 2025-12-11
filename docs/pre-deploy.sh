#!/bin/bash
# pre-deploy.sh - Script completo para ejecutar antes de cada deployment

set -e  # Exit on error

echo "🚀 Pre-Deployment Verification"
echo "=============================="
echo ""

# 1. Verificar imports
echo "1️⃣ Verificando imports..."
./docs/verify-imports.sh
echo ""

# 2. Verificar servidores
echo "2️⃣ Verificando servidores..."
./docs/check-servers.sh
echo ""

# 3. TypeScript compilation
echo "3️⃣ Compilando TypeScript..."
echo "   - Compilando API..."
(cd apps/api && npx tsc --noEmit) || { echo "❌ API TypeScript compilation failed"; exit 1; }
echo "   - Compilando Web Operator..."
(cd apps/web-operator && npx tsc --noEmit) || { echo "❌ Web Operator TypeScript compilation failed"; exit 1; }
echo "   - Compilando Web Client..."
(cd apps/web-client && npx tsc --noEmit) || { echo "❌ Web Client TypeScript compilation failed"; exit 1; }
echo "✅ TypeScript compilation passed"
echo ""

# 4. Tests de API
echo "4️⃣ Testeando API..."
./docs/test-rapido.sh
echo ""

# 5. Verificar git status
echo "5️⃣ Verificando git status..."
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "⚠️  Tienes cambios sin commitear"
  git status --short
  echo ""
  echo "Deseas continuar de todos modos? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelado"
    exit 1
  fi
else
  echo "✅ Git status limpio"
fi
echo ""

echo "=============================="
echo "✅ ¡TODO LISTO PARA DEPLOYMENT!"
echo "=============================="
echo ""
echo "Próximos pasos sugeridos:"
echo "1. git push origin main"
echo "2. Verificar deployment en servidor"
echo "3. Ejecutar smoke tests en producción"
