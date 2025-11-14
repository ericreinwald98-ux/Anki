import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle } from 'lucide-react';
import { supabase, Flashcard } from '../lib/supabase';

interface StudyModeProps {
  cards: Flashcard[];
  onClose: () => void;
  studyMode?: 'all' | 'unlearned' | 'learned';
}

export default function StudyMode({ cards, onClose, studyMode = 'unlearned' }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [mode, setMode] = useState<'all' | 'unlearned' | 'learned'>(studyMode);

  useEffect(() => {
    let filtered = cards;

    if (mode === 'unlearned') {
      filtered = cards.filter(c => !c.learned);
    } else if (mode === 'learned') {
      filtered = cards.filter(c => c.learned);
    }

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards, mode]);

  const currentCard = shuffledCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);

    if (!isFlipped && currentCard) {
      updateReviewCount(currentCard.id);
    }
  };

  const updateReviewCount = async (cardId: string) => {
    await supabase
      .from('flashcards')
      .update({
        times_reviewed: currentCard.times_reviewed + 1,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', cardId);
  };

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkLearned = async () => {
    if (!currentCard) return;

    await supabase
      .from('flashcards')
      .update({
        learned: !currentCard.learned,
        learned_at: !currentCard.learned ? new Date().toISOString() : null,
      })
      .eq('id', currentCard.id);

    const updatedCards = [...shuffledCards];
    updatedCards[currentIndex] = {
      ...currentCard,
      learned: !currentCard.learned,
      learned_at: !currentCard.learned ? new Date().toISOString() : null,
    };
    setShuffledCards(updatedCards);
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">No hay tarjetas disponibles</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (shuffledCards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <p className="text-xl text-gray-600 mb-6">
            {mode === 'unlearned'
              ? '¡Felicidades! Ya aprendiste todas las tarjetas'
              : 'No hay tarjetas en esta categoría'}
          </p>
          {mode === 'unlearned' && (
            <div className="space-y-3 mb-6">
              <p className="text-gray-500">¿Quieres repasar las tarjetas aprendidas?</p>
              <button
                onClick={() => setMode('learned')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Repasar aprendidas
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              Salir
            </button>
          </div>
          <div className="text-white text-lg font-medium">
            {currentIndex + 1} / {shuffledCards.length}
          </div>
          <button
            onClick={handleShuffle}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2"
          >
            <RotateCw size={18} />
            Mezclar
          </button>
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          <button
            onClick={() => setMode('unlearned')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'unlearned'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Por aprender ({cards.filter(c => !c.learned).length})
          </button>
          <button
            onClick={() => setMode('learned')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'learned'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Repasar aprendidas ({cards.filter(c => c.learned).length})
          </button>
          <button
            onClick={() => setMode('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todas ({cards.length})
          </button>
        </div>

        <div className="perspective-1000">
          <div
            onClick={handleFlip}
            className={`relative w-full h-96 cursor-pointer transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-sm font-medium text-blue-600 mb-4">
                {currentCard?.language && `${currentCard.language}`}
                {currentCard?.category && ` • ${currentCard.category}`}
              </div>
              <p className="text-4xl font-bold text-gray-800 text-center mb-6">
                {currentCard?.front}
              </p>
              <p className="text-gray-400 text-sm">Haz clic para ver la respuesta</p>
            </div>

            <div
              className="absolute inset-0 bg-blue-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="text-sm font-medium text-blue-200 mb-4">Significado</div>
              <p className="text-4xl font-bold text-white text-center whitespace-pre-wrap">
                {currentCard?.back}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 gap-3 flex-wrap">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <button
            onClick={handleMarkLearned}
            className={`px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-2 ${
              currentCard?.learned
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle size={20} />
            {currentCard?.learned ? 'Aprendida' : 'Marcar aprendida'}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === shuffledCards.length - 1}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Siguiente
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
