import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
export function ChangePasswordPage() {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const newPassword = watch('newPassword');
    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await authApi.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setSuccess(true);
            reset();
            // Redirigir al dashboard después de 2 segundos
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }
        catch (err) {
            console.error('Error changing password:', err);
            setError(err.response?.data?.error ||
                err.response?.data?.message ||
                'Error al cambiar la contraseña');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cambiar Contraseña</h1>
        <p className="text-gray-600 mt-2">
          Actualizá tu contraseña para mantener tu cuenta segura
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contraseña actual */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <input type="password" id="currentPassword" {...register('currentPassword', {
        required: 'La contraseña actual es requerida'
    })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Ingresá tu contraseña actual"/>
            </div>
            {errors.currentPassword && (<p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>)}
          </div>

          {/* Nueva contraseña */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <input type="password" id="newPassword" {...register('newPassword', {
        required: 'La nueva contraseña es requerida',
        minLength: {
            value: 6,
            message: 'La contraseña debe tener al menos 6 caracteres',
        },
    })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Mínimo 6 caracteres"/>
            </div>
            {errors.newPassword && (<p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>)}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <input type="password" id="confirmPassword" {...register('confirmPassword', {
        required: 'Por favor confirmá tu nueva contraseña',
        validate: (value) => value === newPassword || 'Las contraseñas no coinciden',
    })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Volvé a ingresar la nueva contraseña"/>
            </div>
            {errors.confirmPassword && (<p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>)}
          </div>

          {/* Mensajes de éxito/error */}
          {success && (<div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="h-5 w-5 flex-shrink-0"/>
              <p className="text-sm">
                Contraseña cambiada exitosamente. Redirigiendo...
              </p>
            </div>)}

          {error && (<div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0"/>
              <p className="text-sm">{error}</p>
            </div>)}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={isLoading || success} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
            <button type="button" onClick={() => navigate(-1)} disabled={isLoading} className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </form>

        {/* Consejos de seguridad */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Consejos de seguridad:</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Usá al menos 6 caracteres</li>
            <li>Combiná letras, números y símbolos</li>
            <li>No reutilices contraseñas de otras cuentas</li>
            <li>Evitá información personal obvia</li>
          </ul>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=ChangePassword.js.map