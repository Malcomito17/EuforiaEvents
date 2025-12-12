/**
 * NotFound - Página 404
 */
import { Music2 } from 'lucide-react';
export default function NotFound() {
    return (<div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Music2 className="w-16 h-16 text-primary-500 mx-auto mb-4 opacity-50"/>
        <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-white/60">
          El evento que buscás no existe o el enlace es incorrecto.
        </p>
      </div>
    </div>);
}
//# sourceMappingURL=NotFound.js.map