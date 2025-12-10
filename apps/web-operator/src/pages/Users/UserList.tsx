import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usersApi } from '../../lib/api'

export default function UserList() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usersApi.list().then(r => { setUsers(r.data.users); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Link to="/users/new" className="btn btn-primary bg-blue-600 text-white px-4 py-2 rounded">Nuevo Usuario</Link>
      </div>
      <div className="bg-white shadow rounded">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Usuario</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Rol</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-6 py-4 font-medium">{u.username}</td>
                <td className="px-6 py-4">{u.email || '-'}</td>
                <td className="px-6 py-4">
                  <span className={
                    u.role === 'ADMIN' ? 'px-2 py-1 rounded text-xs bg-purple-100 text-purple-800' :
                    u.role === 'OPERATOR' ? 'px-2 py-1 rounded text-xs bg-blue-100 text-blue-800' :
                    'px-2 py-1 rounded text-xs bg-gray-100 text-gray-800'
                  }>{u.role}</span>
                </td>
                <td className="px-6 py-4">
                  {u.isActive ? <span className="text-green-600">Activo</span> : <span className="text-red-600">Inactivo</span>}
                </td>
                <td className="px-6 py-4">
                  <Link to={`/users/${u.id}/edit`} className="text-blue-600 hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
