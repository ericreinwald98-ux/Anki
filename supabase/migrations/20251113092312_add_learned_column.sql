/*
  # Add learned status to flashcards

  1. Changes to flashcards table
    - `learned` (boolean) - Marks if a flashcard has been learned
    - `learned_at` (timestamptz) - When the card was marked as learned
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'flashcards' AND column_name = 'learned'
  ) THEN
    ALTER TABLE flashcards ADD COLUMN learned boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'flashcards' AND column_name = 'learned_at'
  ) THEN
    ALTER TABLE flashcards ADD COLUMN learned_at timestamptz;
  END IF;
END $$;