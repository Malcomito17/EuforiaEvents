import { useState, useEffect } from 'react'
import { personsApi, Person, PersonCreateInput } from '@/lib/api'
import { Search, Plus, User, Loader2 } from 'lucide-react'

interface PersonSelectorProps {
  value: string | null
  onChange: (personId: string) => void
  label?: string
  placeholder?: string
}

export function PersonSelector({
  value,
  onChange,
  label = 'Seleccionar Persona',
  placeholder = 'Buscar por nombre, apellido o email...'
}: PersonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Cargar persona seleccionada
  useEffect(() => {
    if (value && !selectedPerson) {
      loadPerson(value)
    }
  }, [value])

  // Buscar personas cuando el usuario escribe
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchPersons()
    } else {
      setResults([])
    }
  }, [searchTerm])

  const loadPerson = async (personId: string) => {
    try {
      const { data } = await personsApi.get(personId)
      // El backend devuelve { success, person }
      const personData = (data as any).person || (data as any).data || data
      setSelectedPerson(personData)
    } catch (err) {
      console.error('Error loading person:', err)
    }
  }

  const searchPersons = async () => {
    setIsLoading(true)
    try {
      const { data } = await personsApi.search(searchTerm)
      // El backend devuelve { success, persons, count }
      const personsData = (data as any).persons || (data as any).data || []
      setResults(personsData)
    } catch (err) {
      console.error('Error searching persons:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (person: Person) => {
    setSelectedPerson(person)
    onChange(person.id)
    setIsOpen(false)
    setSearchTerm('')
    setResults([])
  }

  const handleClear = () => {
    setSelectedPerson(null)
    onChange('')
    setSearchTerm('')
    setResults([])
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Persona seleccionada */}
      {selectedPerson && !isOpen ? (
        <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
          <User className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {selectedPerson.nombre} {selectedPerson.apellido}
            </div>
            {selectedPerson.email && (
              <div className="text-sm text-gray-500">{selectedPerson.email}</div>
            )}
          </div>
          <button
            onClick={handleClear}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Input de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Resultados de búsqueda */}
          {isOpen && (searchTerm.length >= 2 || results.length > 0) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {results.length > 0 ? (
                <>
                  {results.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handleSelect(person)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {person.nombre} {person.apellido}
                      </div>
                      {person.email && (
                        <div className="text-sm text-gray-500">{person.email}</div>
                      )}
                      {person.company && (
                        <div className="text-sm text-gray-500">{person.company}</div>
                      )}
                    </button>
                  ))}
                </>
              ) : searchTerm.length >= 2 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No se encontraron personas
                </div>
              ) : null}

              {/* Botón para crear nueva persona */}
              <button
                onClick={() => {
                  setShowCreateForm(true)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition flex items-center gap-2 text-primary-600 font-medium"
              >
                <Plus className="h-4 w-4" />
                Crear nueva persona
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear nueva persona */}
      {showCreateForm && (
        <CreatePersonModal
          onClose={() => setShowCreateForm(false)}
          onCreated={(person) => {
            handleSelect(person)
            setShowCreateForm(false)
          }}
          initialName={searchTerm}
        />
      )}
    </div>
  )
}

// Modal para crear nueva persona
interface CreatePersonModalProps {
  onClose: () => void
  onCreated: (person: Person) => void
  initialName?: string
}

function CreatePersonModal({ onClose, onCreated, initialName = '' }: CreatePersonModalProps) {
  const [formData, setFormData] = useState<PersonCreateInput>({
    nombre: initialName,
    apellido: '',
    email: '',
    phone: '',
    company: '',
    dietaryRestrictions: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (_e?: React.FormEvent) => {
    setError('')

    console.log('[PersonSelector] handleSubmit called', formData)

    if (!formData.nombre.trim()) {
      console.log('[PersonSelector] Validation failed: nombre empty')
      setError('El nombre es obligatorio')
      return
    }

    if (!formData.apellido?.trim()) {
      console.log('[PersonSelector] Validation failed: apellido empty')
      setError('El apellido es obligatorio')
      return
    }

    console.log('[PersonSelector] Validation passed, calling API...')
    setIsSubmitting(true)
    try {
      // Limpiar campos vacíos - enviar solo los que tienen valor
      const cleanedData: PersonCreateInput = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido?.trim() || '',
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        company: formData.company?.trim() || undefined,
        dietaryRestrictions: formData.dietaryRestrictions?.length ? formData.dietaryRestrictions : undefined,
      }
      console.log('[PersonSelector] Sending POST to /api/persons', cleanedData)
      const { data } = await personsApi.create(cleanedData)
      console.log('[PersonSelector] API response:', data)
      // El backend devuelve { success, person } (no "data")
      const personData = (data as any).person || (data as any).data || data
      console.log('[PersonSelector] Calling onCreated with:', personData)
      onCreated(personData)
    } catch (err: any) {
      console.error('[PersonSelector] Error creating person:', err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al crear la persona')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Crear Nueva Persona</h2>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSubmit()
              }}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
