export interface Song {
  radio_station: string;
  song_title: string;
  artist: string;
  yt_vid_title: string;
  yt_vid_link: string;
  yt_page_info: string;
  yt_view_count: number;
  yt_pub_date: string;
  yt_like_count: number;
  combinedScore?: number;
  views_per_year?: number;
  rate_based_score?: number;
}

export interface QuizSettings {
  mode: 'regular' | 'pro';
  attempts: number;
}

export interface QuizQuestion {
  song: Song;
  options: string[];
  correctAnswer: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  questions: {
    songTitle: string;
    artist: string;
    guessed: string;
    correct: string;
    isCorrect: boolean;
    videoId?: string;  // For YouTube integration
  }[];
}

export interface QuizFeedback {
  message: string;
  isCorrect: boolean;
  guessed?: string;
  showCorrect?: boolean; // Add this property to indicate when to show the correct answer
}
