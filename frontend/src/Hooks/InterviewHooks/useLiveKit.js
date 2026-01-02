import { useCallback, useRef } from "react";
import { Room, RoomEvent, Track, createLocalTracks } from "livekit-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useLiveKit = ({
  driveCandidateId,
  interviewType,
  isHR,
  hrName,
  userData,
  interviewStarted,
  mountedRef,
  hasInitializedRef,
  initializingRef,
  setIsLoadingLiveKit,
  setLivekitConnected,
  setLocalTracks,
  setCameraPermission,
  setConnectionError,
  setFullTranscript,
  setRemoteParticipants,
}) => {
  const livekitRoomRef = useRef(null);
  const localVideoRef = useRef(null);

  const updateRemoteParticipants = useCallback(
    (room) => {
      if (!mountedRef.current) return;
      const participants = Array.from(room.remoteParticipants.values());
      console.log("📊 Remote participants:", participants.length);
      setRemoteParticipants(participants);
    },
    [mountedRef, setRemoteParticipants]
  );

  const initializeLiveKit = useCallback(async () => {
    if (initializingRef.current || hasInitializedRef.current) {
      console.log("⚠️ LiveKit initialization blocked");
      return;
    }

    if (!mountedRef.current) {
      console.log("⚠️ Component unmounted, skipping LiveKit init");
      return;
    }

    try {
      initializingRef.current = true;
      setIsLoadingLiveKit(true);
      console.log("🎥 Initializing LiveKit...");

      const role = isHR ? "hr" : "candidate";
      const identity = isHR
        ? `hr_${hrName.replace(/\s+/g, "_")}`
        : `candidate_${userData?.name?.replace(/\s+/g, "_") || "user"}`;

      console.log(`🔑 Requesting token for ${role}: ${identity}`);

      const response = await fetch(
        `${BASE_URL}/api/livekit/token?driveCandidateId=${driveCandidateId}&type=${interviewType}&role=${role}&identity=${identity}`
      );

      if (!response.ok) {
        throw new Error("Failed to get LiveKit token");
      }

      const data = await response.json();
      const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;

      if (!livekitUrl) {
        throw new Error("LiveKit URL is missing in environment");
      }

      console.log(`🌐 Connecting to LiveKit: ${data.roomName}`);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 30 },
        },
        // Add connection timeout and retry settings
        reconnectPolicy: {
          maxRetries: 3,
          retryDelays: [1000, 2000, 3000],
        },
      });

      // Set up event listeners
      room
        .on(RoomEvent.ParticipantConnected, (participant) => {
          if (!mountedRef.current) return;
          console.log("✅ Participant connected:", participant.identity);
          updateRemoteParticipants(room);

          if (participant.identity.startsWith("hr_") && interviewStarted) {
            const hrJoinMessage = {
              role: "system",
              content: `👥 ${participant.identity.replace(
                /_/g,
                " "
              )} joined the interview`,
              timestamp: new Date().toISOString(),
            };
            setFullTranscript((prev) => [...prev, hrJoinMessage]);
          }
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          if (!mountedRef.current) return;
          console.log("❌ Participant disconnected:", participant.identity);
          updateRemoteParticipants(room);

          if (participant.identity.startsWith("hr_")) {
            const hrLeaveMessage = {
              role: "system",
              content: `👋 ${participant.identity.replace(
                /_/g,
                " "
              )} left the interview`,
              timestamp: new Date().toISOString(),
            };
            setFullTranscript((prev) => [...prev, hrLeaveMessage]);
          }
        })
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (!mountedRef.current) return;
          console.log("📹 Track subscribed:", track.kind, participant.identity);
          if (track.kind === Track.Kind.Video) {
            updateRemoteParticipants(room);
          }
        })
        .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          if (!mountedRef.current) return;
          console.log(
            "📹 Track unsubscribed:",
            track.kind,
            participant.identity
          );
          updateRemoteParticipants(room);
        })
        .on(RoomEvent.LocalTrackPublished, (publication) => {
          console.log("📤 Local track published:", publication.kind);
        })
        .on(RoomEvent.Disconnected, () => {
          console.log("🔌 Disconnected from room");
          if (mountedRef.current) {
            setLivekitConnected(false);
          }
        });

      console.log("🔗 Connecting to LiveKit room...");
      await room.connect(livekitUrl, data.token);

      if (!mountedRef.current) {
        console.log("⚠️ Component unmounted during connection, cleaning up");
        await room.disconnect();
        return;
      }

      console.log("✅ Connected to LiveKit room:", data.roomName);

      livekitRoomRef.current = room;
      setLivekitConnected(true);

      // Wait longer for connection to stabilize before publishing tracks
      console.log("⏳ Waiting for connection to stabilize...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Increased from 1s to 2s

      if (!mountedRef.current) {
        console.log("⚠️ Component unmounted, skipping track creation");
        return;
      }

      // Verify room is still connected
      if (!room || room.state === "disconnected") {
        throw new Error("Room disconnected before track creation");
      }

      console.log("🎤 Requesting local media tracks...");
      try {
        const tracks = await createLocalTracks({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {
            resolution: { width: 1280, height: 720 },
          },
        });

        if (!mountedRef.current) {
          console.log("⚠️ Component unmounted, stopping tracks");
          tracks.forEach((track) => track.stop());
          return;
        }

        console.log(`✅ Got ${tracks.length} local tracks`);

        // Store local tracks FIRST before publishing
        setLocalTracks(tracks);

        // Attach local video track to the video element BEFORE publishing
        const videoTrack = tracks.find((t) => t.kind === Track.Kind.Video);
        const audioTrack = tracks.find((t) => t.kind === Track.Kind.Audio);

        if (videoTrack && localVideoRef.current) {
          const element = videoTrack.attach();
          localVideoRef.current.innerHTML = "";
          localVideoRef.current.appendChild(element);
          console.log("✅ Video track attached to element (before publish)");
        }

        // Publish audio track first (usually faster)
        if (audioTrack) {
          try {
            console.log("📤 Publishing audio track...");
            await room.localParticipant.publishTrack(audioTrack, {
              name: "microphone",
            });
            console.log("✅ Audio track published successfully");
          } catch (audioError) {
            console.error(
              "⚠️ Failed to publish audio track:",
              audioError.message
            );
            // Continue anyway - video might still work
          }
        }

        // Small delay between audio and video
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Publish video track
        if (videoTrack) {
          try {
            console.log("📤 Publishing video track...");
            await room.localParticipant.publishTrack(videoTrack, {
              name: "camera",
              simulcast: true, // Enable simulcast for better quality adaptation
            });
            console.log("✅ Video track published successfully");
          } catch (videoError) {
            console.error(
              "⚠️ Failed to publish video track:",
              videoError.message
            );
            // Local preview should still work even if publish fails
            console.log("ℹ️ Local video preview is still available");
          }
        }

        setCameraPermission("granted");
        console.log("✅ Camera permission granted");
      } catch (mediaError) {
        console.error("⚠️ Media access error:", mediaError);
        if (mediaError.name === "NotAllowedError") {
          setCameraPermission("denied");
          console.log("⚠️ Camera/mic denied, but room connection is OK");
        }
      }

      setIsLoadingLiveKit(false);
      hasInitializedRef.current = true;
      updateRemoteParticipants(room);

      console.log("✅ LiveKit initialization complete");
    } catch (error) {
      console.error("❌ LiveKit initialization error:", error);
      if (mountedRef.current) {
        setConnectionError(`Failed to connect video: ${error.message}`);
        setIsLoadingLiveKit(false);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [
    driveCandidateId,
    interviewType,
    isHR,
    hrName,
    userData,
    interviewStarted,
    mountedRef,
    hasInitializedRef,
    initializingRef,
    setIsLoadingLiveKit,
    setLivekitConnected,
    setLocalTracks,
    setCameraPermission,
    setConnectionError,
    setFullTranscript,
    updateRemoteParticipants,
  ]);

  const stopCamera = useCallback(
    (tracks) => {
      console.log("🛑 Stopping camera and cleaning up...");

      if (livekitRoomRef.current) {
        try {
          livekitRoomRef.current.disconnect();
        } catch (error) {
          console.error("Error disconnecting room:", error);
        }
        livekitRoomRef.current = null;
      }

      // Stop local tracks if provided
      if (tracks && tracks.length > 0) {
        tracks.forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.error("Error stopping track:", error);
          }
        });
      }

      if (mountedRef.current) {
        setLivekitConnected(false);
        setLocalTracks([]);
      }

      console.log("✅ Camera stopped and cleaned up");
    },
    [mountedRef, setLivekitConnected, setLocalTracks]
  );

  const toggleVideo = useCallback((isVideoOff, setIsVideoOff) => {
    const room = livekitRoomRef.current;
    if (!room) return;

    const newState = !isVideoOff;
    room.localParticipant.setCameraEnabled(!newState);
    setIsVideoOff(newState);
    console.log(`📹 Video ${newState ? "disabled" : "enabled"}`);
  }, []);

  const toggleAudio = useCallback((isMuted, setIsMuted) => {
    const room = livekitRoomRef.current;
    if (!room) return;

    const newState = !isMuted;
    room.localParticipant.setMicrophoneEnabled(!newState);
    setIsMuted(newState);
    console.log(`🎤 Audio ${newState ? "disabled" : "enabled"}`);
  }, []);

  return {
    livekitRoomRef,
    localVideoRef,
    initializeLiveKit,
    stopCamera,
    toggleVideo,
    toggleAudio,
  };
};
