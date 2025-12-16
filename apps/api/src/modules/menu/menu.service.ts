import { PrismaClient } from '@prisma/client'
import type {
  AddDishToMenuInput,
  CreateCategoryInput,
  AssignDishToGuestInput,
  AutoAssignDishesInput,
  EventDishResponse,
  DishCategoryResponse,
  MenuResponse,
  GuestDishResponse,
  GuestMenuResponse,
  MenuAlert,
  MenuAlertsResponse,
  AutoAssignResultResponse,
} from './menu.types'

const prisma = new PrismaClient()

export class MenuService {
  /**
   * Sanitiza EventDish a Response
   */
  private sanitizeEventDish(eventDish: any): EventDishResponse {
    return {
      id: eventDish.id,
      eventId: eventDish.eventId,
      dishId: eventDish.dishId,
      categoryId: eventDish.categoryId,
      isDefault: eventDish.isDefault,
      orden: eventDish.orden,
      createdAt: eventDish.createdAt.toISOString(),
      dish: {
        id: eventDish.dish.id,
        nombre: eventDish.dish.nombre,
        descripcion: eventDish.dish.descripcion,
        dietaryInfo: JSON.parse(eventDish.dish.dietaryInfo || '[]'),
        isActive: eventDish.dish.isActive,
      },
      category: {
        id: eventDish.category.id,
        nombre: eventDish.category.nombre,
        orden: eventDish.category.orden,
        isSystemDefault: eventDish.category.isSystemDefault,
      },
      _count: eventDish._count,
    }
  }

  /**
   * Sanitiza DishCategory a Response
   */
  private sanitizeCategory(category: any): DishCategoryResponse {
    return {
      id: category.id,
      eventId: category.eventId,
      nombre: category.nombre,
      orden: category.orden,
      isSystemDefault: category.isSystemDefault,
      createdAt: category.createdAt.toISOString(),
      _count: category._count,
    }
  }

  /**
   * Sanitiza GuestDish a Response
   */
  private sanitizeGuestDish(guestDish: any): GuestDishResponse {
    return {
      id: guestDish.id,
      eventGuestId: guestDish.eventGuestId,
      eventDishId: guestDish.eventDishId,
      assignedAt: guestDish.assignedAt.toISOString(),
      assignedBy: guestDish.assignedBy,
      eventDish: this.sanitizeEventDish(guestDish.eventDish),
    }
  }

  /**
   * Agrega un plato al menú del evento
   */
  async addDishToMenu(
    eventId: string,
    data: AddDishToMenuInput,
    userId?: string
  ): Promise<EventDishResponse> {
    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error('Evento no encontrado')
    }

    // Verificar que el plato existe y está activo
    const dish = await prisma.dish.findUnique({
      where: { id: data.dishId },
    })

    if (!dish || !dish.isActive) {
      throw new Error('Plato no encontrado o inactivo')
    }

    // Si no se envía categoryId, buscar o crear la categoría "PRINCIPAL" por defecto
    let categoryId = data.categoryId
    if (!categoryId) {
      // Buscar la categoría PRINCIPAL global (isSystemDefault)
      let defaultCategory = await prisma.dishCategory.findFirst({
        where: {
          nombre: 'PRINCIPAL',
          isSystemDefault: true,
        },
      })

      // Si no existe, crearla
      if (!defaultCategory) {
        defaultCategory = await prisma.dishCategory.create({
          data: {
            nombre: 'PRINCIPAL',
            orden: 1,
            isSystemDefault: true,
          },
        })
      }

      categoryId = defaultCategory.id
    }

    // Verificar que la categoría existe
    const category = await prisma.dishCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      throw new Error('Categoría no encontrada')
    }

    // Verificar si el plato ya está en el menú
    const existing = await prisma.eventDish.findUnique({
      where: {
        eventId_dishId: {
          eventId,
          dishId: data.dishId,
        },
      },
    })

    if (existing) {
      throw new Error('Este plato ya está en el menú del evento')
    }

    const eventDish = await prisma.eventDish.create({
      data: {
        eventId,
        dishId: data.dishId,
        categoryId: categoryId,
        isDefault: data.isDefault || false,
        orden: data.orden || 0,
      },
      include: {
        dish: true,
        category: true,
        _count: {
          select: {
            guestDishes: true,
          },
        },
      },
    })

    return this.sanitizeEventDish(eventDish)
  }

  /**
   * Quita un plato del menú
   */
  async removeDishFromMenu(eventId: string, dishId: string): Promise<void> {
    const eventDish = await prisma.eventDish.findUnique({
      where: {
        eventId_dishId: {
          eventId,
          dishId,
        },
      },
      include: {
        _count: {
          select: {
            guestDishes: true,
          },
        },
      },
    })

    if (!eventDish) {
      throw new Error('Este plato no está en el menú del evento')
    }

    // Advertir si tiene asignaciones
    if (eventDish._count.guestDishes > 0) {
      throw new Error(
        `No se puede quitar este plato porque está asignado a ${eventDish._count.guestDishes} invitado(s)`
      )
    }

    await prisma.eventDish.delete({
      where: {
        eventId_dishId: {
          eventId,
          dishId,
        },
      },
    })
  }

  /**
   * Marca un plato como default en su categoría
   * Solo puede haber un default por categoría
   */
  async setDefault(eventId: string, eventDishId: string): Promise<EventDishResponse> {
    // Obtener el eventDish
    const eventDish = await prisma.eventDish.findFirst({
      where: {
        id: eventDishId,
        eventId,
      },
      include: {
        dish: true,
        category: true,
      },
    })

    if (!eventDish) {
      throw new Error('Plato no encontrado en el menú del evento')
    }

    // Quitar default de otros platos de la misma categoría
    await prisma.eventDish.updateMany({
      where: {
        eventId,
        categoryId: eventDish.categoryId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    })

    // Marcar este como default
    const updated = await prisma.eventDish.update({
      where: { id: eventDishId },
      data: { isDefault: true },
      include: {
        dish: true,
        category: true,
        _count: {
          select: {
            guestDishes: true,
          },
        },
      },
    })

    return this.sanitizeEventDish(updated)
  }

  /**
   * Obtiene el menú completo del evento agrupado por categorías
   */
  async getMenu(eventId: string): Promise<MenuResponse> {
    const categories = await prisma.dishCategory.findMany({
      where: {
        OR: [{ eventId }, { eventId: null }], // Categorías del evento o globales
      },
      orderBy: {
        orden: 'asc',
      },
      include: {
        _count: {
          select: {
            eventDishes: true,
          },
        },
      },
    })

    const eventDishes = await prisma.eventDish.findMany({
      where: { eventId },
      include: {
        dish: true,
        category: true,
        _count: {
          select: {
            guestDishes: true,
          },
        },
      },
      orderBy: [{ category: { orden: 'asc' } }, { orden: 'asc' }],
    })

    // Agrupar por categoría
    const grouped = categories.map((cat) => ({
      category: this.sanitizeCategory(cat),
      dishes: eventDishes
        .filter((ed) => ed.categoryId === cat.id)
        .map((ed) => this.sanitizeEventDish(ed)),
    }))

    return {
      categories: grouped,
      totalDishes: eventDishes.length,
      totalCategories: categories.length,
    }
  }

  /**
   * Crea una categoría custom para el evento
   */
  async createCategory(
    eventId: string,
    data: CreateCategoryInput
  ): Promise<DishCategoryResponse> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error('Evento no encontrado')
    }

    // Verificar si ya existe una categoría con ese nombre en el evento
    const existing = await prisma.dishCategory.findUnique({
      where: {
        eventId_nombre: {
          eventId,
          nombre: data.nombre,
        },
      },
    })

    if (existing) {
      throw new Error(`Ya existe una categoría con el nombre: ${data.nombre}`)
    }

    const category = await prisma.dishCategory.create({
      data: {
        eventId,
        nombre: data.nombre,
        orden: data.orden || 0,
        isSystemDefault: false,
      },
      include: {
        _count: {
          select: {
            eventDishes: true,
          },
        },
      },
    })

    return this.sanitizeCategory(category)
  }

  /**
   * Asigna un plato a un invitado
   */
  async assignDishToGuest(
    data: AssignDishToGuestInput,
    userId?: string
  ): Promise<GuestDishResponse> {
    // Verificar que el invitado existe
    const eventGuest = await prisma.eventGuest.findUnique({
      where: { id: data.eventGuestId },
      include: {
        person: true,
      },
    })

    if (!eventGuest) {
      throw new Error('Invitado no encontrado')
    }

    // Verificar que el plato está en el menú del evento
    const eventDish = await prisma.eventDish.findUnique({
      where: { id: data.eventDishId },
      include: {
        dish: true,
      },
    })

    if (!eventDish) {
      throw new Error('Este plato no está en el menú del evento')
    }

    // Verificar que el plato pertenece al mismo evento
    if (eventDish.eventId !== eventGuest.eventId) {
      throw new Error('El plato no pertenece al evento del invitado')
    }

    // Validar restricciones dietarias
    const guestRestrictions = JSON.parse(eventGuest.person.dietaryRestrictions || '[]')
    const dishInfo = JSON.parse(eventDish.dish.dietaryInfo || '[]')

    if (guestRestrictions.length > 0) {
      // Verificar que el plato cumple con TODAS las restricciones del invitado
      const compatible = guestRestrictions.every((restriction: string) =>
        dishInfo.includes(restriction)
      )

      if (!compatible) {
        throw new Error(
          `Este plato no es compatible con las restricciones del invitado: ${guestRestrictions.join(', ')}`
        )
      }
    }

    // Verificar si ya está asignado
    const existing = await prisma.guestDish.findUnique({
      where: {
        eventGuestId_eventDishId: {
          eventGuestId: data.eventGuestId,
          eventDishId: data.eventDishId,
        },
      },
    })

    if (existing) {
      throw new Error('Este plato ya está asignado a este invitado')
    }

    const guestDish = await prisma.guestDish.create({
      data: {
        eventGuestId: data.eventGuestId,
        eventDishId: data.eventDishId,
        assignedBy: userId,
      },
      include: {
        eventDish: {
          include: {
            dish: true,
            category: true,
            _count: {
              select: {
                guestDishes: true,
              },
            },
          },
        },
      },
    })

    return this.sanitizeGuestDish(guestDish)
  }

  /**
   * Quita un plato de un invitado
   */
  async unassignDishFromGuest(guestDishId: string): Promise<void> {
    const guestDish = await prisma.guestDish.findUnique({
      where: { id: guestDishId },
    })

    if (!guestDish) {
      throw new Error('Asignación no encontrada')
    }

    await prisma.guestDish.delete({
      where: { id: guestDishId },
    })
  }

  /**
   * Asigna automáticamente los platos default a todos los invitados sin platos asignados
   */
  async autoAssignDishes(
    eventId: string,
    data: AutoAssignDishesInput,
    userId?: string
  ): Promise<AutoAssignResultResponse> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error('Evento no encontrado')
    }

    // Obtener platos default del menú
    const defaultDishes = await prisma.eventDish.findMany({
      where: {
        eventId,
        isDefault: true,
      },
      include: {
        dish: true,
        category: true,
      },
    })

    if (defaultDishes.length === 0) {
      throw new Error('No hay platos marcados como default en el menú')
    }

    // Obtener invitados
    const guests = await prisma.eventGuest.findMany({
      where: { eventId },
      include: {
        person: true,
        guestDishes: true,
      },
    })

    if (guests.length === 0) {
      throw new Error('No hay invitados en este evento')
    }

    const errors: string[] = []
    const assignments: GuestDishResponse[] = []
    let assigned = 0
    let skipped = 0

    for (const guest of guests) {
      try {
        // Si overwrite=false, solo asignar a invitados sin platos
        if (!data.overwrite && guest.guestDishes.length > 0) {
          skipped++
          continue
        }

        // Si overwrite=true, eliminar asignaciones existentes
        if (data.overwrite && guest.guestDishes.length > 0) {
          await prisma.guestDish.deleteMany({
            where: { eventGuestId: guest.id },
          })
        }

        const guestRestrictions = JSON.parse(guest.person.dietaryRestrictions || '[]')

        // Asignar platos default compatibles
        for (const eventDish of defaultDishes) {
          const dishInfo = JSON.parse(eventDish.dish.dietaryInfo || '[]')

          // Si el invitado tiene restricciones, verificar compatibilidad
          if (guestRestrictions.length > 0) {
            const compatible = guestRestrictions.every((restriction: string) =>
              dishInfo.includes(restriction)
            )

            if (!compatible) {
              continue // Saltar plato incompatible
            }
          }

          // Asignar plato
          const guestDish = await prisma.guestDish.create({
            data: {
              eventGuestId: guest.id,
              eventDishId: eventDish.id,
              assignedBy: null, // null = automático
            },
            include: {
              eventDish: {
                include: {
                  dish: true,
                  category: true,
                  _count: {
                    select: {
                      guestDishes: true,
                    },
                  },
                },
              },
            },
          })

          assignments.push(this.sanitizeGuestDish(guestDish))
          assigned++
        }
      } catch (error: any) {
        errors.push(
          `Error con ${guest.person.nombre} ${guest.person.apellido}: ${error.message}`
        )
        skipped++
      }
    }

    return {
      success: errors.length === 0,
      assigned,
      skipped,
      errors,
      assignments,
    }
  }

  /**
   * Obtiene los platos asignados a un invitado
   */
  async getGuestMenu(eventGuestId: string): Promise<GuestMenuResponse> {
    const eventGuest = await prisma.eventGuest.findUnique({
      where: { id: eventGuestId },
      include: {
        person: true,
        guestDishes: {
          include: {
            eventDish: {
              include: {
                dish: true,
                category: true,
                _count: {
                  select: {
                    guestDishes: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!eventGuest) {
      throw new Error('Invitado no encontrado')
    }

    return {
      eventGuestId: eventGuest.id,
      guestName: `${eventGuest.person.nombre} ${eventGuest.person.apellido}`,
      dishes: eventGuest.guestDishes.map((gd) => this.sanitizeGuestDish(gd)),
      totalDishes: eventGuest.guestDishes.length,
    }
  }

  /**
   * Dashboard de alertas: detecta problemas con restricciones alimentarias
   */
  async getAlerts(eventId: string): Promise<MenuAlertsResponse> {
    const alerts: MenuAlert[] = []

    // Obtener invitados con restricciones
    const guests = await prisma.eventGuest.findMany({
      where: { eventId },
      include: {
        person: true,
        guestDishes: {
          include: {
            eventDish: {
              include: {
                dish: true,
              },
            },
          },
        },
      },
    })

    // Obtener platos del menú
    const menuDishes = await prisma.eventDish.findMany({
      where: { eventId },
      include: {
        dish: true,
      },
    })

    for (const guest of guests) {
      const restrictions = JSON.parse(guest.person.dietaryRestrictions || '[]')
      const guestName = `${guest.person.nombre} ${guest.person.apellido}`

      if (restrictions.length === 0) {
        continue // Sin restricciones, sin problemas
      }

      for (const restriction of restrictions) {
        // Buscar platos compatibles en el menú
        const compatibleDishes = menuDishes.filter((ed) => {
          const dishInfo = JSON.parse(ed.dish.dietaryInfo || '[]')
          return dishInfo.includes(restriction)
        })

        // Alerta 1: No hay platos compatibles en el menú
        if (compatibleDishes.length === 0) {
          alerts.push({
            type: 'MISSING_COMPATIBLE_DISH',
            severity: 'HIGH',
            eventGuestId: guest.id,
            guestName,
            restriction,
            message: `No hay platos con ${restriction} en el menú para ${guestName}`,
          })
          continue
        }

        // Alerta 2: No tiene platos asignados
        if (guest.guestDishes.length === 0) {
          alerts.push({
            type: 'NO_DISH_ASSIGNED',
            severity: 'MEDIUM',
            eventGuestId: guest.id,
            guestName,
            restriction,
            message: `${guestName} no tiene platos asignados (requiere ${restriction})`,
            suggestedDishes: compatibleDishes.map((cd) => cd.id),
          })
          continue
        }

        // Alerta 3: Tiene platos asignados pero no son compatibles
        const hasCompatibleDish = guest.guestDishes.some((gd) => {
          const dishInfo = JSON.parse(gd.eventDish.dish.dietaryInfo || '[]')
          return dishInfo.includes(restriction)
        })

        if (!hasCompatibleDish) {
          alerts.push({
            type: 'INCOMPATIBLE_DISH',
            severity: 'HIGH',
            eventGuestId: guest.id,
            guestName,
            restriction,
            message: `${guestName} tiene platos asignados que no son ${restriction}`,
            suggestedDishes: compatibleDishes.map((cd) => cd.id),
          })
        }
      }
    }

    // Calcular estadísticas
    const highSeverity = alerts.filter((a) => a.severity === 'HIGH').length
    const mediumSeverity = alerts.filter((a) => a.severity === 'MEDIUM').length
    const lowSeverity = alerts.filter((a) => a.severity === 'LOW').length
    const guestsWithIssues = new Set(alerts.map((a) => a.eventGuestId)).size

    return {
      alerts,
      totalAlerts: alerts.length,
      highSeverity,
      mediumSeverity,
      lowSeverity,
      guestsWithIssues,
    }
  }
}
