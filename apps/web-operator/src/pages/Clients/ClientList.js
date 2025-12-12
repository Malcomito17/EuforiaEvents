import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientsApi } from '@/lib/api';
import { Plus, Search, Users, Phone, Mail, Building, Edit, Trash2, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
export function ClientListPage() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    useEffect(() => {
        loadClients();
    }, [showInactive]);
    const loadClients = async () => {
        setIsLoading(true);
        try {
            const { data } = await clientsApi.list({
                search: search || undefined,
                includeInactive: showInactive,
            });
            setClients(data.clients);
        }
        catch (error) {
            console.error('Error loading clients:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSearch = (e) => {
        e.preventDefault();
        loadClients();
    };
    const handleDelete = async (id) => {
        if (!confirm('¿Desactivar este cliente?'))
            return;
        try {
            await clientsApi.delete(id);
            loadClients();
        }
        catch (error) {
            console.error('Error deleting:', error);
        }
    };
    const handleReactivate = async (id) => {
        try {
            await clientsApi.reactivate(id);
            loadClients();
        }
        catch (error) {
            console.error('Error reactivating:', error);
        }
    };
    return (<div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Link to="/clients/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
          <Plus className="h-5 w-5"/>
          Nuevo Cliente
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar clientes..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"/>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
            <span className="text-sm text-gray-700">Mostrar inactivos</span>
          </label>
          <button type="submit" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors">
            Buscar
          </button>
        </form>
      </div>

      {/* Clients Grid */}
      {isLoading ? (<div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>) : clients.length === 0 ? (<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
          <p className="text-gray-500 mb-4">Creá tu primer cliente para empezar</p>
          <Link to="/clients/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <Plus className="h-5 w-5"/>
            Crear Cliente
          </Link>
        </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (<div key={client.id} className={clsx("bg-white rounded-xl shadow-sm border p-6", client.isActive ? "border-gray-100" : "border-gray-200 opacity-60")}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  {client.company && (<div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Building className="h-4 w-4"/>
                      {client.company}
                    </div>)}
                </div>
                {!client.isActive && (<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    Inactivo
                  </span>)}
              </div>

              <div className="space-y-2 mb-4">
                {client.phone && (<div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400"/>
                    <span>{client.phone}</span>
                  </div>)}

                {client.email && (<div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400"/>
                    <span className="truncate">{client.email}</span>
                  </div>)}
              </div>

              {client._count && (<div className="text-sm text-gray-500 mb-4">
                  {client._count.events} evento{client._count.events !== 1 ? 's' : ''}
                </div>)}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Link to={`/clients/${client.id}/edit`} className="flex-1 px-3 py-2 text-center text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Edit className="h-4 w-4"/>
                  Editar
                </Link>
                {client.isActive ? (<button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Desactivar">
                    <Trash2 className="h-4 w-4"/>
                  </button>) : (<button onClick={() => handleReactivate(client.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Reactivar">
                    <RotateCcw className="h-4 w-4"/>
                  </button>)}
              </div>
            </div>))}
        </div>)}
    </div>);
}
//# sourceMappingURL=ClientList.js.map