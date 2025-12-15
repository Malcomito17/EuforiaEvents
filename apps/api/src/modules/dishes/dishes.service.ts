import { PrismaClient } from '@prisma/client'
import type {
  DishCreateInput,
  DishUpdateInput,
  DishResponse,
  DishListResponse,
  DietaryInfo,
} from './dishes.types'

const prisma = new PrismaClient()

export class DishesService {
  /**
   * Sanitiza un Dish a Response format
   */
  private sanitizeDish(dish: any): DishResponse {
    return {
      id: dish.id,
      nombre: dish.nombre,
      descripcion: dish.descripcion,
      dietaryInfo: JSON.parse(dish.dietaryInfo || '[]') as DietaryInfo[],
      isActive: dish.isActive,
      createdAt: dish.createdAt.toISOString(),
      updatedAt: dish.updatedAt.toISOString(),
      createdBy: dish.createdBy,
      _count: dish._count,
    }
  }

  /**
   * Crea un nuevo plato
   */
  async create(data: DishCreateInput, userId?: string): Promise<DishResponse> {
    // Verificar si ya existe un plato con el mismo nombre (activo)
    const existing = await prisma.dish.findFirst({
      where: {
        nombre: data.nombre,
        isActive: true,
      },
    })

    if (existing) {
      throw new Error(`Ya existe un plato activo con el nombre: ${data.nombre}`)
    }

    const dish = await prisma.dish.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        dietaryInfo: JSON.stringify(data.dietaryInfo || []),
        createdBy: userId,
      },
    })

    return this.sanitizeDish(dish)
  }

  /**
   * Obtiene un plato por ID
   */
  async getById(dishId: string): Promise<DishResponse> {
    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
      include: {
        _count: {
          select: {
            eventDishes: true,
          },
        },
      },
    })

    if (!dish) {
      throw new Error('Plato no encontrado')
    }

    return this.sanitizeDish(dish)
  }

  /**
   * Lista todos los platos
   */
  async listAll(options?: {
    includeInactive?: boolean
    search?: string
  }): Promise<DishListResponse> {
    const { includeInactive = false, search } = options || {}

    const where: any = {}

    // Filtro de activos/inactivos
    if (!includeInactive) {
      where.isActive = true
    }

    // Búsqueda por nombre (SQLite no soporta mode: insensitive)
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { nombre: { contains: search.toLowerCase() } },
      ]
    }

    const [dishes, total, activeCount, inactiveCount] = await Promise.all([
      prisma.dish.findMany({
        where,
        include: {
          _count: {
            select: {
              eventDishes: true,
            },
          },
        },
        orderBy: {
          nombre: 'asc',
        },
      }),
      prisma.dish.count({ where }),
      prisma.dish.count({ where: { isActive: true } }),
      prisma.dish.count({ where: { isActive: false } }),
    ])

    return {
      dishes: dishes.map((d) => this.sanitizeDish(d)),
      total,
      activeCount,
      inactiveCount,
    }
  }

  /**
   * Actualiza un plato
   */
  async update(dishId: string, data: DishUpdateInput): Promise<DishResponse> {
    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
    })

    if (!dish) {
      throw new Error('Plato no encontrado')
    }

    // Si se está cambiando el nombre, verificar que no exista otro activo con ese nombre
    if (data.nombre && data.nombre !== dish.nombre) {
      const existing = await prisma.dish.findFirst({
        where: {
          nombre: data.nombre,
          isActive: true,
          id: { not: dishId },
        },
      })

      if (existing) {
        throw new Error(`Ya existe un plato activo con el nombre: ${data.nombre}`)
      }
    }

    const updated = await prisma.dish.update({
      where: { id: dishId },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion !== undefined ? data.descripcion : undefined,
        dietaryInfo: data.dietaryInfo ? JSON.stringify(data.dietaryInfo) : undefined,
        isActive: data.isActive,
      },
      include: {
        _count: {
          select: {
            eventDishes: true,
          },
        },
      },
    })

    return this.sanitizeDish(updated)
  }

  /**
   * Elimina un plato (soft delete)
   * Lo marca como inactivo en lugar de eliminarlo
   */
  async delete(dishId: string): Promise<void> {
    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
      include: {
        _count: {
          select: {
            eventDishes: true,
          },
        },
      },
    })

    if (!dish) {
      throw new Error('Plato no encontrado')
    }

    // Verificar si está siendo usado en eventos activos
    if (dish._count.eventDishes > 0) {
      // Solo desactivar, no eliminar
      await prisma.dish.update({
        where: { id: dishId },
        data: { isActive: false },
      })
    } else {
      // Si no está en uso, se puede desactivar sin problema
      await prisma.dish.update({
        where: { id: dishId },
        data: { isActive: false },
      })
    }
  }

  /**
   * Busca platos por nombre (SQLite no soporta mode: insensitive)
   */
  async search(query: string): Promise<DishResponse[]> {
    const lowerQuery = query.toLowerCase()

    const dishes = await prisma.dish.findMany({
      where: {
        OR: [
          { nombre: { contains: query } },
          { nombre: { contains: lowerQuery } },
        ],
        isActive: true,
      },
      include: {
        _count: {
          select: {
            eventDishes: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
      take: 20,
    })

    return dishes.map((d) => this.sanitizeDish(d))
  }
}
