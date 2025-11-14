import { useState, useEffect } from 'react';
import { supabase, Flashcard } from './lib/supabase';
import AuthForm from './components/AuthForm';
import FlashcardList from './components/FlashcardList';
import CreateFlashcard from './components/CreateFlashcard';
import StudyMode from './components/StudyMode';
import { LogOut } from 'lucide-react';

type StudyModeType = 'unlearned' | 'learned' | 'all' | null;

function App() {
  const [user, setUser] = useState<null | { id: string }>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isStudyMode, setIsStudyMode] = useState<StudyModeType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      localStorage.removeItem('rememberedEmail');
    }

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        loadFlashcards();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCards([]);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await loadFlashcards();
    }
    setLoading(false);
  };

  const loadFlashcards = async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading flashcards:', error);
    } else {
      setCards(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={checkUser} />;
  }

  if (isStudyMode && isStudyMode !== null) {
    return (
      <StudyMode
        cards={cards}
        studyMode={isStudyMode}
        onClose={() => setIsStudyMode(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">FlashLearn</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      <FlashcardList
        cards={cards}
        onUpdate={loadFlashcards}
        onStartStudy={(mode) => setIsStudyMode(mode)}
      />

      <CreateFlashcard onCreated={loadFlashcards} />
    </div>
  );
}

export default App;
