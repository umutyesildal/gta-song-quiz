import React from "react";
import { motion } from "framer-motion";

interface GameOptionsProps {
  options: string[];
  onSelect: (option: string) => void;
  correctAnswer?: string;
  selectedAnswer?: string;
  wrongGuesses?: string[];
  disabled?: boolean;
}

/**
 * Reusable component for game selection options
 */
const GameOptions: React.FC<GameOptionsProps> = ({
  options,
  onSelect,
  correctAnswer,
  selectedAnswer,
  wrongGuesses = [],
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
      {options.map((option, index) => {
        const isCorrect = correctAnswer && option === correctAnswer;
        const isWrong = wrongGuesses.includes(option);

        return (
          <motion.button
            key={index}
            onClick={() => onSelect(option)}
            disabled={disabled || isWrong}
            whileHover={!disabled && !isWrong ? { scale: 1.01, y: -1 } : {}}
            whileTap={!disabled && !isWrong ? { scale: 0.99 } : {}}
            className={`
              p-3 sm:p-4 text-left rounded quiz-answer relative overflow-hidden
              text-sm sm:text-base
              ${isCorrect ? "correct" : ""}
              ${isWrong ? "incorrect" : ""}
              transition-colors duration-200
            `}
          >
            {option}
            {isWrong && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className="absolute bottom-0 left-0 h-1 bg-red-500 bg-opacity-40"
              />
            )}
            {isCorrect && correctAnswer && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className="absolute bottom-0 left-0 h-1 bg-green-500 bg-opacity-40"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default GameOptions;
