import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Loader2,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  AlertCircle,
  Settings,
} from "lucide-react";

/**
 * D-ID Live Real Avatar Component
 *
 * This component creates a photorealistic AI avatar using D-ID's streaming API.
 * The avatar will speak in real-time based on your AI responses.
 *
 * Setup:
 * 1. Sign up at https://www.d-id.com
 * 2. Get your API key from the dashboard
 * 3. Add to .env: VITE_APP_DID_API_KEY=your_key_here
 */
const DIDRealAvatar = ({
  onReady,
  onError,
  onSpeakingStateChange,
  avatarConfig = {
    // You can use:
    // 1. D-ID's stock avatars (free tier available)
    imageUrl: "https://create-images-results.d-id.com/default_presenter.jpg",
    // 2. Upload your own image
    // imageUrl: 'https://your-image-url.jpg',
    // 3. Custom presenter ID
    // presenterId: 'amy-jcwCkr1grs',
  },
  voiceConfig = {
    provider: "microsoft", // 'microsoft', 'elevenlabs', 'amazon'
    voiceId: "en-US-JennyNeural", // Microsoft Azure voice
    // For ElevenLabs: voiceId: '21m00Tcm4TlvDq8ikWAM' (Rachel)
  },
  autoStart = true,
}) => {
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const streamIdRef = useRef(null);
  const dataChannelRef = useRef(null);

  const [status, setStatus] = useState("initializing"); // initializing, connecting, ready, speaking, error, disconnected
  const [error, setError] = useState(null);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState("good"); // good, fair, poor

  // Initialize D-ID stream
  const initializeStream = useCallback(async () => {
    try {
      setStatus("connecting");
      setError(null);

      console.log("🎬 Creating D-ID stream...");

      // Create new D-ID stream
      const response = await fetch("https://api.d-id.com/talks/streams", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(process.env.VITE_APP_DID_API_KEY + ":")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_url: avatarConfig.imageUrl,
          ...(avatarConfig.presenterId && {
            presenter_id: avatarConfig.presenterId,
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to create stream: ${response.statusText}`,
        );
      }

      const {
        id: streamId,
        offer,
        ice_servers: iceServers,
        session_id: sessionId,
      } = await response.json();

      console.log("✅ Stream created:", streamId);
      streamIdRef.current = streamId;

      // Setup WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: iceServers || [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = peerConnection;

      // Handle incoming video/audio tracks
      peerConnection.ontrack = (event) => {
        console.log("📺 Received track:", event.track.kind);
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      // Monitor connection state
      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          "🔌 ICE connection state:",
          peerConnection.iceConnectionState,
        );

        if (peerConnection.iceConnectionState === "connected") {
          setStatus("ready");
          setConnectionQuality("good");
        } else if (peerConnection.iceConnectionState === "disconnected") {
          setConnectionQuality("poor");
        } else if (peerConnection.iceConnectionState === "failed") {
          setError("Connection failed. Please check your network.");
          setStatus("error");
        }
      };

      // Setup data channel for events
      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannelRef.current = dataChannel;

        dataChannel.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("📨 D-ID message:", message);

            // Handle speaking state changes
            if (message.type === "status") {
              if (message.status === "started") {
                setStatus("speaking");
                onSpeakingStateChange?.(true);
              } else if (message.status === "done") {
                setStatus("ready");
                onSpeakingStateChange?.(false);
              }
            }
          } catch (err) {
            console.error("Error parsing data channel message:", err);
          }
        };
      };

      // Set remote description (D-ID's offer)
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer),
      );

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer to D-ID
      const answerResponse = await fetch(
        `https://api.d-id.com/talks/streams/${streamId}/sdp`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(process.env.VITE_APP_DID_API_KEY + ":")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: answer,
            session_id: sessionId,
          }),
        },
      );

      if (!answerResponse.ok) {
        throw new Error("Failed to establish connection with D-ID");
      }

      console.log("✅ WebRTC connection established");
      setStatus("ready");
      onReady?.();
    } catch (err) {
      console.error("❌ Avatar initialization error:", err);
      setError(err.message);
      setStatus("error");
      onError?.(err);
    }
  }, [avatarConfig, onReady, onError, onSpeakingStateChange]);

  // Make avatar speak
  const speak = useCallback(
    async (text, config = {}) => {
      if (!streamIdRef.current) {
        console.error("Stream not initialized");
        throw new Error("Avatar not ready");
      }

      if (!text || text.trim().length === 0) {
        console.warn("Empty text provided to speak");
        return;
      }

      try {
        console.log("🗣️ Making avatar speak:", text.substring(0, 50) + "...");
        setStatus("speaking");

        const response = await fetch(
          `https://api.d-id.com/talks/streams/${streamIdRef.current}`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${btoa(process.env.VITE_APP_DID_API_KEY + ":")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              script: {
                type: "text",
                input: text,
                provider: {
                  type: voiceConfig.provider,
                  voice_id: voiceConfig.voiceId,
                },
                ssml: config.ssml || false,
              },
              config: {
                fluent: true,
                pad_audio: 0,
                stitch: true,
                ...config,
              },
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to make avatar speak");
        }

        console.log("✅ Speak command sent successfully");
      } catch (err) {
        console.error("❌ Speak error:", err);
        setStatus("ready");
        throw err;
      }
    },
    [voiceConfig],
  );

  // Cleanup and destroy stream
  const cleanup = useCallback(async () => {
    console.log("🧹 Cleaning up D-ID stream...");

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (streamIdRef.current) {
      try {
        await fetch(
          `https://api.d-id.com/talks/streams/${streamIdRef.current}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Basic ${btoa(process.env.VITE_APP_DID_API_KEY + ":")}`,
            },
          },
        );
        console.log("✅ Stream deleted");
      } catch (err) {
        console.error("Error deleting stream:", err);
      }
      streamIdRef.current = null;
    }

    setStatus("disconnected");
  }, []);

  // Expose speak function globally for easy access
  useEffect(() => {
    window.didAvatarSpeak = speak;
    window.didAvatarCleanup = cleanup;

    return () => {
      delete window.didAvatarSpeak;
      delete window.didAvatarCleanup;
    };
  }, [speak, cleanup]);

  // Initialize on mount
  useEffect(() => {
    if (autoStart) {
      initializeStream();
    }

    return () => {
      cleanup();
    };
  }, [autoStart, initializeStream, cleanup]);

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isVideoVisible && status !== "error" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Loading/Error Overlay */}
      {(status === "initializing" ||
        status === "connecting" ||
        status === "error") && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm">
          <div className="text-center max-w-md px-6">
            {status === "error" ? (
              <>
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Connection Failed
                </h3>
                <p className="text-gray-300 mb-4 text-sm">{error}</p>
                <button
                  onClick={initializeStream}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Retry Connection
                </button>
              </>
            ) : (
              <>
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {status === "initializing"
                    ? "Initializing Avatar..."
                    : "Connecting..."}
                </h3>
                <p className="text-gray-400 text-sm">
                  Setting up photorealistic AI avatar
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Status Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* Connection Status */}
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-2 ${
            status === "ready" || status === "speaking"
              ? "bg-green-600/90 text-white"
              : status === "connecting"
                ? "bg-yellow-600/90 text-white animate-pulse"
                : status === "error"
                  ? "bg-red-600/90 text-white"
                  : "bg-gray-600/90 text-white"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {status === "ready" && "Ready"}
          {status === "speaking" && "Speaking"}
          {status === "connecting" && "Connecting"}
          {status === "error" && "Error"}
          {status === "initializing" && "Loading"}
        </div>

        {/* Connection Quality */}
        {(status === "ready" || status === "speaking") && (
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-900/70 text-white backdrop-blur-sm">
            {connectionQuality === "good" && "📶 Excellent"}
            {connectionQuality === "fair" && "📶 Fair"}
            {connectionQuality === "poor" && "📶 Poor"}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* Mute/Unmute */}
        <button
          onClick={toggleMute}
          className="p-2.5 bg-gray-900/80 backdrop-blur-sm rounded-lg hover:bg-gray-800/90 transition-all shadow-lg group"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
          ) : (
            <Volume2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Show/Hide Video */}
        <button
          onClick={() => setIsVideoVisible(!isVideoVisible)}
          className="p-2.5 bg-gray-900/80 backdrop-blur-sm rounded-lg hover:bg-gray-800/90 transition-all shadow-lg group"
          title={isVideoVisible ? "Hide video" : "Show video"}
        >
          {isVideoVisible ? (
            <Video className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          ) : (
            <VideoOff className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Speaking Indicator */}
      {status === "speaking" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 backdrop-blur-sm rounded-full shadow-lg">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 8}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-white text-sm font-semibold">
              AI Speaking...
            </span>
          </div>
        </div>
      )}

      {/* Powered by D-ID */}
      <div className="absolute bottom-4 left-4">
        <div className="px-3 py-1 bg-gray-900/60 backdrop-blur-sm rounded-lg">
          <span className="text-xs text-gray-300 font-medium">
            Powered by D-ID
          </span>
        </div>
      </div>
    </div>
  );
};

export default DIDRealAvatar;

/*
USAGE EXAMPLES:

1. Basic Usage:
================
import DIDRealAvatar from './DIDRealAvatar';

<DIDRealAvatar
  onReady={() => console.log('Avatar ready!')}
  onError={(err) => console.error('Avatar error:', err)}
/>

2. Make Avatar Speak:
=====================
// After avatar is ready, call globally:
window.didAvatarSpeak("Hello! I'm your AI interviewer today.");

// Or with config:
window.didAvatarSpeak(
  "Hello! <break time='500ms'/> How are you?",
  { ssml: true }
);

3. Custom Avatar Image:
=======================
<DIDRealAvatar
  avatarConfig={{
    imageUrl: 'https://your-server.com/avatar-photo.jpg'
  }}
  voiceConfig={{
    provider: 'elevenlabs',
    voiceId: '21m00Tcm4TlvDq8ikWAM'
  }}
/>

4. With VAPI Integration:
=========================
const handleAIResponse = (text) => {
  if (window.didAvatarSpeak) {
    window.didAvatarSpeak(text);
  }
};

vapi.on('message', (message) => {
  if (message.role === 'assistant') {
    handleAIResponse(message.content);
  }
});
*/
