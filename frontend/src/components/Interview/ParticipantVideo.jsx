import React, { useRef, useEffect, useState } from "react";
import { Shield, Users } from "lucide-react";
import { Track } from "livekit-client";

const ParticipantVideo = ({ participant }) => {
  const videoRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);
  const isHRParticipant = participant.identity.startsWith("hr_");

  useEffect(() => {
    const videoPublications = Array.from(
      participant.videoTrackPublications.values()
    );

    if (videoPublications.length > 0) {
      const publication = videoPublications[0];

      if (publication.track) {
        if (videoRef.current) {
          publication.track.attach(videoRef.current);
          setHasVideo(true);
        }
      }

      const handleTrackSubscribed = (track) => {
        if (track.kind === Track.Kind.Video && videoRef.current) {
          track.attach(videoRef.current);
          setHasVideo(true);
        }
      };

      participant.on("trackSubscribed", handleTrackSubscribed);

      return () => {
        participant.off("trackSubscribed", handleTrackSubscribed);
        if (publication.track && videoRef.current) {
          publication.track.detach(videoRef.current);
        }
      };
    }
  }, [participant]);

  return (
    <div
      className={`relative bg-gray-900 rounded-xl overflow-hidden shadow-xl h-full ${
        isHRParticipant
          ? "border-3 border-purple-500"
          : "border-3 border-indigo-500"
      }`}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
              {isHRParticipant ? (
                <Shield className="w-8 h-8 text-purple-400" />
              ) : (
                <Users className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-gray-300 text-sm font-medium">
              {participant.identity.replace(/_/g, " ")}
            </p>
            <p className="text-gray-500 text-xs mt-1">No video</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
        {isHRParticipant && <Shield className="w-3 h-3 text-purple-400" />}
        <p className="text-white text-xs font-semibold">
          {participant.identity.replace(/_/g, " ")}
        </p>
      </div>
      {isHRParticipant && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
          HR
        </div>
      )}
    </div>
  );
};

export default ParticipantVideo;
