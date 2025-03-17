"use client";

import { useEffect, useRef } from "react";

interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  autoplay = true,
}) => {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If no videoId is provided, don't attempt to create player
    if (!videoId) return;

    // Create a simple iframe
    if (playerRef.current) {
      playerRef.current.innerHTML = "";
      const iframe = document.createElement("iframe");

      // Set proper sizing
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.position = "absolute";
      iframe.style.top = "0";
      iframe.style.left = "0";

      // Set YouTube source with appropriate parameters
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=${
        autoplay ? "1" : "0"
      }&origin=${window.location.origin}&modestbranding=1&rel=0&showinfo=0`;

      iframe.title = "YouTube video player";
      iframe.frameBorder = "0";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      playerRef.current.appendChild(iframe);
    }

    return () => {
      // Clean up
      if (playerRef.current) {
        playerRef.current.innerHTML = "";
      }
    };
  }, [videoId, autoplay]);

  // Use a wrapper div with proper aspect ratio for responsive sizing
  return (
    <div
      className="relative w-full"
      style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}
    >
      <div
        ref={playerRef}
        className="absolute top-0 left-0 w-full h-full"
      ></div>
    </div>
  );
};

export default YouTubePlayer;
