import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { usersApi } from '../../lib/api';
const MODULES = ['MUSICADJ', 'KARAOKEYA', 'VENUES', 'EVENTS', 'CLIENTS', 'USERS'];
export default function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, watch } = useForm();
    const [loading, setLoading] = useState(!!id);
    const [permissions, setPermissions] = useState([]);
    const role = watch('role');
    useEffect(() => {
        if (id) {
            usersApi.get(id).then(r => {
                setValue('username', r.data.username);
                setValue('email', r.data.email);
                setValue('role', r.data.role);
                setPermissions(r.data.permissions || []);
                setLoading(false);
            });
        }
        else {
            // Cargar preset para OPERATOR por defecto
            loadRolePreset('OPERATOR');
        }
    }, [id]);
    useEffect(() => {
        if (role && !id) {
            loadRolePreset(role);
        }
    }, [role]);
    const loadRolePreset = (r) => {
        usersApi.getRolePreset(r).then(res => {
            setPermissions(res.data.permissions || []);
        });
    };
    const updatePermission = (module, field, value) => {
        setPermissions(prev => {
            const existing = prev.find(p => p.module === module);
            if (existing) {
                return prev.map(p => p.module === module ? { ...p, [field]: value } : p);
            }
            else {
                return [...prev, { module, canView: false, canEdit: false, canDelete: false, canExport: false, [field]: value }];
            }
        });
    };
    const onSubmit = async (data) => {
        const payload = {
            ...data,
            permissions: permissions.filter(p => p.canView || p.canEdit || p.canDelete || p.canExport)
        };
        if (id) {
            await usersApi.update(id, payload);
        }
        else {
            await usersApi.create(payload);
        }
        navigate('/users');
    };
    if (loading)
        return <div className="p-6">Cargando...</div>;
    return (<div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Editar' : 'Nuevo'} Usuario</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded p-6 space-y-4">
        <div>
          <label className="block font-medium mb-1">Usuario *</label>
          <input {...register('username', { required: true })} className="border rounded px-3 py-2 w-full"/>
        </div>
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input type="email" {...register('email')} className="border rounded px-3 py-2 w-full"/>
        </div>
        {!id && (<div>
            <label className="block font-medium mb-1">Password *</label>
            <input type="password" {...register('password', { required: !id })} className="border rounded px-3 py-2 w-full"/>
          </div>)}
        <div>
          <label className="block font-medium mb-1">Rol *</label>
          <select {...register('role', { required: true })} className="border rounded px-3 py-2 w-full">
            <option value="ADMIN">ADMIN</option>
            <option value="OPERATOR">OPERATOR</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>

        <div className="mt-6">
          <h3 className="font-bold mb-3">Permisos por Módulo</h3>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Módulo</th>
                  <th className="px-4 py-2 text-center">Ver</th>
                  <th className="px-4 py-2 text-center">Editar</th>
                  <th className="px-4 py-2 text-center">Eliminar</th>
                  <th className="px-4 py-2 text-center">Exportar</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map(mod => {
            const perm = permissions.find(p => p.module === mod);
            return (<tr key={mod} className="border-t">
                      <td className="px-4 py-2 font-medium">{mod}</td>
                      <td className="px-4 py-2 text-center">
                        <input type="checkbox" checked={perm?.canView || false} onChange={e => updatePermission(mod, 'canView', e.target.checked)}/>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input type="checkbox" checked={perm?.canEdit || false} onChange={e => updatePermission(mod, 'canEdit', e.target.checked)}/>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input type="checkbox" checked={perm?.canDelete || false} onChange={e => updatePermission(mod, 'canDelete', e.target.checked)}/>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input type="checkbox" checked={perm?.canExport || false} onChange={e => updatePermission(mod, 'canExport', e.target.checked)}/>
                      </td>
                    </tr>);
        })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
            {id ? 'Actualizar' : 'Crear'} Usuario
          </button>
          <button type="button" onClick={() => navigate('/users')} className="bg-gray-200 px-6 py-2 rounded">
            Cancelar
          </button>
        </div>
      </form>
    </div>);
}
//# sourceMappingURL=UserForm.js.map