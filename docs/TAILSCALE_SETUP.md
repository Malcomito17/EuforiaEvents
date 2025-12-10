# Configuración de Tailscale en Raspberry Pi

Tailscale proporciona acceso remoto seguro a tu Raspberry Pi mediante una VPN de configuración cero.

## 📋 ¿Por qué Tailscale?

- **Acceso remoto seguro** sin abrir puertos en tu router
- **VPN de configuración cero** - se conecta automáticamente
- **Convive con Cloudflare Tunnel**:
  - Cloudflare Tunnel: Acceso público para invitados (QR codes)
  - Tailscale: Acceso administrativo seguro (solo tus dispositivos)

## 🚀 Instalación en Raspberry Pi

### 1. Instalar Tailscale

```bash
# Descargar e instalar Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Verificar instalación
tailscale version
```

### 2. Autenticar el Dispositivo

```bash
# Iniciar Tailscale y obtener URL de autenticación
sudo tailscale up
```

Este comando mostrará una URL como:
```
To authenticate, visit:
https://login.tailscale.com/a/xxxxxxxxxxxx
```

1. Copia la URL y ábrela en tu navegador
2. Inicia sesión con tu cuenta de Tailscale (o crea una)
3. Autoriza el dispositivo

### 3. Verificar Conexión

```bash
# Ver estado de Tailscale
tailscale status

# Ver tu IP de Tailscale
tailscale ip -4

# Verificar conectividad
tailscale ping nombre-de-otro-dispositivo
```

## 🔐 Configuraciones Recomendadas

### Habilitar SSH sobre Tailscale

```bash
# Permitir SSH desde otros dispositivos Tailscale
sudo tailscale up --ssh
```

Ahora puedes hacer SSH usando el nombre del dispositivo:
```bash
ssh usuario@raspberry-pi
# O usando la IP de Tailscale:
ssh usuario@100.x.x.x
```

### Configurar Nombre del Dispositivo

En el [panel de administración de Tailscale](https://login.tailscale.com/admin/machines):

1. Encuentra tu Raspberry Pi en la lista de máquinas
2. Haz clic en los 3 puntos (⋯) → **Edit name**
3. Asigna un nombre descriptivo como `euforia-pi` o `euforia-events`

### Habilitar MagicDNS (Recomendado)

MagicDNS permite usar nombres en lugar de IPs.

En el [panel de Tailscale](https://login.tailscale.com/admin/dns):

1. Ve a **DNS** en el menú lateral
2. Activa **MagicDNS**
3. Ahora puedes acceder con: `http://euforia-pi` en lugar de `http://100.x.x.x`

## 🌐 Acceso a EUFORIA EVENTS vía Tailscale

### Desde cualquier dispositivo en tu red Tailscale

**Usando el nombre del dispositivo:**
```
http://euforia-pi
```

**Usando la IP de Tailscale:**
```
http://100.x.x.x
```

### URLs de la aplicación

- **App Cliente:** `http://euforia-pi/`
- **Panel Operador:** `http://euforia-pi/operador`
- **API:** `http://euforia-pi/api/health`

## 🔧 Configuraciones Avanzadas (Opcional)

### Hacer la Raspberry Pi un Exit Node

Si quieres usar la Raspberry Pi como VPN para todo tu tráfico:

```bash
# 1. Habilitar IP forwarding
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf

# 2. Anunciar como exit node
sudo tailscale up --advertise-exit-node
```

Luego en otros dispositivos:
1. Abre la configuración de Tailscale
2. Selecciona "Use exit node"
3. Elige tu Raspberry Pi

### Subnet Routing (Acceso a toda tu red local)

Para acceder a otros dispositivos en la red local de la Raspberry Pi:

```bash
# Reemplaza 192.168.1.0/24 con tu red local
sudo tailscale up --advertise-routes=192.168.1.0/24
```

Luego en el panel de Tailscale:
1. Ve a tu Raspberry Pi en **Machines**
2. Haz clic en **⋯** → **Edit route settings**
3. Aprueba las rutas anunciadas

### Compartir Acceso con Otros Usuarios

En el [panel de Tailscale](https://login.tailscale.com/admin/settings/users):

1. Ve a **Users** → **Invite users**
2. Envía invitaciones por email
3. Los usuarios invitados podrán acceder a los dispositivos compartidos

Para compartir solo la Raspberry Pi:
1. Ve a **Machines** → Tu Raspberry Pi
2. Haz clic en **⋯** → **Share**
3. Elige el usuario y nivel de acceso

## 🔒 Control de Acceso (ACLs)

Para control granular de quién puede acceder a qué:

En el [panel de Tailscale](https://login.tailscale.com/admin/acls):

Ejemplo de ACL para EUFORIA EVENTS:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["autogroup:members"],
      "dst": ["tag:euforia-server:80,443,3000"]
    },
    {
      "action": "accept",
      "src": ["autogroup:admin"],
      "dst": ["tag:euforia-server:*"]
    }
  ],
  "tagOwners": {
    "tag:euforia-server": ["autogroup:admin"]
  }
}
```

Luego etiqueta tu Raspberry Pi con `tag:euforia-server`.

## 🔄 Mantenimiento

### Verificar Estado

```bash
# Ver estado detallado
tailscale status

# Ver configuración actual
tailscale debug prefs
```

### Actualizar Tailscale

```bash
# Actualizar a la última versión
sudo apt update
sudo apt upgrade tailscale
```

### Desconectar Temporalmente

```bash
# Desconectar (mantiene configuración)
sudo tailscale down

# Reconectar
sudo tailscale up
```

### Desinstalar Completamente

```bash
# Desconectar y eliminar
sudo tailscale logout
sudo apt remove tailscale
sudo apt purge tailscale
```

## 🆘 Troubleshooting

### Tailscale no se conecta

```bash
# Verificar que el servicio está corriendo
sudo systemctl status tailscaled

# Reiniciar el servicio
sudo systemctl restart tailscaled

# Ver logs
sudo journalctl -u tailscaled -n 50
```

### No puedo acceder a la Raspberry Pi

1. Verifica que ambos dispositivos estén en línea:
   ```bash
   tailscale status
   ```

2. Prueba hacer ping:
   ```bash
   tailscale ping raspberry-pi
   ```

3. Verifica que no hay reglas de firewall bloqueando:
   ```bash
   sudo ufw status
   ```

### Problemas de DNS

Si MagicDNS no funciona:

```bash
# Ver configuración DNS
tailscale debug dns-config

# Usar IP directamente en lugar de nombre
tailscale ip -4
```

## 📱 Instalación en Otros Dispositivos

### macOS / Linux / Windows

Descarga desde: https://tailscale.com/download

### iOS / Android

Busca "Tailscale" en App Store o Google Play

### Conectar todos tus dispositivos

1. Instala Tailscale en cada dispositivo
2. Inicia sesión con la misma cuenta
3. Todos los dispositivos se verán entre sí automáticamente

## 🔗 Recursos Útiles

- **Panel de Admin:** https://login.tailscale.com/admin
- **Documentación Oficial:** https://tailscale.com/kb
- **Estado del Servicio:** https://status.tailscale.com
- **Comunidad:** https://forum.tailscale.com

## ⚠️ Notas de Seguridad

- Tailscale usa encriptación end-to-end (WireGuard)
- Los servidores de Tailscale NO pueden ver tu tráfico
- Usa autenticación de 2 factores en tu cuenta de Tailscale
- Revisa regularmente los dispositivos conectados
- No compartas tu cuenta de Tailscale con usuarios no confiables

## 🎯 Próximos Pasos

Después de configurar Tailscale:

1. ✅ Instala Tailscale en tu laptop/desktop
2. ✅ Instala Tailscale en tu smartphone
3. ✅ Configura MagicDNS para acceso por nombre
4. ✅ Prueba acceder a EUFORIA EVENTS desde fuera de tu red local
5. ✅ Considera habilitar SSH sobre Tailscale para administración remota

---

**Última actualización:** Diciembre 2024
**Versión:** 1.0
**Plataforma:** Raspberry Pi 4 (ARM64)
