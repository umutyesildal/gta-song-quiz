import React, { useState, useEffect } from "react";
import { getSongForDay } from "@/utils/helpers";
import { Song } from "@/types";
import { motion } from "framer-motion";

interface YesterdaySongProps {
  songs: Song[];
}

const YesterdaySong: React.FC<YesterdaySongProps> = ({ songs }) => {
  const [yesterdaySong, setYesterdaySong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadYesterdaySong() {
      try {
        // Calculate yesterday's date
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Format to YYYY-MM-DD
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        // Get yesterday's song
        const song = await getSongForDay(songs, yesterdayStr);
        setYesterdaySong(song);
      } catch (error) {
        console.error("Failed to load yesterday's song:", error);
      } finally {
        setLoading(false);
      }
    }

    if (songs && songs.length > 0) {
      loadYesterdaySong();
    }
  }, [songs]);

  if (loading || !yesterdaySong) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="text-xs text-zinc-500 text-center mt-2"
    >
      Yesterday's song: "{yesterdaySong.song_title}" by {yesterdaySong.artist}
    </motion.div>
  );
};

export default YesterdaySong;
