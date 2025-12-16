import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import type {
  EventGuestCreateInput,
  EventGuestUpdateInput,
  EventGuestResponse,
  GuestlistStatsResponse,
  CSVGuestInput,
  ImportResultResponse,
  EstadoIngreso,
  Accesibilidad,
} from './event-guests.types'

const prisma = new PrismaClient()

export class EventGuestsService {
  /**
   * Sanitiza un EventGuest a Response format
   */
  private sanitizeGuest(guest: any): EventGuestResponse {
    return {
      id: guest.id,
      eventId: guest.eventId,
      personId: guest.personId,
      mesaId: guest.mesaId,
      estadoIngreso: guest.estadoIngreso as EstadoIngreso,
      checkedInAt: guest.checkedInAt?.toISOString() || null,
      checkedInBy: guest.checkedInBy,
      checkedOutAt: guest.checkedOutAt?.toISOString() || null,
      checkedOutBy: guest.checkedOutBy,
      observaciones: guest.observaciones,
      accesibilidad: guest.accesibilidad as Accesibilidad | null,
      isImportante: guest.isImportante || false,
      isDestacado: guest.isDestacado || false,
      createdAt: guest.createdAt.toISOString(),
      updatedAt: guest.updatedAt.toISOString(),
      addedBy: guest.addedBy,
      person: guest.person
        ? {
            id: guest.person.id,
            nombre: guest.person.nombre,
            apellido: guest.person.apellido,
            email: guest.person.email,
            phone: guest.person.phone,
            company: guest.person.company,
            dietaryRestrictions: JSON.parse(guest.person.dietaryRestrictions || '[]'),
          }
        : undefined,
      mesa: guest.mesa
        ? {
            id: guest.mesa.id,
            numero: guest.mesa.numero,
            capacidad: guest.mesa.capacidad,
            forma: guest.mesa.forma,
          }
        : undefined,
      assignedDishes: guest.guestDishes
        ? guest.guestDishes.map((gd: any) => ({
            id: gd.id,
            eventDishId: gd.eventDishId,
            dish: gd.eventDish?.dish
              ? {
                  id: gd.eventDish.dish.id,
                  nombre: gd.eventDish.dish.nombre,
                  categoria: gd.eventDish.dish.categoria || 'PRINCIPAL',
                }
              : undefined,
          }))
        : [],
    }
  }

  /**
   * Valida el token de check-in para un evento
   */
  async validateCheckinToken(eventId: string, token: string): Promise<boolean> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { checkinAccessToken: true },
    })

    if (!event || !event.checkinAccessToken) {
      return false
    }

    return event.checkinAccessToken === token
  }

  /**
   * Agrega un invitado a la guestlist del evento
   */
  async addGuest(
    eventId: string,
    data: EventGuestCreateInput,
    userId?: string
  ): Promise<EventGuestResponse> {
    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error('Evento no encontrado')
    }

    // Verificar que la persona existe
    const person = await prisma.person.findUnique({
      where: { id: data.personId },
    })

    if (!person) {
      throw new Error('Persona no encontrada')
    }

    // Verificar que no esté ya en la guestlist
    const existing = await prisma.eventGuest.findUnique({
      where: {
        eventId_personId: {
          eventId,
          personId: data.personId,
        },
      },
    })

    if (existing) {
      throw new Error(`${person.nombre} ${person.apellido} ya está en la lista de invitados`)
    }

    // Si se especificó mesa, verificar que existe y pertenece al evento
    if (data.mesaId) {
      const mesa = await prisma.mesa.findFirst({
        where: {
          id: data.mesaId,
          eventId,
        },
      })

      if (!mesa) {
        throw new Error('Mesa no encontrada o no pertenece a este evento')
      }
    }

    // Crear el EventGuest
    const eventGuest = await prisma.eventGuest.create({
      data: {
        eventId,
        personId: data.personId,
        mesaId: data.mesaId || null,
        observaciones: data.observaciones || null,
        accesibilidad: data.accesibilidad || 'NINGUNA',
        isImportante: data.isImportante || false,
        isDestacado: data.isDestacado || false,
        addedBy: userId,
      },
      include: {
        person: true,
        mesa: true,
      },
    })

    return this.sanitizeGuest(eventGuest)
  }

  /**
   * Quita un invitado de la guestlist
   */
  async removeGuest(eventGuestId: string): Promise<void> {
    const eventGuest = await prisma.eventGuest.findUnique({
      where: { id: eventGuestId },
    })

    if (!eventGuest) {
      throw new Error('Invitado no encontrado en la lista')
    }

    await prisma.eventGuest.delete({
      where: { id: eventGuestId },
    })
  }

  /**
   * Actualiza datos de un invitado
   */
  async updateGuest(
    eventGuestId: string,
    data: EventGuestUpdateInput
  ): Promise<EventGuestResponse> {
    const eventGuest = await prisma.eventGuest.findUnique({
      where: { id: eventGuestId },
      include: { event: true },
    })

    if (!eventGuest) {
      throw new Error('Invitado no encontrado')
    }

    // Si se especificó mesa, verificar que existe y pertenece al evento
    if (data.mesaId !== undefined) {
      if (data.mesaId) {
        const mesa = await prisma.mesa.findFirst({
          where: {
            id: data.mesaId,
            eventId: eventGuest.eventId,
          },
        })

        if (!mesa) {
          throw new Error('Mesa no encontrada o no pertenece a este evento')
        }
      }
    }

    const updated = await prisma.eventGuest.update({
      where: { id: eventGuestId },
      data: {
        mesaId: data.mesaId !== undefined ? data.mesaId : undefined,
        estadoIngreso: data.estadoIngreso,
        observaciones: data.observaciones !== undefined ? data.observaciones : undefined,
        accesibilidad: data.accesibilidad,
        isImportante: data.isImportante !== undefined ? data.isImportante : undefined,
        isDestacado: data.isDestacado !== undefined ? data.isDestacado : undefined,
      },
      include: {
        person: true,
        mesa: true,
      },
    })

    return this.sanitizeGuest(updated)
  }

  /**
   * Obtiene un invitado específico por ID
   */
  async getGuest(eventId: string, guestId: string): Promise<EventGuestResponse> {
    const guest = await prisma.eventGuest.findFirst({
      where: {
        id: guestId,
        eventId,
      },
      include: {
        person: true,
        mesa: true,
        guestDishes: {
          include: {
            eventDish: {
              include: {
                dish: true,
                category: true,
              },
            },
          },
        },
      },
    })

    if (!guest) {
      throw new Error('Invitado no encontrado')
    }

    return this.sanitizeGuest(guest)
  }

  /**
   * Obtiene la guestlist completa del evento
   */
  async getGuestlist(eventId: string): Promise<EventGuestResponse[]> {
    const guests = await prisma.eventGuest.findMany({
      where: { eventId },
      include: {
        person: true,
        mesa: true,
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
      orderBy: [{ person: { apellido: 'asc' } }, { person: { nombre: 'asc' } }],
    })

    return guests.map((g) => this.sanitizeGuest(g))
  }

  /**
   * Marca el check-in de un invitado
   * Si la persona tiene email, busca un Participant con ese email y lo enlaza automáticamente
   */
  async checkIn(eventGuestId: string, userId?: string): Promise<EventGuestResponse> {
    const eventGuest = await prisma.eventGuest.findUnique({
      where: { id: eventGuestId },
      include: {
        person: true,
        event: true,
      },
    })

    if (!eventGuest) {
      throw new Error('Invitado no encontrado')
    }

    if (eventGuest.estadoIngreso === 'INGRESADO') {
      throw new Error('El invitado ya tiene check-in registrado')
    }

    // Auto-enlace con Participant si tiene email
    if (eventGuest.person.email && !eventGuest.person.participantId) {
      const participant = await prisma.participant.findFirst({
        where: {
          email: eventGuest.person.email,
        },
      })

      if (participant) {
        // Enlazar Person con Participant
        await prisma.person.update({
          where: { id: eventGuest.personId },
          data: { participantId: participant.id },
        })
      }
    }

    // Registrar check-in
    const updated = await prisma.eventGuest.update({
      where: { id: eventGuestId },
      data: {
        estadoIngreso: 'INGRESADO',
        checkedInAt: new Date(),
        checkedInBy: userId,
      },
      include: {
        person: true,
        mesa: true,
      },
    })

    return this.sanitizeGuest(updated)
  }

  /**
   * Marca el check-out de un invitado
   * Solo permitido si el evento tiene requiereCheckout = true
   */
  async checkOut(eventGuestId: string, userId?: string): Promise<EventGuestResponse> {
    const eventGuest = await prisma.eventGuest.findUnique({
      where: { id: eventGuestId },
      include: {
        event: true,
        person: true,
        mesa: true,
      },
    })

    if (!eventGuest) {
      throw new Error('Invitado no encontrado')
    }

    if (!eventGuest.event.requiereCheckout) {
      throw new Error('Este evento no requiere check-out')
    }

    if (eventGuest.estadoIngreso !== 'INGRESADO') {
      throw new Error('El invitado debe tener check-in registrado antes de hacer check-out')
    }

    if (eventGuest.checkedOutAt) {
      throw new Error('El invitado ya tiene check-out registrado')
    }

    const updated = await prisma.eventGuest.update({
      where: { id: eventGuestId },
      data: {
        checkedOutAt: new Date(),
        checkedOutBy: userId,
      },
      include: {
        person: true,
        mesa: true,
      },
    })

    return this.sanitizeGuest(updated)
  }

  /**
   * Obtiene estadísticas de la guestlist
   */
  async getStats(eventId: string): Promise<GuestlistStatsResponse> {
    const guests = await prisma.eventGuest.findMany({
      where: { eventId },
    })

    const total = guests.length
    const ingresados = guests.filter((g) => g.estadoIngreso === 'INGRESADO').length
    const pendientes = guests.filter((g) => g.estadoIngreso === 'PENDIENTE').length
    const noAsistieron = guests.filter((g) => g.estadoIngreso === 'NO_ASISTIO').length
    const conMesaAsignada = guests.filter((g) => g.mesaId !== null).length
    const sinMesaAsignada = guests.filter((g) => g.mesaId === null).length

    const porcentajeAsistencia = total > 0 ? Math.round((ingresados / total) * 100) : 0

    return {
      total,
      ingresados,
      pendientes,
      noAsistieron,
      porcentajeAsistencia,
      conMesaAsignada,
      sinMesaAsignada,
    }
  }

  /**
   * Importa una lista de invitados desde CSV
   * Crea personas que no existen y las agrega a la guestlist
   */
  async importCSV(
    eventId: string,
    guests: CSVGuestInput[],
    userId?: string
  ): Promise<ImportResultResponse> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { mesas: true },
    })

    if (!event) {
      throw new Error('Evento no encontrado')
    }

    const errors: string[] = []
    const imported: EventGuestResponse[] = []
    let skipped = 0

    for (const guestData of guests) {
      try {
        // Generar identityHash
        const identityHash = this.generateIdentityHash(
          guestData.email,
          guestData.nombre,
          guestData.apellido
        )

        // Buscar o crear Person
        let person = await prisma.person.findFirst({
          where: { identityHash },
        })

        if (!person) {
          // Crear nueva persona
          person = await prisma.person.create({
            data: {
              nombre: guestData.nombre,
              apellido: guestData.apellido,
              email: guestData.email || null,
              phone: guestData.phone || null,
              company: guestData.company || null,
              dietaryRestrictions: JSON.stringify(guestData.dietaryRestrictions || []),
              identityHash,
              createdBy: userId,
            },
          })
        }

        // Buscar mesa por número si se especificó
        let mesaId: string | null = null
        if (guestData.mesaNumero) {
          const mesa = event.mesas.find((m) => m.numero === guestData.mesaNumero)
          if (mesa) {
            mesaId = mesa.id
          } else {
            errors.push(
              `Mesa "${guestData.mesaNumero}" no encontrada para ${guestData.nombre} ${guestData.apellido}`
            )
          }
        }

        // Verificar si ya está en la guestlist
        const existing = await prisma.eventGuest.findUnique({
          where: {
            eventId_personId: {
              eventId,
              personId: person.id,
            },
          },
        })

        if (existing) {
          skipped++
          errors.push(`${guestData.nombre} ${guestData.apellido} ya está en la lista`)
          continue
        }

        // Crear EventGuest
        const eventGuest = await prisma.eventGuest.create({
          data: {
            eventId,
            personId: person.id,
            mesaId,
            observaciones: guestData.observaciones || null,
            accesibilidad: guestData.accesibilidad || 'NINGUNA',
            addedBy: userId,
          },
          include: {
            person: true,
            mesa: true,
          },
        })

        imported.push(this.sanitizeGuest(eventGuest))
      } catch (error: any) {
        errors.push(
          `Error con ${guestData.nombre} ${guestData.apellido}: ${error.message}`
        )
        skipped++
      }
    }

    return {
      success: errors.length === 0,
      imported: imported.length,
      skipped,
      errors,
      guests: imported,
    }
  }

  /**
   * Genera el hash de identidad para una persona
   */
  private generateIdentityHash(
    email: string | undefined,
    nombre: string,
    apellido: string
  ): string {
    const normalized = `${email?.toLowerCase().trim() || ''}${nombre.toLowerCase().trim()}${apellido.toLowerCase().trim()}`
    return crypto.createHash('sha256').update(normalized).digest('hex')
  }
}
