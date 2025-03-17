"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Song, QuizQuestion, QuizResult, QuizFeedback } from "@/types";
import { generateQuiz } from "@/utils/quiz";
import Link from "next/link";
import YouTubePlayer from "@/components/YouTubePlayer";

// Create a component that uses useSearchParams
function QuizContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as "regular" | "pro") || "regular";

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [results, setResults] = useState<QuizResult>({
    totalQuestions: 0,
    correctAnswers: 0,
    score: 0,
    questions: [],
  });
  const [quizComplete, setQuizComplete] = useState(false);
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_ATTEMPTS = 2;
  const QUESTION_COUNT = 5;

  useEffect(() => {
    async function loadQuizData() {
      try {
        console.log("Loading quiz data...");
        const response = await fetch("/data/songs.json");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Data loaded:", data);

        if (
          !data.songs ||
          !Array.isArray(data.songs) ||
          !data.radioStations ||
          !Array.isArray(data.radioStations)
        ) {
          throw new Error("Invalid data format received");
        }

        console.log(
          `Found ${data.songs.length} songs and ${data.radioStations.length} radio stations`
        );

        // Remove the file system check as it won't work in the browser
        // Just use the data we already loaded

        const quizQuestions = generateQuiz(
          data.songs,
          data.radioStations,
          mode,
          QUESTION_COUNT
        );

        console.log(`Quiz questions generated: ${quizQuestions.length}`);

        if (!quizQuestions || quizQuestions.length === 0) {
          throw new Error("No quiz questions were generated");
        }

        setQuestions(quizQuestions);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load quiz data:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
        setLoading(false);
      }
    }

    loadQuizData();
  }, [mode]);

  // Make sure we have a current question
  const currentQuestion = questions[currentQuestionIndex];

  // Helper function to extract YouTube video ID from link
  const extractYouTubeId = (url: string): string => {
    if (!url) return ""; // Guard against undefined URLs

    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7] && match[7].length === 11 ? match[7] : "";
  };

  // Rest of handlers
  const handleAnswerSelect = (answer: string) => {
    // Don't allow new answers while feedback is showing or if no current question
    if (feedback || !currentQuestion) return;

    // Rest of the answer select logic...
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      // Correct answer
      setFeedback({
        message: "Correct!",
        isCorrect: true,
        guessed: answer,
      });

      // Update results
      addResultToHistory(answer, isCorrect);

      // Wait 2 seconds then move to next question or end quiz
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    } else {
      // Incorrect answer
      setAttempts((prev) => prev + 1);

      if (attempts + 1 >= MAX_ATTEMPTS) {
        // Out of attempts
        setFeedback({
          message: `Incorrect! The correct answer is ${currentQuestion.correctAnswer}.`,
          isCorrect: false,
          guessed: answer,
          showCorrect: true, // Add a flag to indicate we should show the correct answer
        });

        // Update results
        addResultToHistory(answer, isCorrect);

        // Wait 2 seconds then move to next question or end quiz
        setTimeout(() => {
          moveToNextQuestion();
        }, 2000);
      } else {
        // Still have attempts left
        setFeedback({
          message: `Incorrect! Try again. (${
            attempts + 1
          }/${MAX_ATTEMPTS} attempts)`,
          isCorrect: false,
          guessed: answer,
          showCorrect: false, // Don't show correct answer yet
        });

        // Clear feedback after 1.5 seconds so user can try again
        setTimeout(() => {
          setFeedback(null);
        }, 1500);
      }
    }
  };

  const addResultToHistory = (selectedAnswer: string, isCorrect: boolean) => {
    if (!currentQuestion) return;

    const newResult = {
      songTitle: currentQuestion.song.song_title,
      artist: currentQuestion.song.artist,
      guessed: selectedAnswer,
      correct: currentQuestion.correctAnswer,
      isCorrect,
      videoId: extractYouTubeId(currentQuestion.song.yt_vid_link),
    };

    setResults((prev) => {
      const newQuestions = [...prev.questions, newResult];
      const correctAnswers = newQuestions.filter((q) => q.isCorrect).length;
      return {
        totalQuestions: newQuestions.length,
        correctAnswers,
        score: Math.round((correctAnswers / newQuestions.length) * 100),
        questions: newQuestions,
      };
    });
  };

  const moveToNextQuestion = () => {
    setFeedback(null);
    setAttempts(0);

    if (currentQuestionIndex >= questions.length - 1) {
      // Quiz is complete
      setQuizComplete(true);
    } else {
      // Move to next question
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Handle reset/play again functionality
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAttempts(0);
    setResults({
      totalQuestions: 0,
      correctAnswers: 0,
      score: 0,
      questions: [],
    });
    setQuizComplete(false);
    setFeedback(null);

    // Reload the page to get a fresh set of questions
    window.location.href = `/quiz?mode=${mode}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="gta-title text-4xl mb-4">Loading Quiz...</h2>
          <div className="w-16 h-16 border-4 border-gta-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black bg-opacity-80 p-8 rounded-lg text-center max-w-lg">
          <h2 className="gta-title text-4xl mb-4">Error Loading Quiz</h2>
          <p className="mb-6 text-red-400">{error}</p>
          <Link href="/">
            <button className="px-8 py-3 bg-gta-yellow text-black font-bold rounded-lg">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black bg-opacity-80 p-8 rounded-lg text-center max-w-lg">
          <h2 className="gta-title text-4xl mb-4">No Questions Available</h2>
          <p className="mb-6">
            We couldn't generate any quiz questions. Please try again or choose
            a different mode.
          </p>
          <Link href="/">
            <button className="px-8 py-3 bg-gta-yellow text-black font-bold rounded-lg">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black bg-opacity-80 p-8 rounded-lg text-center max-w-lg">
          <h2 className="gta-title text-4xl mb-4">Quiz Error</h2>
          <p className="mb-6">
            There was a problem loading the current question. Please try again.
          </p>
          <Link href="/">
            <button className="px-8 py-3 bg-gta-yellow text-black font-bold rounded-lg">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="max-w-2xl mx-auto bg-black bg-opacity-80 p-8 rounded-lg">
        <h2 className="gta-title text-4xl mb-6 text-center">Quiz Complete!</h2>

        <div className="text-center mb-8">
          <p className="text-3xl font-bold mb-2">
            Your Score: {results.score}%
          </p>
          <p className="text-xl">
            You got {results.correctAnswers} out of {results.totalQuestions}{" "}
            correct
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Results:</h3>
          <div className="space-y-6">
            {results.questions.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  result.isCorrect
                    ? "bg-green-900 bg-opacity-50"
                    : "bg-red-900 bg-opacity-50"
                }`}
              >
                <p className="font-bold mb-2">
                  &quot;{result.songTitle}&quot; by {result.artist}
                </p>
                <p className="mb-3">
                  Your answer:{" "}
                  <span
                    className={
                      result.isCorrect ? "text-green-400" : "text-red-400"
                    }
                  >
                    {result.guessed}
                  </span>
                  {!result.isCorrect && (
                    <span>
                      {" "}
                      • Correct answer:{" "}
                      <span className="text-green-400">{result.correct}</span>
                    </span>
                  )}
                </p>

                {result.videoId && (
                  <div className="aspect-video w-full mb-2">
                    <YouTubePlayer videoId={result.videoId} autoplay={false} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <button className="w-full py-3 bg-gta-blue text-white rounded-lg font-bold">
              Return to Home
            </button>
          </Link>

          {/* Update the Play Again button to use our reset function */}
          <button
            onClick={resetQuiz}
            className="flex-1 w-full py-3 bg-gta-green text-black rounded-lg font-bold"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-black bg-opacity-80 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="gta-title text-3xl">San Andreas Radio Quiz</h2>
          <span className="px-3 py-1 bg-gta-yellow text-black rounded-full font-bold">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="mb-6 h-1 bg-gray-700 rounded-full">
          <div
            className="h-1 bg-gta-yellow rounded-full"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
          ></div>
        </div>

        <div className="mb-6 aspect-video w-full">
          <YouTubePlayer
            videoId={extractYouTubeId(currentQuestion.song.yt_vid_link)}
          />
        </div>

        <div className="text-center mb-6">
          <p className="text-lg text-gray-400 mb-1">
            Which radio station played:
          </p>
          <h3 className="text-2xl font-bold mb-1">
            &quot;{currentQuestion.song.song_title}&quot;
          </h3>
          <p className="text-xl">by {currentQuestion.song.artist}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={!!feedback}
              className={`
                p-4 border text-left rounded-lg quiz-answer
                ${
                  feedback &&
                  feedback.showCorrect &&
                  option === currentQuestion.correctAnswer
                    ? "correct"
                    : ""
                }
                ${
                  feedback &&
                  feedback.isCorrect === false &&
                  feedback.guessed === option
                    ? "incorrect"
                    : ""
                }
                hover:bg-gta-yellow hover:bg-opacity-20
              `}
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-lg text-center ${
              feedback.isCorrect
                ? "bg-green-800 bg-opacity-50"
                : "bg-red-800 bg-opacity-50"
            }`}
          >
            <p>{feedback.message}</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <Link href="/" className="text-gta-yellow hover:underline">
          Exit Quiz
        </Link>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="gta-title text-4xl mb-4">Loading Quiz...</h2>
            <div className="w-16 h-16 border-4 border-gta-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
