import React, { useEffect, useRef, useState } from "react";
import loaderVideo from "../assets/loader2.mp4";

const Loader = ({ onFinish }) => {
  const videoRef = useRef(null);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleTimeUpdate = () => {
      // Check if video has reached its end
      if (video.currentTime >= video.duration && !hasPlayedOnce) {
        setHasPlayedOnce(true);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    const timer = setTimeout(() => {
      // Only finish after the first full play
      if (hasPlayedOnce && onFinish) onFinish();
      else {
        // Wait until next cycle completes
        const finishListener = () => {
          if (onFinish) onFinish();
          video.removeEventListener("ended", finishListener);
        };
        video.addEventListener("ended", finishListener);
      }
    }, 4000); // still keep the desired loader duration as minimum

    return () => {
      clearTimeout(timer);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [hasPlayedOnce, onFinish]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white overflow-hidden"
      style={{ width: "100vw", height: "100vh" }}
    >
      <video
        ref={videoRef}
        src={loaderVideo}
        autoPlay
        muted
        loop
        playsInline
        className="w-65 h-45 object-contain outline-none border-none"
        style={{ display: "block", boxShadow: "none" }}
      />
    </div>
  );
};

export default Loader;
