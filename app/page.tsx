"use client";

import { useState, useEffect } from "react";
import DailySongGame from "@/components/DailySongGame";
import YesterdaySong from "@/components/YesterdaySong";
import { motion } from "framer-motion";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ songs: any[]; gameNames: string[] }>({
    songs: [],
    gameNames: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Try to load the curated songs first
        let response = await fetch("/data/curated-songs.json");

        // If curated songs don't exist or there's an error, fall back to the full list
        if (!response.ok) {
          console.log("Falling back to full songs list");
          response = await fetch("/data/songs.json");
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const jsonData = await response.json();

        if (!jsonData.songs || !jsonData.gameNames) {
          throw new Error("Invalid data format");
        }

        setData({
          songs: jsonData.songs,
          gameNames: jsonData.gameNames,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-4 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8" // Reduced vertical margin
      >
        <h1 className="gta-title text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 inline-block">
          GTA Song of the Day
        </h1>
        <div className="accent-line w-16 sm:w-24 mx-auto mb-3 sm:mb-4"></div>
        <p className="text-gray-300 text-sm sm:text-base px-4">
          Test your Grand Theft Auto music knowledge!
        </p>

        {/* Only show yesterday's song if data is loaded */}
        {!loading && !error && <YesterdaySong songs={data.songs} />}
      </motion.div>

      <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-4 sm:p-8 gta-container rounded-lg"
          >
            <div className="w-12 h-12 border-4 border-gta-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading today's song...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="gta-container p-4 sm:p-6 rounded-lg text-center"
          >
            <h2 className="gta-title text-xl sm:text-2xl mb-4">Error</h2>
            <p className="mb-4 text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gta-yellow text-black rounded font-medium"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <DailySongGame songs={data.songs} gameNames={data.gameNames} />
        )}
      </div>

      <div className="text-center text-zinc-500 text-xs sm:text-sm mt-6 sm:mt-8">
        <p>
          Created for GTA fans everywhere ·{" "}
          <a
            href="https://gta-song-quiz.vercel.app/"
            className="hover:text-zinc-400"
          >
            gta-song-quiz.vercel.app
          </a>
        </p>
      </div>
    </main>
  );
}
