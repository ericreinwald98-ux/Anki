import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImportFlashcardsProps {
  onImported: () => void;
}

interface ImportedCard {
  front: string;
  back: string;
  language?: string;
  category?: string;
}

export default function ImportFlashcards({ onImported }: ImportFlashcardsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ImportedCard[]>([]);
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');

  const parseCSV = (text: string): ImportedCard[] => {
    const lines = text.trim().split('\n');
    const cards: ImportedCard[] = [];

    lines.forEach((line, index) => {
      if (index === 0) return;

      const matches = line.match(/"([^"]*)"|([^,]+)/g);
      if (matches && matches.length >= 2) {
        const front = matches[0].replace(/^"|"$/g, '').replace(/^,|,$/g, '').trim();
        const back = matches[1].replace(/^"|"$/g, '').replace(/^,|,$/g, '').trim();

        if (front && back) {
          cards.push({
            front,
            back,
            language: language || '',
            category: category || '',
          });
        }
      }
    });

    return cards;
  };

  const parseJSON = (text: string): ImportedCard[] => {
    const data = JSON.parse(text);
    const cards: ImportedCard[] = [];

    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.front && item.back) {
          cards.push({
            front: item.front,
            back: item.back,
            language: item.language || language || '',
            category: item.category || category || '',
          });
        }
      });
    }

    return cards;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let cards: ImportedCard[] = [];

      if (file.name.endsWith('.csv')) {
        cards = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        cards = parseJSON(text);
      } else {
        alert('Formato no soportado. Usa CSV o JSON');
        return;
      }

      if (cards.length === 0) {
        alert('No se encontraron tarjetas válidas en el archivo');
        return;
      }

      setPreview(cards);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error al leer el archivo');
    }
  };

  const handleImport = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Por favor inicia sesión primero');
        return;
      }

      const cardsToInsert = preview.map((card) => ({
        front: card.front,
        back: card.back,
        language: card.language || language || '',
        category: card.category || category || '',
        user_id: user.id,
      }));

      const { error } = await supabase.from('flashcards').insert(cardsToInsert);

      if (error) throw error;

      setPreview([]);
      setLanguage('');
      setCategory('');
      setIsOpen(false);
      onImported();
      alert(`Se importaron ${cardsToInsert.length} tarjetas correctamente`);
    } catch (error) {
      console.error('Error importing flashcards:', error);
      alert('Error al importar las tarjetas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
      >
        <Upload size={18} />
        Importar
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Importar Tarjetas</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {preview.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                  <p className="text-gray-700 mb-4">
                    Sube un archivo CSV o JSON con tus palabras
                  </p>
                  <label className="inline-block cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                      Seleccionar archivo
                    </div>
                  </label>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Formato CSV:</h3>
                  <pre className="text-xs text-gray-600 overflow-x-auto bg-white p-2 rounded border">
{`Palabra,Significado,Idioma,Categoría
"Hello","Hola","Inglés","Saludos"
"Goodbye","Adiós","Inglés","Saludos"`}
                  </pre>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Formato JSON:</h3>
                  <pre className="text-xs text-gray-600 overflow-x-auto bg-white p-2 rounded border">
{`[
  {
    "front": "Hello",
    "back": "Hola",
    "language": "Inglés",
    "category": "Saludos"
  }
]`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idioma (opcional)
                    </label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="ej. Inglés"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría (opcional)
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="ej. Saludos"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    Se encontraron {preview.length} tarjetas para importar
                  </p>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {preview.map((card, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Palabra</p>
                          <p className="font-medium text-gray-800">{card.front}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Significado</p>
                          <p className="text-gray-800">{card.back}</p>
                        </div>
                      </div>
                      {(card.language || card.category) && (
                        <div className="mt-2 text-xs text-gray-500">
                          {card.language && `Idioma: ${card.language}`}
                          {card.language && card.category && ' • '}
                          {card.category && `Categoría: ${card.category}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setPreview([])}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Importando...' : 'Importar Tarjetas'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
