import React, { useEffect, useRef, useState } from "react";
import { Shield, Users, VideoOff } from "lucide-react";
import { Track } from "livekit-client";

const ParticipantVideo = ({ participant }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const isHRParticipant = participant.identity.startsWith("hr_");

  useEffect(() => {
    console.log(`🎬 Setting up participant: ${participant.identity}`);
    console.log(
      `📊 Video publications:`,
      participant.videoTrackPublications.size,
    );
    console.log(
      `📊 Audio publications:`,
      participant.audioTrackPublications.size,
    );

    const attachTrack = (track, publication) => {
      if (!track) {
        console.warn(`⚠️ Track is null for ${participant.identity}`);
        return;
      }

      console.log(
        `📎 Attaching ${track.kind} track for ${participant.identity}`,
      );
      console.log(`   - Track source:`, track.source);
      console.log(`   - Track sid:`, track.sid);
      console.log(`   - Is muted:`, track.isMuted);

      try {
        if (track.kind === Track.Kind.Video && videoRef.current) {
          // Clear existing video elements
          videoRef.current.innerHTML = "";

          // Attach video track
          const videoElement = track.attach();
          videoElement.style.width = "100%";
          videoElement.style.height = "100%";
          videoElement.style.objectFit = "cover";
          videoElement.autoplay = true;
          videoElement.playsInline = true;

          // Add error handler
          videoElement.onerror = (e) => {
            console.error(`❌ Video element error:`, e);
            setVideoError("Video playback error");
          };

          // Add play event
          videoElement.onplay = () => {
            console.log(`▶️ Video playing for ${participant.identity}`);
            setHasVideo(true);
            setVideoError(null);
          };

          videoRef.current.appendChild(videoElement);

          // Force play
          videoElement.play().catch((e) => {
            console.warn(`⚠️ Autoplay prevented:`, e);
          });

          console.log(`✅ Video attached for ${participant.identity}`);
          setHasVideo(true);
        } else if (track.kind === Track.Kind.Audio && audioRef.current) {
          // Clear existing audio elements
          audioRef.current.innerHTML = "";

          // Attach audio track
          const audioElement = track.attach();
          audioElement.autoplay = true;

          // Add error handler
          audioElement.onerror = (e) => {
            console.error(`❌ Audio element error:`, e);
          };

          // Add play event
          audioElement.onplay = () => {
            console.log(`🔊 Audio playing for ${participant.identity}`);
          };

          audioRef.current.appendChild(audioElement);

          // Force play
          audioElement.play().catch((e) => {
            console.warn(`⚠️ Audio autoplay prevented:`, e);
          });

          console.log(`✅ Audio attached for ${participant.identity}`);
        }
      } catch (error) {
        console.error(`❌ Error attaching ${track.kind}:`, error);
        if (track.kind === Track.Kind.Video) {
          setVideoError(error.message);
        }
      }
    };

    const detachTrack = (track) => {
      if (!track) return;

      console.log(
        `📌 Detaching ${track.kind} track for ${participant.identity}`,
      );

      try {
        if (track.kind === Track.Kind.Video && videoRef.current) {
          const elements = videoRef.current.querySelectorAll("video");
          elements.forEach((el) => {
            el.pause();
            el.src = "";
            el.load();
          });
          videoRef.current.innerHTML = "";
          setHasVideo(false);
          console.log(`✅ Video detached for ${participant.identity}`);
        } else if (track.kind === Track.Kind.Audio && audioRef.current) {
          const elements = audioRef.current.querySelectorAll("audio");
          elements.forEach((el) => {
            el.pause();
            el.src = "";
            el.load();
          });
          audioRef.current.innerHTML = "";
          console.log(`✅ Audio detached for ${participant.identity}`);
        }
      } catch (error) {
        console.error(`❌ Error detaching ${track.kind}:`, error);
      }
    };

    // Event handlers
    const handleTrackSubscribed = (track, publication) => {
      console.log(
        `📺 Track subscribed: ${track.kind} from ${participant.identity}`,
      );
      console.log(`   - Publication kind:`, publication.kind);
      console.log(`   - Publication source:`, publication.source);
      console.log(`   - Is muted:`, publication.isMuted);
      attachTrack(track, publication);
    };

    const handleTrackUnsubscribed = (track) => {
      console.log(
        `📺 Track unsubscribed: ${track.kind} from ${participant.identity}`,
      );
      detachTrack(track);
    };

    const handleTrackMuted = (publication) => {
      console.log(
        `🔇 Track muted: ${publication.kind} from ${participant.identity}`,
      );
      if (publication.kind === Track.Kind.Video) {
        setHasVideo(false);
      }
    };

    const handleTrackUnmuted = (publication) => {
      console.log(
        `🔊 Track unmuted: ${publication.kind} from ${participant.identity}`,
      );
      if (publication.kind === Track.Kind.Video && publication.track) {
        attachTrack(publication.track, publication);
      }
    };

    // Attach event listeners
    participant.on("trackSubscribed", handleTrackSubscribed);
    participant.on("trackUnsubscribed", handleTrackUnsubscribed);
    participant.on("trackMuted", handleTrackMuted);
    participant.on("trackUnmuted", handleTrackUnmuted);

    // Attach already subscribed tracks
    console.log(`🔍 Checking existing tracks for ${participant.identity}...`);

    participant.videoTrackPublications.forEach((publication) => {
      console.log(`   Video publication:`, {
        kind: publication.kind,
        source: publication.source,
        isSubscribed: publication.isSubscribed,
        isMuted: publication.isMuted,
        hasTrack: !!publication.track,
      });

      // ✅ FIXED: Attach video track if it exists and is subscribed
      // Don't check isMuted here - muted tracks can be unmuted later
      if (publication.track && publication.isSubscribed) {
        console.log(
          `   ✅ Attaching existing video track (muted: ${publication.isMuted})`,
        );
        attachTrack(publication.track, publication);
        setHasVideo(!publication.isMuted); // Set hasVideo based on muted state
      }
    });

    participant.audioTrackPublications.forEach((publication) => {
      console.log(`   Audio publication:`, {
        kind: publication.kind,
        source: publication.source,
        isSubscribed: publication.isSubscribed,
        isMuted: publication.isMuted,
        hasTrack: !!publication.track,
      });

      // ✅ FIXED: Attach audio track if it exists and is subscribed
      if (publication.track && publication.isSubscribed) {
        console.log(
          `   ✅ Attaching existing audio track (muted: ${publication.isMuted})`,
        );
        attachTrack(publication.track, publication);
      }
    });

    // Cleanup
    return () => {
      console.log(`🧹 Cleaning up participant: ${participant.identity}`);

      participant.off("trackSubscribed", handleTrackSubscribed);
      participant.off("trackUnsubscribed", handleTrackUnsubscribed);
      participant.off("trackMuted", handleTrackMuted);
      participant.off("trackUnmuted", handleTrackUnmuted);

      // Detach all tracks
      participant.videoTrackPublications.forEach((publication) => {
        if (publication.track) {
          detachTrack(publication.track);
        }
      });

      participant.audioTrackPublications.forEach((publication) => {
        if (publication.track) {
          detachTrack(publication.track);
        }
      });
    };
  }, [participant]);

  return (
    <div
      className={`relative bg-gray-900 rounded-xl overflow-hidden h-full border-3 ${
        isHRParticipant ? "border-purple-500" : "border-indigo-500"
      }`}
    >
      {/* 🎥 VIDEO CONTAINER */}
      <div
        ref={videoRef}
        className="absolute inset-0 w-full h-full bg-gray-900"
        style={{ zIndex: hasVideo ? 10 : 0 }}
      />

      {/* 🔊 AUDIO CONTAINER (HIDDEN) */}
      <div ref={audioRef} className="hidden" />

      {/* 👤 FALLBACK UI */}
      {!hasVideo && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
          style={{ zIndex: 5 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              {isHRParticipant ? (
                <Shield className="w-8 h-8 text-purple-400" />
              ) : (
                <Users className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-2 justify-center mb-2">
              <VideoOff className="w-4 h-4 text-gray-400" />
              <p className="text-gray-300 text-sm font-medium">
                {videoError ? "Video error" : "Camera off"}
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              {participant.identity.replace(/_/g, " ")}
            </p>
            {videoError && (
              <p className="text-red-400 text-xs mt-1">{videoError}</p>
            )}
          </div>
        </div>
      )}

      {/* PARTICIPANT NAME LABEL */}
      <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1.5 rounded-full text-white text-xs font-medium z-20">
        {participant.identity.replace(/_/g, " ")}
      </div>

      {/* HR BADGE */}
      {isHRParticipant && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold z-20">
          HR
        </div>
      )}

      {/* DEBUG INFO (Remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white z-20">
          {hasVideo ? "✅ Video" : "❌ No Video"}
        </div>
      )}
    </div>
  );
};

export default ParticipantVideo;
