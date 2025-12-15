import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import type { PersonCreateInput, PersonUpdateInput, PersonResponse } from './persons.types'

const prisma = new PrismaClient()

export class PersonsService {
  /**
   * Genera el hash de identidad para una persona
   * SHA256(email + nombre + apellido)
   */
  private generateIdentityHash(email: string | null | undefined, nombre: string, apellido: string): string {
    const normalized = `${email?.toLowerCase().trim() || ''}${nombre.toLowerCase().trim()}${apellido.toLowerCase().trim()}`
    return crypto.createHash('sha256').update(normalized).digest('hex')
  }

  /**
   * Crea una nueva persona
   */
  async create(data: PersonCreateInput, userId?: string): Promise<PersonResponse> {
    // Generar identityHash
    const identityHash = this.generateIdentityHash(data.email, data.nombre, data.apellido)

    // Verificar si existe una persona con el mismo identityHash
    const existing = await prisma.person.findFirst({
      where: { identityHash },
    })

    if (existing) {
      throw new Error(`Ya existe una persona con el mismo nombre y email: ${existing.nombre} ${existing.apellido}`)
    }

    const person = await prisma.person.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        dietaryRestrictions: JSON.stringify(data.dietaryRestrictions || []),
        identityHash,
        createdBy: userId,
      },
    })

    return this.sanitizePerson(person)
  }

  /**
   * Obtiene una persona por ID
   */
  async getById(personId: string): Promise<PersonResponse | null> {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        participant: true,
      },
    })

    return person ? this.sanitizePerson(person) : null
  }

  /**
   * Obtiene una persona por email
   */
  async getByEmail(email: string): Promise<PersonResponse | null> {
    const person = await prisma.person.findUnique({
      where: { email },
      include: {
        participant: true,
      },
    })

    return person ? this.sanitizePerson(person) : null
  }

  /**
   * Busca personas por nombre o apellido
   * Nota: SQLite no soporta mode: 'insensitive', usamos LOWER() via raw query
   */
  async search(query: string): Promise<PersonResponse[]> {
    const lowerQuery = query.toLowerCase()

    const persons = await prisma.person.findMany({
      where: {
        OR: [
          { nombre: { contains: lowerQuery } },
          { apellido: { contains: lowerQuery } },
          { email: { contains: lowerQuery } },
          // También buscar con la query original para matches exactos
          { nombre: { contains: query } },
          { apellido: { contains: query } },
          { email: { contains: query } },
        ],
      },
      include: {
        participant: true,
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
      take: 50,
    })

    return persons.map(p => this.sanitizePerson(p))
  }

  /**
   * Lista todas las personas
   */
  async listAll(limit: number = 100, offset: number = 0): Promise<{ persons: PersonResponse[]; total: number }> {
    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        include: {
          participant: true,
        },
        orderBy: [
          { apellido: 'asc' },
          { nombre: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.person.count(),
    ])

    return {
      persons: persons.map(p => this.sanitizePerson(p)),
      total,
    }
  }

  /**
   * Actualiza una persona
   */
  async update(personId: string, data: PersonUpdateInput, userId?: string): Promise<PersonResponse> {
    // Verificar que existe
    const existing = await prisma.person.findUnique({
      where: { id: personId },
    })

    if (!existing) {
      throw new Error('Persona no encontrada')
    }

    // Si se actualiza el nombre/apellido/email, regenerar identityHash
    let identityHash = existing.identityHash
    if (data.nombre || data.apellido || data.email !== undefined) {
      const nombre = data.nombre || existing.nombre
      const apellido = data.apellido || existing.apellido
      const email = data.email !== undefined ? data.email : existing.email
      identityHash = this.generateIdentityHash(email, nombre, apellido)

      // Verificar si ya existe otra persona con el mismo hash
      const duplicate = await prisma.person.findFirst({
        where: {
          identityHash,
          id: { not: personId },
        },
      })

      if (duplicate) {
        throw new Error(`Ya existe otra persona con el mismo nombre y email: ${duplicate.nombre} ${duplicate.apellido}`)
      }
    }

    const person = await prisma.person.update({
      where: { id: personId },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email !== undefined ? (data.email || null) : undefined,
        phone: data.phone !== undefined ? (data.phone || null) : undefined,
        company: data.company !== undefined ? (data.company || null) : undefined,
        dietaryRestrictions: data.dietaryRestrictions ? JSON.stringify(data.dietaryRestrictions) : undefined,
        identityHash,
      },
      include: {
        participant: true,
      },
    })

    return this.sanitizePerson(person)
  }

  /**
   * Elimina una persona
   * Solo si no está asociada a ningún evento
   */
  async delete(personId: string): Promise<{ message: string; person: PersonResponse }> {
    // Verificar que existe
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        eventGuests: true,
      },
    })

    if (!person) {
      throw new Error('Persona no encontrada')
    }

    // Verificar que no esté asociada a eventos
    if (person.eventGuests.length > 0) {
      throw new Error(`No se puede eliminar la persona porque está asociada a ${person.eventGuests.length} evento(s)`)
    }

    // Eliminar persona
    await prisma.person.delete({
      where: { id: personId },
    })

    console.log(`[PERSONS] Persona eliminada: ${personId} (${person.nombre} ${person.apellido})`)

    return {
      message: 'Persona eliminada correctamente',
      person: this.sanitizePerson(person),
    }
  }

  /**
   * Enlaza una persona con un participante
   */
  async linkParticipant(personId: string, participantId: string): Promise<PersonResponse> {
    // Verificar que ambos existen
    const [person, participant] = await Promise.all([
      prisma.person.findUnique({ where: { id: personId } }),
      prisma.participant.findUnique({ where: { id: participantId } }),
    ])

    if (!person) {
      throw new Error('Persona no encontrada')
    }

    if (!participant) {
      throw new Error('Participante no encontrado')
    }

    // Actualizar la persona
    const updated = await prisma.person.update({
      where: { id: personId },
      data: { participantId },
      include: { participant: true },
    })

    console.log(`[PERSONS] Persona ${personId} enlazada con participante ${participantId}`)

    return this.sanitizePerson(updated)
  }

  /**
   * Desenlaza una persona de un participante
   */
  async unlinkParticipant(personId: string): Promise<PersonResponse> {
    const person = await prisma.person.update({
      where: { id: personId },
      data: { participantId: null },
      include: { participant: true },
    })

    console.log(`[PERSONS] Persona ${personId} desenlazada de participante`)

    return this.sanitizePerson(person)
  }

  /**
   * Sanitiza la respuesta de persona
   */
  private sanitizePerson(person: any): PersonResponse {
    return {
      id: person.id,
      nombre: person.nombre,
      apellido: person.apellido,
      email: person.email,
      phone: person.phone,
      company: person.company,
      dietaryRestrictions: person.dietaryRestrictions ? JSON.parse(person.dietaryRestrictions) : [],
      identityHash: person.identityHash,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
      createdBy: person.createdBy,
      participantId: person.participantId,
    }
  }
}

export const personsService = new PersonsService()
