import { useState } from 'react';
import { Trash2, Edit2, Download, BookOpen, Filter } from 'lucide-react';
import { supabase, Flashcard } from '../lib/supabase';
import ImportFlashcards from './ImportFlashcards';

interface FlashcardListProps {
  cards: Flashcard[];
  onUpdate: () => void;
  onStartStudy: (mode: 'unlearned' | 'learned' | 'all') => void;
}

export default function FlashcardList({ cards, onUpdate, onStartStudy }: FlashcardListProps) {
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterLearned, setFilterLearned] = useState<'all' | 'learned' | 'unlearned'>('all');

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarjeta?')) return;

    try {
      const { error } = await supabase.from('flashcards').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Error al eliminar la tarjeta');
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card);
    setFront(card.front);
    setBack(card.back);
    setLanguage(card.language);
    setCategory(card.category);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('flashcards')
        .update({
          front,
          back,
          language,
          category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCard.id);

      if (error) throw error;

      setEditingCard(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating flashcard:', error);
      alert('Error al actualizar la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `flashcards-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    const headers = ['Palabra', 'Significado', 'Idioma', 'Categoría', 'Veces Revisada'];
    const rows = cards.map((card) => [
      card.front,
      card.back,
      card.language,
      card.category,
      card.times_reviewed.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `flashcards-${new Date().toISOString().split('T')[0]}.csv`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredCards = cards.filter((card) => {
    if (filterLearned === 'learned') return card.learned;
    if (filterLearned === 'unlearned') return !card.learned;
    return true;
  });

  const learnedCount = cards.filter((c) => c.learned).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Mis Tarjetas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {learnedCount} de {cards.length} aprendidas
          </p>
        </div>
        <div className="flex gap-3">
          <ImportFlashcards onImported={onUpdate} />
          {cards.length > 0 && (
            <>
              <div className="relative group">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <BookOpen size={18} />
                  Estudiar
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => onStartStudy('unlearned')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-t-lg"
                  >
                    <div className="font-medium">Por aprender</div>
                    <div className="text-xs text-gray-500">
                      {cards.filter(c => !c.learned).length} tarjetas
                    </div>
                  </button>
                  <button
                    onClick={() => onStartStudy('learned')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-t border-gray-200"
                  >
                    <div className="font-medium">Repasar aprendidas</div>
                    <div className="text-xs text-gray-500">
                      {cards.filter(c => c.learned).length} tarjetas
                    </div>
                  </button>
                  <button
                    onClick={() => onStartStudy('all')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-t border-gray-200 rounded-b-lg"
                  >
                    <div className="font-medium">Todas</div>
                    <div className="text-xs text-gray-500">
                      {cards.length} tarjetas
                    </div>
                  </button>
                </div>
              </div>
              <div className="relative group">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Download size={18} />
                  Exportar
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={handleExportJSON}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                  >
                    Exportar como JSON
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg"
                  >
                    Exportar como CSV
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {cards.length > 0 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterLearned('all')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              filterLearned === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Todas ({cards.length})
          </button>
          <button
            onClick={() => setFilterLearned('unlearned')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterLearned === 'unlearned'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Por aprender ({cards.length - learnedCount})
          </button>
          <button
            onClick={() => setFilterLearned('learned')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterLearned === 'learned'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Aprendidas ({learnedCount})
          </button>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-500">No tienes tarjetas aún</p>
          <p className="text-gray-400 mt-2">Haz clic en el botón + para crear tu primera tarjeta</p>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-500">No hay tarjetas en esta categoría</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs text-gray-500">
                  {card.language && `${card.language}`}
                  {card.category && ` • ${card.category}`}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(card)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Palabra</p>
                  <p className="text-lg font-bold text-gray-800">{card.front}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Significado</p>
                  <p className="text-gray-700">{card.back}</p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="text-xs text-gray-400">
                  Revisada {card.times_reviewed} {card.times_reviewed === 1 ? 'vez' : 'veces'}
                </div>
                {card.learned && (
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    ✓ Aprendida
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Editar Tarjeta</h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palabra o Frase</label>
                <input
                  type="text"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Significado o Traducción
                </label>
                <textarea
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button type='button'
                  onClick={() => {
                    setFront('');
                    setBack('');
                    setLanguage('');
                    setCategory('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                     Limpiarrrrrrrrrrrrrrrrrrrrrr


                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
