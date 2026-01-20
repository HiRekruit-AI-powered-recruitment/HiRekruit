import { useRef, useCallback } from "react";
import { Room, RoomEvent, Track } from "livekit-client";

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
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const videoElementRef = useRef(null); // Store video element reference

  const initializeLiveKit = useCallback(async () => {
    if (hasInitializedRef.current || initializingRef.current) {
      console.log("⏭️ LiveKit already initialized or initializing");
      return;
    }

    initializingRef.current = true;
    console.log("🎥 Initializing LiveKit...");

    try {
      setIsLoadingLiveKit(true);

      // Generate identity
      const identity = isHR
        ? `hr_${hrName.replace(/\s+/g, "_")}_${Date.now()}`
        : `candidate_${driveCandidateId}`;

      console.log(`📋 Identity: ${identity}`);

      // Fetch token
      const tokenResponse = await fetch(
        `${BASE_URL}/api/livekit/token?` +
          new URLSearchParams({
            driveCandidateId,
            type: interviewType,
            role: isHR ? "hr" : "candidate",
            identity,
          }),
      );

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get token: ${tokenResponse.status}`);
      }

      const { token, livekitUrl, roomName } = await tokenResponse.json();
      console.log(`🔑 Token received for room: ${roomName}`);

      // Create room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
      });

      livekitRoomRef.current = room;

      // Setup event listeners
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log(
          `📺 Track subscribed from ${participant.identity}:`,
          track.kind,
        );
        if (mountedRef.current) {
          setRemoteParticipants(Array.from(room.remoteParticipants.values()));
        }
      });

      room.on(
        RoomEvent.TrackUnsubscribed,
        (track, publication, participant) => {
          console.log(`📺 Track unsubscribed from ${participant.identity}`);
          if (mountedRef.current) {
            setRemoteParticipants(Array.from(room.remoteParticipants.values()));
          }
        },
      );

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log(`👤 Participant connected: ${participant.identity}`);
        if (mountedRef.current) {
          setRemoteParticipants(Array.from(room.remoteParticipants.values()));
        }
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log(`👋 Participant disconnected: ${participant.identity}`);
        if (mountedRef.current) {
          setRemoteParticipants(Array.from(room.remoteParticipants.values()));
        }
      });

      room.on(RoomEvent.LocalTrackPublished, (publication) => {
        console.log("✅ Local track published:", publication.kind);
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("📴 Room disconnected");
        if (mountedRef.current) {
          setLivekitConnected(false);
        }
      });

      // Connect to room
      console.log("🔌 Connecting to LiveKit room...");
      await room.connect(livekitUrl, token);
      console.log("✅ Connected to LiveKit room");

      if (!mountedRef.current) {
        room.disconnect();
        return;
      }

      // Request camera/mic permissions and publish
      try {
        console.log("🎥 Requesting camera and microphone...");

        const tracks = await room.localParticipant.createTracks({
          audio: true,
          video: {
            resolution: {
              width: 1280,
              height: 720,
              frameRate: 30,
            },
          },
        });

        console.log(`✅ Created ${tracks.length} local tracks`);

        // Store track references
        const videoTrack = tracks.find((t) => t.kind === Track.Kind.Video);
        const audioTrack = tracks.find((t) => t.kind === Track.Kind.Audio);

        if (videoTrack) {
          localVideoTrackRef.current = videoTrack;
          console.log("✅ Video track reference stored");
        }
        if (audioTrack) {
          localAudioTrackRef.current = audioTrack;
          console.log("✅ Audio track reference stored");
        }

        // Publish tracks
        for (const track of tracks) {
          await room.localParticipant.publishTrack(track);
          console.log(`📤 Published ${track.kind} track`);
        }

        // ✅ CRITICAL: Attach video track to the DOM
        if (videoTrack && localVideoRef.current) {
          console.log("📹 Attaching video track to DOM...");

          try {
            // Clear any existing content
            localVideoRef.current.innerHTML = "";

            // Get the MediaStreamTrack from LiveKit track
            const mediaStreamTrack = videoTrack.mediaStreamTrack;
            console.log("📹 MediaStreamTrack obtained:", mediaStreamTrack);

            // Create MediaStream
            const mediaStream = new MediaStream([mediaStreamTrack]);
            console.log("📹 MediaStream created:", mediaStream);

            // Create video element
            const videoElement = document.createElement("video");
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            videoElement.muted = true; // Mute own video to prevent echo
            videoElement.style.width = "100%";
            videoElement.style.height = "100%";
            videoElement.style.objectFit = "cover";
            videoElement.style.transform = "scaleX(-1)"; // Mirror effect

            // Set srcObject
            videoElement.srcObject = mediaStream;

            // Add event listeners
            videoElement.onloadedmetadata = () => {
              console.log("✅ Video metadata loaded");
              videoElement
                .play()
                .then(() => console.log("✅ Video playing"))
                .catch((err) => console.error("❌ Video play error:", err));
            };

            videoElement.onerror = (e) => {
              console.error("❌ Video element error:", e);
            };

            // Store reference
            videoElementRef.current = videoElement;

            // Append to container
            localVideoRef.current.appendChild(videoElement);

            console.log("✅ Video element attached to DOM");
            console.log("📹 Video element playing:", !videoElement.paused);
          } catch (attachError) {
            console.error("❌ Error attaching video:", attachError);
          }
        }

        if (mountedRef.current) {
          setLocalTracks(tracks);
          setCameraPermission("granted");
        }

        console.log("✅ All tracks published successfully");
      } catch (permissionError) {
        console.warn("⚠️ Camera/Mic permission denied:", permissionError);
        if (mountedRef.current) {
          setCameraPermission("denied");
          setConnectionError(
            "Camera or microphone access denied. You can still join with audio only.",
          );
        }
      }

      if (mountedRef.current) {
        setLivekitConnected(true);
        setRemoteParticipants(Array.from(room.remoteParticipants.values()));
        hasInitializedRef.current = true;
      }

      console.log("✅ LiveKit initialization complete");
    } catch (error) {
      console.error("❌ LiveKit initialization error:", error);
      if (mountedRef.current) {
        setConnectionError(`Failed to connect: ${error.message}`);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoadingLiveKit(false);
      }
      initializingRef.current = false;
    }
  }, [
    driveCandidateId,
    interviewType,
    isHR,
    hrName,
    userData,
    mountedRef,
    hasInitializedRef,
    initializingRef,
    setIsLoadingLiveKit,
    setLivekitConnected,
    setLocalTracks,
    setCameraPermission,
    setConnectionError,
    setRemoteParticipants,
  ]);

  const stopCamera = useCallback((tracks) => {
    console.log("🛑 Stopping camera and microphone");
    tracks.forEach((track) => {
      try {
        track.stop();
        console.log(`✅ Stopped ${track.kind} track`);
      } catch (error) {
        console.error(`❌ Error stopping ${track.kind} track:`, error);
      }
    });

    // Clear video element
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
      videoElementRef.current = null;
    }
  }, []);

  const toggleVideo = useCallback((isVideoOff, setIsVideoOff) => {
    console.log("🎥 Toggle video called. Current state (off):", isVideoOff);

    const videoTrack = localVideoTrackRef.current;
    const videoElement = videoElementRef.current;

    if (!videoTrack) {
      console.warn("⚠️ Video track not available");
      return;
    }

    try {
      if (isVideoOff) {
        // Currently off, turn it ON
        videoTrack.unmute();
        if (videoElement) {
          videoElement.style.display = "block";
        }
        setIsVideoOff(false);
        console.log("✅ Video ENABLED (unmuted)");
      } else {
        // Currently on, turn it OFF
        videoTrack.mute();
        if (videoElement) {
          videoElement.style.display = "none";
        }
        setIsVideoOff(true);
        console.log("✅ Video DISABLED (muted)");
      }
    } catch (error) {
      console.error("❌ Error toggling video:", error);
    }
  }, []);

  const toggleAudio = useCallback((isMuted, setIsMuted) => {
    console.log("🎤 Toggle audio called. Current state (muted):", isMuted);

    const audioTrack = localAudioTrackRef.current;

    if (!audioTrack) {
      console.warn("⚠️ Audio track not available");
      return;
    }

    try {
      if (isMuted) {
        // Currently muted, UNMUTE it
        audioTrack.unmute();
        setIsMuted(false);
        console.log("✅ Audio ENABLED (unmuted)");
      } else {
        // Currently unmuted, MUTE it
        audioTrack.mute();
        setIsMuted(true);
        console.log("✅ Audio DISABLED (muted)");
      }
    } catch (error) {
      console.error("❌ Error toggling audio:", error);
    }
  }, []);

  return {
    livekitRoomRef,
    localVideoRef,
    localVideoTrackRef,
    localAudioTrackRef,
    initializeLiveKit,
    stopCamera,
    toggleVideo,
    toggleAudio,
  };
};
