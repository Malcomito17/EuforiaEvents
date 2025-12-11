#!/bin/bash
# verify-imports.sh - Detecta imports incorrectos de auth middleware

echo "🔍 Verificando imports de auth middleware..."

INCORRECT_IMPORTS=$(grep -r "from.*['\"]\.\.\/auth['\"]" apps/api/src/ 2>/dev/null || true)
INCORRECT_IMPORTS2=$(grep -r "from.*middleware\/auth" apps/api/src/ 2>/dev/null || true)

if [ -n "$INCORRECT_IMPORTS" ] || [ -n "$INCORRECT_IMPORTS2" ]; then
  echo "❌ Imports incorrectos detectados:"
  echo "$INCORRECT_IMPORTS"
  echo "$INCORRECT_IMPORTS2"
  echo ""
  echo "Debe ser:"
  echo "  import { authenticate } from '../auth/auth.middleware'"
  echo "  import { isAuthenticated } from '../../modules/auth/auth.middleware'"
  exit 1
fi

echo "✅ Todos los imports de auth son correctos"
