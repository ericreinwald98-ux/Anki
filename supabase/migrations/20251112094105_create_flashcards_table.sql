/*
  # Create flashcards table for language learning

  1. New Tables
    - `flashcards`
      - `id` (uuid, primary key) - Unique identifier for each flashcard
      - `front` (text) - The word or phrase in the original language
      - `back` (text) - The translation or meaning
      - `language` (text) - The language being learned
      - `category` (text) - Optional category/topic for organization
      - `created_at` (timestamptz) - Timestamp when card was created
      - `updated_at` (timestamptz) - Timestamp when card was last updated
      - `user_id` (uuid) - Owner of the flashcard
      - `times_reviewed` (integer) - Number of times the card has been reviewed
      - `last_reviewed_at` (timestamptz) - When the card was last reviewed

  2. Security
    - Enable RLS on `flashcards` table
    - Add policies for authenticated users to manage their own flashcards
    
  3. Indexes
    - Index on user_id for faster queries
    - Index on language for filtering
*/

CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  front text NOT NULL,
  back text NOT NULL,
  language text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL,
  times_reviewed integer DEFAULT 0,
  last_reviewed_at timestamptz
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flashcards"
  ON flashcards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcards"
  ON flashcards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards"
  ON flashcards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards"
  ON flashcards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_language ON flashcards(language);