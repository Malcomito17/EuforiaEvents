import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { clientsApi } from '@/lib/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import clsx from 'clsx';
export function ClientFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    useEffect(() => {
        if (isEditing) {
            loadClient();
        }
    }, [id]);
    const loadClient = async () => {
        setIsLoading(true);
        try {
            const { data } = await clientsApi.get(id);
            reset({
                name: data.name,
                company: data.company || '',
                phone: data.phone || '',
                email: data.email || '',
                cuit: data.cuit || '',
                notes: data.notes || '',
            });
        }
        catch (err) {
            setError('Error al cargar el cliente');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const onSubmit = async (formData) => {
        setIsSaving(true);
        setError('');
        try {
            const payload = {
                name: formData.name,
                company: formData.company || undefined,
                phone: formData.phone || undefined,
                email: formData.email || undefined,
                cuit: formData.cuit || undefined,
                notes: formData.notes || undefined,
            };
            if (isEditing) {
                await clientsApi.update(id, payload);
            }
            else {
                await clientsApi.create(payload);
            }
            navigate('/clients');
        }
        catch (err) {
            const error = err;
            setError(error.response?.data?.error || 'Error al guardar el cliente');
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>);
    }
    return (<div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5"/>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h1>
      </div>

      {error && (<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>)}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos principales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Cliente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input {...register('name', { required: 'El nombre es requerido' })} className={clsx("w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none", errors.name ? "border-red-300" : "border-gray-300")} placeholder="Ej: María González"/>
              {errors.name && (<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>)}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <input {...register('company')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Ej: Empresa S.A."/>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input {...register('phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Ej: +54 11 1234-5678"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input type="email" {...register('email', {
        pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email inválido'
        }
    })} className={clsx("w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none", errors.email ? "border-red-300" : "border-gray-300")} placeholder="Ej: cliente@email.com"/>
              {errors.email && (<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>)}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CUIT
              </label>
              <input {...register('cuit')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Ej: 20-12345678-9"/>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas</h2>
          
          <textarea {...register('notes')} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" placeholder="Notas adicionales sobre el cliente..."/>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg flex items-center gap-2 transition-colors">
            {isSaving ? (<Loader2 className="h-5 w-5 animate-spin"/>) : (<Save className="h-5 w-5"/>)}
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>);
}
//# sourceMappingURL=ClientForm.js.map