import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Music2, Star, Heart, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { karaokeSongsApi } from '../../lib/api';
import clsx from 'clsx';
const DIFFICULTY_COLORS = {
    FACIL: 'bg-green-100 text-green-700 border-green-200',
    MEDIO: 'bg-blue-100 text-blue-700 border-blue-200',
    DIFICIL: 'bg-orange-100 text-orange-700 border-orange-200',
    PAVAROTTI: 'bg-red-100 text-red-700 border-red-200',
};
const DIFFICULTY_LABELS = {
    FACIL: 'Fácil',
    MEDIO: 'Medio',
    DIFICIL: 'Difícil',
    PAVAROTTI: 'Pavarotti',
};
export default function SongList() {
    const navigate = useNavigate();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    // Filters
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [minRanking, setMinRanking] = useState('');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [includeInactive, setIncludeInactive] = useState(false);
    // Pagination
    const [offset, setOffset] = useState(0);
    const limit = 20;
    useEffect(() => {
        loadSongs();
    }, [search, difficulty, minRanking, sortBy, sortOrder, includeInactive, offset]);
    async function loadSongs() {
        setLoading(true);
        try {
            const { data } = await karaokeSongsApi.list({
                search: search || undefined,
                difficulty: difficulty || undefined,
                minRanking: minRanking || undefined,
                sortBy,
                sortOrder,
                includeInactive,
                limit,
                offset,
            });
            setSongs(data.songs);
            setTotal(data.pagination.total);
            setHasMore(data.pagination.hasMore);
        }
        catch (error) {
            console.error('Error al cargar canciones:', error);
            alert('Error al cargar canciones');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleDelete(song) {
        if (!confirm(`¿Desactivar "${song.title}"?`))
            return;
        try {
            await karaokeSongsApi.delete(song.id);
            loadSongs();
        }
        catch (error) {
            console.error('Error al desactivar canción:', error);
            alert('Error al desactivar canción');
        }
    }
    async function handleReactivate(song) {
        try {
            await karaokeSongsApi.reactivate(song.id);
            loadSongs();
        }
        catch (error) {
            console.error('Error al reactivar canción:', error);
            alert('Error al reactivar canción');
        }
    }
    function resetFilters() {
        setSearch('');
        setDifficulty('');
        setMinRanking('');
        setSortBy('title');
        setSortOrder('asc');
        setIncludeInactive(false);
        setOffset(0);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Karaoke</h1>
          <p className="text-sm text-gray-600 mt-1">
            {total} {total === 1 ? 'canción' : 'canciones'} en el catálogo
          </p>
        </div>
        <button onClick={() => navigate('/karaoke-songs/new')} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          <Plus className="w-5 h-5"/>
          Nueva Canción
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button onClick={resetFilters} className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center gap-1">
            <RefreshCw className="w-4 h-4"/>
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
              <input type="text" value={search} onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
        }} placeholder="Título o artista..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"/>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dificultad
            </label>
            <select value={difficulty} onChange={(e) => {
            setDifficulty(e.target.value);
            setOffset(0);
        }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Todas</option>
              <option value="FACIL">Fácil</option>
              <option value="MEDIO">Medio</option>
              <option value="DIFICIL">Difícil</option>
              <option value="PAVAROTTI">Pavarotti</option>
            </select>
          </div>

          {/* Min Ranking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ranking mínimo
            </label>
            <select value={minRanking} onChange={(e) => {
            setMinRanking(e.target.value ? parseInt(e.target.value) : '');
            setOffset(0);
        }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Todos</option>
              <option value="1">⭐ o más</option>
              <option value="2">⭐⭐ o más</option>
              <option value="3">⭐⭐⭐ o más</option>
              <option value="4">⭐⭐⭐⭐ o más</option>
              <option value="5">⭐⭐⭐⭐⭐</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <div className="flex gap-2">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="title">Título</option>
                <option value="ranking">Ranking</option>
                <option value="likesCount">Likes</option>
                <option value="timesRequested">Pedidas</option>
                <option value="createdAt">Fecha</option>
              </select>
              <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition" title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}>
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Include Inactive */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="includeInactive" checked={includeInactive} onChange={(e) => {
            setIncludeInactive(e.target.checked);
            setOffset(0);
        }} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"/>
          <label htmlFor="includeInactive" className="text-sm text-gray-700">
            Incluir canciones desactivadas
          </label>
        </div>
      </div>

      {/* Loading */}
      {loading && (<div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin"/>
        </div>)}

      {/* Empty State */}
      {!loading && songs.length === 0 && (<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Music2 className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay canciones
          </h3>
          <p className="text-gray-600 mb-6">
            {search || difficulty || minRanking
                ? 'No se encontraron canciones con estos filtros'
                : 'Comienza agregando canciones al catálogo'}
          </p>
          {!search && !difficulty && !minRanking && (<button onClick={() => navigate('/karaoke-songs/new')} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              <Plus className="w-5 h-5"/>
              Crear Primera Canción
            </button>)}
        </div>)}

      {/* Songs Grid */}
      {!loading && songs.length > 0 && (<>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (<div key={song.id} className={clsx('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition', !song.isActive && 'opacity-50')}>
                {/* Thumbnail */}
                {song.thumbnailUrl && (<div className="aspect-video bg-gray-100 overflow-hidden">
                    <img src={song.thumbnailUrl} alt={song.title} className="w-full h-full object-cover"/>
                  </div>)}

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title & Artist */}
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {song.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{song.artist}</p>
                  </div>

                  {/* Difficulty & Rating */}
                  <div className="flex items-center gap-2">
                    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium', DIFFICULTY_COLORS[song.difficulty])}>
                      {DIFFICULTY_LABELS[song.difficulty]}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={clsx('w-4 h-4', i < song.ranking
                        ? 'fill-amber-500 text-amber-500'
                        : 'fill-gray-200 text-gray-200')}/>))}
                    </div>
                  </div>

                  {/* Opinion */}
                  {song.opinion && (<p className="text-xs text-gray-500 italic line-clamp-2">
                      "{song.opinion}"
                    </p>)}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-500"/>
                        {song.likesCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Music2 className="w-3.5 h-3.5 text-purple-500"/>
                        {song.timesRequested}x
                      </span>
                    </div>
                    {!song.isActive && (<span className="text-xs text-gray-500 font-medium">
                        INACTIVA
                      </span>)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => navigate(`/karaoke-songs/${song.id}/edit`)} className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">
                      Editar
                    </button>
                    {song.isActive ? (<button onClick={() => handleDelete(song)} className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition" title="Desactivar">
                        <Trash2 className="w-4 h-4"/>
                      </button>) : (<button onClick={() => handleReactivate(song)} className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition" title="Reactivar">
                        <RefreshCw className="w-4 h-4"/>
                      </button>)}
                  </div>
                </div>
              </div>))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              Mostrando {offset + 1} - {Math.min(offset + limit, total)} de {total}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                Anterior
              </button>
              <button onClick={() => setOffset(offset + limit)} disabled={!hasMore} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                Siguiente
              </button>
            </div>
          </div>
        </>)}
    </div>);
}
//# sourceMappingURL=SongList.js.map