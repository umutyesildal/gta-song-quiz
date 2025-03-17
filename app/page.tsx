"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [difficulty, setDifficulty] = useState<"regular" | "pro">("regular");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="gta-title text-6xl mb-6">GTA: San Andreas</h1>
        <h2 className="gta-title text-5xl mb-10">Radio Quiz</h2>

        <p className="text-xl mb-8">
          Test your knowledge of the radio stations in Grand Theft Auto: San
          Andreas!
          <br />
          Can you remember which station played your favorite songs?
        </p>
      </div>

      <div className="bg-black bg-opacity-70 p-8 rounded-lg max-w-lg w-full mb-8">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Select Difficulty
        </h3>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <button
            onClick={() => setDifficulty("regular")}
            className={`flex-1 py-4 px-4 rounded-lg text-lg font-bold transition-all ${
              difficulty === "regular"
                ? "bg-gta-green text-black"
                : "bg-zinc-700"
            }`}
          >
            Regular Mode
            <p className="text-sm font-normal mt-2">
              Popular hits from the radio stations
              <br />
              Perfect if you're a casual GTA player
            </p>
          </button>

          <button
            onClick={() => setDifficulty("pro")}
            className={`flex-1 py-4 px-4 rounded-lg text-lg font-bold transition-all ${
              difficulty === "pro" ? "bg-gta-red text-black" : "bg-zinc-700"
            }`}
          >
            Pro Mode
            <p className="text-sm font-normal mt-2">
              Deep cuts and obscure tracks
              <br />
              For true GTA San Andreas fans
            </p>
          </button>
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-400">
            Quiz contains 5 questions • Listen to songs after answering
          </p>
        </div>

        <Link href={`/quiz?mode=${difficulty}`}>
          <button className="w-full py-4 px-6 bg-gta-yellow text-black text-xl font-bold rounded-lg hover:bg-opacity-90 transition-all">
            Start Quiz
          </button>
        </Link>
      </div>

      <div className="text-center text-zinc-400 text-sm">
        <p>Created with ❤️ for GTA fans everywhere</p>
      </div>
    </main>
  );
}
