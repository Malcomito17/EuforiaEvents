# Sistema Integral de Eventos
## Resumen Técnico Funcional

### 1. Objetivo del sistema
El sistema integral de eventos tiene como objetivo centralizar, organizar y operar todos los aspectos críticos de un evento en tiempo real, reduciendo errores operativos y mejorando la coordinación entre personas, tiempos y servicios.

Está diseñado con una arquitectura modular, orientada a operación en vivo, con separación clara entre configuración, operación y consulta.

---

### 2. Arquitectura general
El sistema se estructura en módulos funcionales desacoplados pero relacionados, todos orquestados por el módulo **Evento**. Cada módulo expone información específica según el rol del usuario y el contexto de uso (antes, durante o después del evento).

Principios de diseño:
- Modularidad estricta
- Interfaces simples para operación en tiempo real
- Datos mínimos pero suficientes
- Separación clara entre edición y consulta

---

### 3. Módulos definidos

#### 3.1 Módulo Evento (Core)
Módulo central que define y contextualiza el evento.

Funciones:
- Definición de datos generales del evento (nombre, fecha, hora de inicio, lugar)
- Configuración global del evento
- Asociación lógica con invitados, mesas, menú y timeline

No contiene lógica operativa directa; actúa como orquestador.

---

#### 3.2 Módulo Invitados
Gestión de la base de invitados del evento.

Funciones:
- Alta, edición y consulta de invitados
- Gestión de atributos simples y observaciones
- Asociación a mesa, menú y estado de ingreso

Características:
- Estructura liviana
- Optimizado para búsquedas rápidas
- Sin sobrecarga de datos irrelevantes

---

#### 3.3 Módulo Mesas
Gestión de la distribución espacial del evento.

Funciones:
- Creación y administración de mesas
- Asignación de invitados a mesas
- Reorganización dinámica

Vistas diferenciadas:
- Operador: edición y reasignación
- Recepción: consulta únicamente

---

#### 3.4 Módulo Menú
Gestión de opciones gastronómicas del evento.

Componentes:
- Biblioteca de platos (nombre, descripción, restricciones alimentarias)
- Asignación de platos disponibles por evento
- Asignación de platos a invitados

Reglas:
- Un evento puede tener múltiples platos habilitados
- Asignación general o individual
- Los invitados solo pueden elegir entre platos habilitados para el evento

---

#### 3.5 Módulo Check-in / Recepción
Aplicación cliente orientada a operación en acceso.

Funciones:
- Búsqueda rápida de invitados
- Confirmación de ingreso
- Visualización de datos críticos (mesa, observaciones)

Restricciones:
- Sin edición de datos
- Interfaz minimalista
- Optimizado para uso bajo presión

---

#### 3.6 Módulo Panel de Operador
Interfaz principal de administración y operación.

Funciones:
- Gestión de invitados
- Asignación de mesas
- Configuración y asignación de menús
- Supervisión general del evento

Concentra la complejidad para simplificar las vistas operativas.

---

#### 3.7 Módulo Timeline / Agenda del Evento
Gestión temporal y operativa del evento.

Funciones:
- Definición de eventos por horario (slots)
- Orden cronológico automático
- Comparación hora planificada vs hora real
- Indicadores de atraso/adelanto
- Registro de ejecución de cada evento

Cada slot puede incluir notas técnicas para coordinación de producción.

---

### 4. Sistema de vistas y roles
El sistema define múltiples vistas sobre los mismos datos:

- Vista Operador
- Vista Recepción
- Vista Consulta Interna
- Vista Edición / Administrador

Cada vista expone solo la información necesaria según el rol.

---

### 5. Enfoque operativo
El sistema está diseñado para:
- Uso en tiempo real
- Toma de decisiones rápida
- Minimización de errores humanos
- Escenarios de alta presión operativa

No es un sistema administrativo tradicional, sino una herramienta de dirección y ejecución de eventos.

---

### 6. Estado actual
- Definición funcional completa
- Arquitectura modular validada
- Listo para fase de diseño técnico y modelado de datos

