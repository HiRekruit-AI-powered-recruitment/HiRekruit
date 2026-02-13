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
  onRemoteParticipantJoin, // 🔴 NEW: Callback when HR joins (participant connects)
  livekitRoomRef, // 🔴 NEW: Accept livekitRoomRef from parent (InterviewPage)
}) => {
  // 🔴 If no livekitRoomRef provided, create one (fallback for legacy usage)
  if (!livekitRoomRef) {
    livekitRoomRef = useRef(null);
  }

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
            width: 640,
            height: 480,
            frameRate: 24,
          },
          facingMode: "user",
        },
        audioDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
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

          // 🔴 NEW: Restore audio when remote participant joins (e.g., HR joins)
          if (onRemoteParticipantJoin) {
            console.log(
              "🔊 Remote participant joined - triggering audio restoration...",
            );
            onRemoteParticipantJoin();
          }
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
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {
            resolution: {
              width: 640,
              height: 480,
              frameRate: 24,
            },
            facingMode: "user",
          },
        });

        console.log(`✅ Created ${tracks.length} local tracks`);

        // Store track references
        const videoTrack = tracks.find((t) => t.kind === Track.Kind.Video);
        const audioTrack = tracks.find((t) => t.kind === Track.Kind.Audio);

        console.log("📋 Track details:", {
          videoTrack: videoTrack
            ? {
                kind: videoTrack.kind,
                source: videoTrack.source,
                isMuted: videoTrack.isMuted,
              }
            : null,
          audioTrack: audioTrack
            ? {
                kind: audioTrack.kind,
                source: audioTrack.source,
                isMuted: audioTrack.isMuted,
              }
            : null,
        });

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

        // ✅ CRITICAL: Attach video track to the DOM using LiveKit's attach method
        // 🔴 ADD RETRY LOGIC: localVideoRef might not be set yet, try multiple times
        const attachVideoWithRetry = async () => {
          let retryCount = 0;
          const maxRetries = 30; // Increased retries for better reliability

          while (
            retryCount < maxRetries &&
            (!videoTrack || !localVideoRef.current)
          ) {
            if (!videoTrack) {
              console.warn(
                "⚠️ RETRY: videoTrack is still null, waiting...",
                retryCount,
              );
            }
            if (!localVideoRef.current) {
              console.warn(
                "⚠️ RETRY: localVideoRef.current is null, waiting...",
                retryCount,
              );
            }
            await new Promise((resolve) => setTimeout(resolve, 300)); // Reduced wait time
            retryCount++;
          }

          if (!videoTrack) {
            console.error(
              "❌ CRITICAL: videoTrack is still null after retries!",
            );
            return;
          }

          if (!localVideoRef.current) {
            console.error(
              "❌ CRITICAL: localVideoRef.current is still null after retries!",
            );
            console.log(
              "📹 This means the LocalVideoPanel component hasn't mounted yet",
            );
            return;
          }

          if (videoTrack && localVideoRef.current) {
            console.log(
              "📹 Attaching video track to DOM using LiveKit attach...",
            );
            console.log("📹 localVideoRef.current:", localVideoRef.current);

            // ⚠️ CRITICAL FIX: Check container dimensions
            const containerSize = {
              offsetWidth: localVideoRef.current.offsetWidth,
              offsetHeight: localVideoRef.current.offsetHeight,
              clientWidth: localVideoRef.current.clientWidth,
              clientHeight: localVideoRef.current.clientHeight,
            };
            console.log("📹 Container size:", containerSize);

            // 🚨 If container has zero dimensions, wait a bit
            if (
              containerSize.offsetWidth === 0 ||
              containerSize.offsetHeight === 0
            ) {
              console.warn(
                "⚠️ Container has zero dimensions! Waiting for layout...",
              );
              await new Promise((resolve) => setTimeout(resolve, 500));
              const containerSizeAfter = {
                offsetWidth: localVideoRef.current.offsetWidth,
                offsetHeight: localVideoRef.current.offsetHeight,
                clientWidth: localVideoRef.current.clientWidth,
                clientHeight: localVideoRef.current.clientHeight,
              };
              console.log("📹 Container size after wait:", containerSizeAfter);

              // 🚨 If STILL zero, force a minimum size
              if (containerSizeAfter.offsetWidth === 0) {
                console.error(
                  "❌ Container STILL has zero width! This is a critical layout issue",
                );
                // Try to force visibility
                localVideoRef.current.style.minWidth = "640px";
                localVideoRef.current.style.minHeight = "480px";
                console.log("🔴 Forced minimum dimensions on container");
              }
            }

            try {
              // Clear any existing content FIRST
              localVideoRef.current.innerHTML = "";
              console.log("✅ Cleared container");

              // 🔴 DEBUG: Check track properties BEFORE attaching
              console.log("📹 Track properties BEFORE attach:", {
                trackKind: videoTrack.kind,
                trackSource: videoTrack.source,
                trackSid: videoTrack.sid,
                trackIsMuted: videoTrack.isMuted,
                hasMediaStream: !!videoTrack.mediaStream,
                mediaStreamTracks:
                  videoTrack.mediaStream?.getTracks().length || 0,
              });

              // Use LiveKit's track.attach() method which properly creates a video element
              const videoElement = videoTrack.attach();

              console.log("📹 Video element created:", videoElement);
              console.log("📹 Video element tag:", videoElement.tagName);
              console.log("📹 Video element initial state:", {
                autoplay: videoElement.autoplay,
                paused: videoElement.paused,
                muted: videoElement.muted,
                srcObject: videoElement.srcObject,
                srcObjectTracks:
                  videoElement.srcObject?.getTracks().length || 0,
                readyState: videoElement.readyState,
                networkState: videoElement.networkState,
              });

              // ⚠️ CRITICAL: Ensure video element has proper configuration
              videoElement.autoplay = true;
              videoElement.playsInline = true;
              videoElement.muted = true; // Mute own video to prevent echo

              // 🔴 CRITICAL: Ensure video track is enabled and not muted
              if (videoTrack.isMuted) {
                console.warn("⚠️ Video track is muted, unmuting...");
                videoTrack.unmute();
              }

              // 🔴 CRITICAL: Check if video track has actual video content
              if (videoTrack.mediaStream) {
                const videoTracks = videoTrack.mediaStream.getVideoTracks();
                console.log("📹 Video tracks in stream:", videoTracks.length);
                videoTracks.forEach((track, index) => {
                  console.log(`📹 Track ${index}:`, {
                    enabled: track.enabled,
                    muted: track.muted,
                    readyState: track.readyState,
                    label: track.label,
                  });
                });
              }

              // 🔴 FALLBACK: If attach() didn't set srcObject, try several fallbacks
              if (!videoElement.srcObject) {
                // 1) Use track.mediaStream if available
                if (videoTrack.mediaStream) {
                  console.log(
                    "⚠️ FALLBACK: Setting srcObject from track.mediaStream",
                  );
                  videoElement.srcObject = videoTrack.mediaStream;
                  console.log(
                    "📹 srcObject set, tracks count:",
                    videoElement.srcObject.getTracks().length,
                  );
                } else {
                  // 2) Try to use underlying MediaStreamTrack (common for local tracks)
                  const underlying =
                    videoTrack.mediaStreamTrack ||
                    videoTrack.track ||
                    videoTrack._mediaStreamTrack;

                  if (underlying) {
                    try {
                      const ms = new MediaStream([underlying]);
                      videoElement.srcObject = ms;
                      console.log(
                        "⚠️ FALLBACK: Set srcObject from underlying MediaStreamTrack",
                        {
                          tracks: ms.getTracks().length,
                        },
                      );
                    } catch (e) {
                      console.error(
                        "❌ FALLBACK error creating MediaStream from underlying track:",
                        e,
                      );
                    }
                  } else {
                    // 3) As a last resort, log detailed track object for debugging
                    console.error(
                      "❌ CRITICAL: No srcObject on videoElement and no mediaStream/mediaStreamTrack on track!",
                    );
                    try {
                      console.log("📹 Track object:", videoTrack);
                    } catch (e) {
                      console.log("📹 Track (unable to stringify)");
                    }
                  }
                }
              }

              // Apply inline styles with !important where needed
              Object.assign(videoElement.style, {
                width: "100%",
                maxWidth: "100%",
                minWidth: "100%",
                height: "100%",
                maxHeight: "100%",
                minHeight: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
                display: "block",
                visibility: "visible",
                opacity: "1",
                pointerEvents: "auto",
                position: "relative",
                backgroundColor: "#000000",
              });

              // 🔴 CRITICAL: Use setProperty with !important to override any CSS rules
              videoElement.style.setProperty("display", "block", "important");
              videoElement.style.setProperty(
                "visibility",
                "visible",
                "important",
              );
              videoElement.style.setProperty("opacity", "1", "important");
              videoElement.style.setProperty("width", "100%", "important");
              videoElement.style.setProperty("height", "100%", "important");
              videoElement.style.setProperty(
                "position",
                "relative",
                "important",
              );
              videoElement.style.setProperty(
                "background-color",
                "#000000",
                "important",
              );

              videoElement.setAttribute("playsinline", "true");
              videoElement.setAttribute("autoplay", "true");
              videoElement.setAttribute("muted", "true");

              console.log("📹 Styles applied to video element");

              // Add event listeners BEFORE appending
              videoElement.onloadedmetadata = () => {
                console.log("✅ Video metadata loaded");
                console.log("📹 Video dimensions:", {
                  width: videoElement.videoWidth,
                  height: videoElement.videoHeight,
                  currentTime: videoElement.currentTime,
                  duration: videoElement.duration,
                });
              };

              videoElement.onplay = () => {
                console.log("✅ Local video PLAYING");
                console.log(
                  "📹 Video rendered size:",
                  videoElement.offsetWidth,
                  "x",
                  videoElement.offsetHeight,
                );
              };

              videoElement.onpause = () => {
                console.log("⏸️ Video paused");
              };

              videoElement.onloadstart = () => {
                console.log("📹 Video loadstart event fired");
              };

              videoElement.oncanplay = () => {
                console.log("✅ Video can play event fired");
              };

              videoElement.oncanplaythrough = () => {
                console.log("✅ Video can play through event fired");
              };

              videoElement.onerror = (e) => {
                console.error("❌ Video element error:", e);
                console.error("❌ Video error code:", videoElement.error?.code);
                console.error(
                  "❌ Video error message:",
                  videoElement.error?.message,
                );
              };

              // Store reference BEFORE appending
              videoElementRef.current = videoElement;

              // Append to container
              console.log("📹 Appending video element to DOM...");
              localVideoRef.current.appendChild(videoElement);

              // 🔴 CRITICAL: Ensure parent container is also visible and properly sized
              localVideoRef.current.style.setProperty(
                "display",
                "block",
                "important",
              );
              localVideoRef.current.style.setProperty(
                "visibility",
                "visible",
                "important",
              );
              localVideoRef.current.style.setProperty(
                "opacity",
                "1",
                "important",
              );
              localVideoRef.current.style.setProperty(
                "position",
                "relative",
                "important",
              );
              localVideoRef.current.style.setProperty(
                "width",
                "100%",
                "important",
              );
              localVideoRef.current.style.setProperty(
                "height",
                "100%",
                "important",
              );
              localVideoRef.current.style.setProperty(
                "background-color",
                "#000000",
                "important",
              );

              // 🔴 If parent still has zero size, log it and investigate the page structure
              const parentRect = localVideoRef.current.getBoundingClientRect();
              if (parentRect.width === 0 || parentRect.height === 0) {
                console.error(
                  "❌ CRITICAL: Parent container has zero size after appending video!",
                );
                console.error("Parent rect:", parentRect);
                console.error(
                  "Parent parent:",
                  localVideoRef.current.parentElement,
                );
              }

              console.log("✅ Video element appended to DOM");
              console.log("📹 Verification:", {
                inDOM: localVideoRef.current.contains(videoElement),
                childCount: localVideoRef.current.children.length,
                computedDisplay: window.getComputedStyle(videoElement).display,
                computedVisibility:
                  window.getComputedStyle(videoElement).visibility,
                offsetWidth: videoElement.offsetWidth,
                offsetHeight: videoElement.offsetHeight,
                parentOffsetWidth: localVideoRef.current.offsetWidth,
                parentOffsetHeight: localVideoRef.current.offsetHeight,
                srcObject: videoElement.srcObject ? "SET" : "NULL",
                srcObjectTracks:
                  videoElement.srcObject?.getTracks().length || 0,
              });

              // 🔴 DEBUG: Check if video element is actually visible in DOM
              console.log("📹 Parent container details:", {
                isDisplayed: localVideoRef.current.offsetParent !== null,
                computedStyle: window.getComputedStyle(localVideoRef.current),
                rect: localVideoRef.current.getBoundingClientRect(),
              });

              // Force layout reflow
              void videoElement.offsetWidth; // Trigger reflow

              // Attempt to play
              console.log("📹 Attempting to play video...");

              // 🔴 CRITICAL: Ensure video element has proper dimensions before playing
              if (
                videoElement.videoWidth === 0 ||
                videoElement.videoHeight === 0
              ) {
                console.warn(
                  "⚠️ Video has zero dimensions, waiting for metadata...",
                );
                // Wait a bit for metadata to load
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }

              const playPromise = videoElement.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log("✅ Video play() promise resolved");
                    // Check state after successful play
                    setTimeout(() => {
                      console.log("📹 Video state after play (delayed):", {
                        readyState: videoElement.readyState,
                        networkState: videoElement.networkState,
                        duration: videoElement.duration,
                        currentTime: videoElement.currentTime,
                        paused: videoElement.paused,
                        srcObject: videoElement.srcObject ? "SET" : "NULL",
                        srcObjectTracks:
                          videoElement.srcObject?.getTracks().length || 0,
                        videoWidth: videoElement.videoWidth,
                        videoHeight: videoElement.videoHeight,
                      });

                      // 🔴 CRITICAL: If video still has no dimensions after playing, try to force it
                      if (
                        videoElement.videoWidth === 0 ||
                        videoElement.videoHeight === 0
                      ) {
                        console.warn(
                          "⚠️ Video still has zero dimensions after play, attempting force...",
                        );
                        // Try to reload the video
                        if (videoElement.srcObject) {
                          const tracks = videoElement.srcObject.getTracks();
                          console.log(
                            "📹 Reloading video with tracks:",
                            tracks.length,
                          );
                          // Force video element to recognize the stream
                          videoElement.load();
                          videoElement
                            .play()
                            .catch((e) =>
                              console.error("❌ Retry play failed:", e),
                            );
                        }
                      }
                    }, 1000);

                    // 🔴 CONTINUOUS MONITORING: Check video state every 2 seconds
                    const monitorInterval = setInterval(() => {
                      if (!mountedRef.current) {
                        clearInterval(monitorInterval);
                        return;
                      }

                      const videoState = {
                        timestamp: new Date().toLocaleTimeString(),
                        readyState: videoElement.readyState,
                        networkState: videoElement.networkState,
                        paused: videoElement.paused,
                        videoWidth: videoElement.videoWidth,
                        videoHeight: videoElement.videoHeight,
                        currentTime: videoElement.currentTime,
                        srcObject: videoElement.srcObject ? "SET" : "NULL",
                      };

                      // Only log if video dimensions are still 0 (problem)
                      if (
                        videoElement.videoWidth === 0 ||
                        videoElement.videoHeight === 0
                      ) {
                        console.warn(
                          "⚠️ Video dimensions still 0:",
                          videoState,
                        );
                      }
                    }, 2000);
                  })
                  .catch((err) => {
                    console.error("❌ Video play() promise rejected:", err);
                    console.error("❌ Error code:", err.code || "Unknown");
                    console.error("❌ Error name:", err.name || "Unknown");
                    console.error("❌ Video element state when play failed:", {
                      readyState: videoElement.readyState,
                      networkState: videoElement.networkState,
                      srcObject: videoElement.srcObject ? "SET" : "NULL",
                    });
                  });
              }
            } catch (attachError) {
              console.error("❌ Error attaching video:", attachError);
              console.error("❌ Error type:", attachError.name);
              console.error("❌ Error message:", attachError.message);
              console.error("❌ Stack:", attachError.stack);
            }
          }
        };

        // 🔴 CALL THE RETRY FUNCTION
        await attachVideoWithRetry();

        // 🔴 NEW: Additional fallback - if video still not showing, try alternative approach
        setTimeout(async () => {
          if (mountedRef.current && videoTrack && localVideoRef.current) {
            const hasVideoContent =
              localVideoRef.current.querySelector("video");
            if (!hasVideoContent) {
              console.warn(
                "⚠️ No video element found in container, trying fallback attachment...",
              );

              try {
                // Clear container and try manual attachment
                localVideoRef.current.innerHTML = "";

                // Create video element manually
                const manualVideoElement = document.createElement("video");
                manualVideoElement.autoplay = true;
                manualVideoElement.muted = true;
                manualVideoElement.playsInline = true;
                manualVideoElement.style.cssText = `
                  width: 100% !important;
                  height: 100% !important;
                  object-fit: cover !important;
                  transform: scaleX(-1) !important;
                  display: block !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  position: relative !important;
                  background-color: #000000 !important;
                `;

                // Set srcObject directly from track
                if (videoTrack.mediaStream) {
                  manualVideoElement.srcObject = videoTrack.mediaStream;
                } else if (videoTrack.mediaStreamTrack) {
                  manualVideoElement.srcObject = new MediaStream([
                    videoTrack.mediaStreamTrack,
                  ]);
                }

                // Append and play
                localVideoRef.current.appendChild(manualVideoElement);

                const playResult = await manualVideoElement.play();
                console.log("✅ Fallback video attachment successful");

                // Store reference
                videoElementRef.current = manualVideoElement;
              } catch (fallbackError) {
                console.error(
                  "❌ Fallback video attachment failed:",
                  fallbackError,
                );
              }
            }
          }
        }, 3000); // Try fallback after 3 seconds

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
        console.log(
          "🔴 SETTING livekitConnected TO TRUE - VIDEO SHOULD NOW BE VISIBLE",
        );
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
    onRemoteParticipantJoin, // 🔴 NEW: Add callback to dependencies
    livekitRoomRef, // 🔴 NEW: Add livekitRoomRef to dependencies
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
