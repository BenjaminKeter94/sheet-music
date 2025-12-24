
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type MusicalStyle = 'Original' | 'Classical' | 'Jazz Swing' | 'Lo-fi Chill' | 'Cinematic' | 'Pop Ballad';

export type HandSize = 'Standard' | 'Small (Max Octave)' | 'Petite (Max 7th)';

export interface ArrangementConfig {
  difficulty: DifficultyLevel;
  style: MusicalStyle;
  handSize: HandSize;
  title: string;
}

export interface ArrangementResult {
  abcNotation: string;
  explanation: string;
  metadata: {
    complexity: string;
    styleNotes: string;
  };
}
