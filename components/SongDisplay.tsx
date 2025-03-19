import React from "react";
import YouTubePlayer from "./YouTubePlayer";
import { extractYouTubeId } from "@/utils/helpers";
import { motion, AnimatePresence } from "framer-motion";

interface SongDisplayProps {
  videoUrl: string;
  songTitle: string;
  artist: string;
  radioStation?: string;
  showDetails: boolean;
  showRadioStation?: boolean;
}

/**
 * Reusable component to display a song with its YouTube video and details
 */
const SongDisplay: React.FC<SongDisplayProps> = ({
  videoUrl,
  songTitle,
  artist,
  radioStation,
  showDetails,
  showRadioStation = false,
}) => {
  const videoId = extractYouTubeId(videoUrl);

  return (
    <div className="mb-6 sm:mb-8">
      {/* Video player with improved responsive handling */}
      <div className="mb-4 sm:mb-6 aspect-video w-full border border-zinc-800 rounded overflow-hidden shadow-lg">
        <YouTubePlayer videoId={videoId} />
      </div>

      <div className="text-center">
        {showDetails ? (
          <>
            <motion.h3
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white"
            >
              &quot;{songTitle}&quot;
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-xl text-gray-300"
            >
              by {artist}
            </motion.p>
            <AnimatePresence>
              {showRadioStation && radioStation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 sm:mt-4"
                >
                  <span className="px-2 sm:px-3 py-1 bg-amber-600 bg-opacity-20 text-amber-300 rounded-full text-xs sm:text-sm inline-block">
                    Radio Station: {radioStation}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <p className="text-base sm:text-lg text-gray-400">
            Guess which GTA game featured this song!
          </p>
        )}
      </div>
    </div>
  );
};

export default SongDisplay;
