import { PrismaClient } from '@prisma/client'
import type {
  MesaCreateInput,
  MesaUpdateInput,
  AutoAssignMesasInput,
  MesaResponse,
  MesaListResponse,
  AutoAssignResultResponse,
  Forma,
} from './mesas.types'

const prisma = new PrismaClient()

export class MesasService {
  /**
   * Sanitiza Mesa a Response
   */
  private sanitizeMesa(mesa: any): MesaResponse {
    return {
      id: mesa.id,
      eventId: mesa.eventId,
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      forma: mesa.forma as Forma,
      sector: mesa.sector,
      posX: mesa.posX,
      posY: mesa.posY,
      rotation: mesa.rotation || 0,
      observaciones: mesa.observaciones,
      createdAt: mesa.createdAt.toISOString(),
      updatedAt: mesa.updatedAt.toISOString(),
      createdBy: mesa.createdBy,
      _count: mesa._count,
      invitados: mesa.invitados?.map((inv: any) => ({
        id: inv.id,
        personId: inv.personId,
        estadoIngreso: inv.estadoIngreso,
        person: {
          nombre: inv.person.nombre,
          apellido: inv.person.apellido,
        },
      })),
    }
  }

  /**
   * Crea una nueva mesa
   */
  async create(eventId: string, data: MesaCreateInput, userId?: string): Promise<MesaResponse> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error('Evento no encontrado')
    }

    // Verificar que no exista una mesa con el mismo número en el evento
    const existing = await prisma.mesa.findUnique({
      where: {
        eventId_numero: {
          eventId,
          numero: data.numero,
        },
      },
    })

    if (existing) {
      throw new Error(`Ya existe una mesa con el número: ${data.numero}`)
    }

    const mesa = await prisma.mesa.create({
      data: {
        eventId,
        numero: data.numero,
        capacidad: data.capacidad,
        forma: data.forma || 'REDONDA',
        sector: data.sector || null,
        posX: data.posX || null,
        posY: data.posY || null,
        rotation: data.rotation || 0,
        observaciones: data.observaciones || null,
        createdBy: userId,
      },
      include: {
        _count: {
          select: {
            invitados: true,
          },
        },
      },
    })

    return this.sanitizeMesa(mesa)
  }

  /**
   * Obtiene una mesa por ID
   */
  async getById(mesaId: string, includeGuests: boolean = false): Promise<MesaResponse> {
    const mesa = await prisma.mesa.findUnique({
      where: { id: mesaId },
      include: {
        _count: {
          select: {
            invitados: true,
          },
        },
        invitados: includeGuests
          ? {
              include: {
                person: true,
              },
            }
          : false,
      },
    })

    if (!mesa) {
      throw new Error('Mesa no encontrada')
    }

    return this.sanitizeMesa(mesa)
  }

  /**
   * Lista todas las mesas del evento con estadísticas
   */
  async listAll(eventId: string, includeGuests: boolean = false): Promise<MesaListResponse> {
    const [mesas, capacidadTotal, invitadosAsignados, invitadosSinMesa] = await Promise.all([
      prisma.mesa.findMany({
        where: { eventId },
        include: {
          _count: {
            select: {
              invitados: true,
            },
          },
          invitados: includeGuests
            ? {
                include: {
                  person: true,
                },
              }
            : false,
        },
        orderBy: {
          numero: 'asc',
        },
      }),
      prisma.mesa.aggregate({
        where: { eventId },
        _sum: {
          capacidad: true,
        },
      }),
      prisma.eventGuest.count({
        where: {
          eventId,
          mesaId: { not: null },
        },
      }),
      prisma.eventGuest.count({
        where: {
          eventId,
          mesaId: null,
        },
      }),
    ])

    const ocupadas = mesas.filter((m) => m._count.invitados > 0).length
    const disponibles = mesas.filter((m) => m._count.invitados === 0).length

    return {
      mesas: mesas.map((m) => this.sanitizeMesa(m)),
      total: mesas.length,
      ocupadas,
      disponibles,
      capacidadTotal: capacidadTotal._sum.capacidad || 0,
      invitadosAsignados,
      invitadosSinMesa,
    }
  }

  /**
   * Actualiza una mesa
   */
  async update(mesaId: string, data: MesaUpdateInput): Promise<MesaResponse> {
    const mesa = await prisma.mesa.findUnique({
      where: { id: mesaId },
    })

    if (!mesa) {
      throw new Error('Mesa no encontrada')
    }

    // Si se está cambiando el número, verificar que no exista otro con ese número
    if (data.numero && data.numero !== mesa.numero) {
      const existing = await prisma.mesa.findUnique({
        where: {
          eventId_numero: {
            eventId: mesa.eventId,
            numero: data.numero,
          },
        },
      })

      if (existing) {
        throw new Error(`Ya existe una mesa con el número: ${data.numero}`)
      }
    }

    // Si se está reduciendo la capacidad, verificar que no haya más invitados asignados
    if (data.capacidad !== undefined) {
      const invitadosCount = await prisma.eventGuest.count({
        where: { mesaId },
      })

      if (invitadosCount > data.capacidad) {
        throw new Error(
          `No se puede reducir la capacidad a ${data.capacidad} porque hay ${invitadosCount} invitados asignados`
        )
      }
    }

    const updated = await prisma.mesa.update({
      where: { id: mesaId },
      data: {
        numero: data.numero,
        capacidad: data.capacidad,
        forma: data.forma,
        sector: data.sector !== undefined ? data.sector : undefined,
        posX: data.posX !== undefined ? data.posX : undefined,
        posY: data.posY !== undefined ? data.posY : undefined,
        rotation: data.rotation !== undefined ? data.rotation : undefined,
        observaciones: data.observaciones !== undefined ? data.observaciones : undefined,
      },
      include: {
        _count: {
          select: {
            invitados: true,
          },
        },
      },
    })

    return this.sanitizeMesa(updated)
  }

  /**
   * Elimina una mesa
   */
  async delete(mesaId: string): Promise<void> {
    const mesa = await prisma.mesa.findUnique({
      where: { id: mesaId },
      include: {
        _count: {
          select: {
            invitados: true,
          },
        },
      },
    })

    if (!mesa) {
      throw new Error('Mesa no encontrada')
    }

    if (mesa._count.invitados > 0) {
      throw new Error(
        `No se puede eliminar esta mesa porque tiene ${mesa._count.invitados} invitado(s) asignado(s)`
      )
    }

    await prisma.mesa.delete({
      where: { id: mesaId },
    })
  }

  /**
   * Auto-asignación de invitados a mesas
   */
  async autoAssign(
    eventId: string,
    data: AutoAssignMesasInput
  ): Promise<AutoAssignResultResponse> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error('Evento no encontrado')
    }

    // Obtener invitados sin mesa
    const guestsSinMesa = await prisma.eventGuest.findMany({
      where: {
        eventId,
        mesaId: null,
      },
      include: {
        person: true,
      },
    })

    if (guestsSinMesa.length === 0) {
      return {
        success: true,
        assigned: 0,
        skipped: 0,
        errors: [],
        mesasUpdated: [],
      }
    }

    // Obtener mesas ordenadas por número
    const mesas = await prisma.mesa.findMany({
      where: { eventId },
      include: {
        _count: {
          select: {
            invitados: true,
          },
        },
      },
      orderBy: {
        numero: 'asc',
      },
    })

    if (mesas.length === 0) {
      throw new Error('No hay mesas disponibles para asignar')
    }

    const errors: string[] = []
    const mesasUpdated = new Set<string>()
    let assigned = 0
    let skipped = 0

    if (data.strategy === 'FILL_FIRST') {
      // Estrategia: Llenar cada mesa completamente antes de pasar a la siguiente
      let guestIndex = 0

      for (const mesa of mesas) {
        const espacioDisponible = mesa.capacidad - mesa._count.invitados

        if (espacioDisponible <= 0) {
          continue
        }

        const guestsToAssign = guestsSinMesa.slice(guestIndex, guestIndex + espacioDisponible)

        for (const guest of guestsToAssign) {
          try {
            await prisma.eventGuest.update({
              where: { id: guest.id },
              data: { mesaId: mesa.id },
            })
            mesasUpdated.add(mesa.id)
            assigned++
          } catch (error: any) {
            errors.push(
              `Error asignando ${guest.person.nombre} ${guest.person.apellido}: ${error.message}`
            )
            skipped++
          }
        }

        guestIndex += guestsToAssign.length

        if (guestIndex >= guestsSinMesa.length) {
          break
        }
      }

      // Advertir si quedaron invitados sin asignar
      if (guestIndex < guestsSinMesa.length) {
        errors.push(
          `${guestsSinMesa.length - guestIndex} invitado(s) no pudieron ser asignados por falta de espacio`
        )
        skipped += guestsSinMesa.length - guestIndex
      }
    } else {
      // Estrategia: Distribuir uniformemente entre todas las mesas
      const mesasConEspacio = mesas.filter(
        (m) => m._count.invitados < m.capacidad
      )

      if (mesasConEspacio.length === 0) {
        throw new Error('Todas las mesas están llenas')
      }

      let mesaIndex = 0

      for (const guest of guestsSinMesa) {
        let asignado = false

        // Intentar asignar a una mesa con espacio
        for (let i = 0; i < mesasConEspacio.length; i++) {
          const mesa = mesasConEspacio[(mesaIndex + i) % mesasConEspacio.length]

          // Verificar espacio disponible
          const invitadosActuales = await prisma.eventGuest.count({
            where: { mesaId: mesa.id },
          })

          if (invitadosActuales < mesa.capacidad) {
            try {
              await prisma.eventGuest.update({
                where: { id: guest.id },
                data: { mesaId: mesa.id },
              })
              mesasUpdated.add(mesa.id)
              assigned++
              asignado = true
              mesaIndex = (mesaIndex + 1) % mesasConEspacio.length
              break
            } catch (error: any) {
              errors.push(
                `Error asignando ${guest.person.nombre} ${guest.person.apellido}: ${error.message}`
              )
            }
          }
        }

        if (!asignado) {
          skipped++
          errors.push(
            `No se pudo asignar a ${guest.person.nombre} ${guest.person.apellido}: sin espacio disponible`
          )
        }
      }
    }

    return {
      success: errors.length === 0,
      assigned,
      skipped,
      errors,
      mesasUpdated: Array.from(mesasUpdated),
    }
  }
}
