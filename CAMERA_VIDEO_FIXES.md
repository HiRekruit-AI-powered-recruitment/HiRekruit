# Camera & Video Stream Fixes - HireMate Interview System

## 🔴 Problems Identified

### 1. **Local Video Not Displaying (Candidate Can't See Themselves)**
- **File**: `frontend/src/Hooks/InterviewHooks/useLiveKit.js`
- **Root Cause**: Was creating a video element from `MediaStreamTrack` instead of using LiveKit's `track.attach()` method
- **Impact**: MediaStream-based approach doesn't properly handle LiveKit's track lifecycle

### 2. **Remote Video Not Displaying (HR & Candidate Can't See Each Other)**
- **File**: `frontend/src/components/Interview/ParticipantVideo.jsx`
- **Root Cause**: Component only attaches tracks if `!publication.isMuted`, but many tracks publish as muted initially
- **Impact**: Tracks exist but aren't displayed because mute flag prevents attachment

### 3. **Video Container Lacks Proper Layout Styling**
- **File**: `frontend/src/components/Interview/LocalVideoPanel.jsx`
- **Root Cause**: Container ref didn't have explicit width/height/display styles in inline style object
- **Impact**: Video element has no rendering space even when properly attached

### 4. **Sub-optimal Video Resolution Settings**
- **File**: `frontend/src/Hooks/InterviewHooks/useLiveKit.js`
- **Root Cause**: Requesting 1280x720@30fps which may cause issues on lower bandwidth or older devices
- **Impact**: Browser permission prompts, connection delays, poor codec support

---

## ✅ Fixes Applied

### **Fix 1: Use LiveKit's `track.attach()` for Local Video** 
**File**: `useLiveKit.js` (lines ~180-210)

```javascript
// ❌ BEFORE (WRONG):
const mediaStreamTrack = videoTrack.mediaStreamTrack;
const mediaStream = new MediaStream([mediaStreamTrack]);
const videoElement = document.createElement("video");
videoElement.srcObject = mediaStream;

// ✅ AFTER (CORRECT):
const videoElement = videoTrack.attach();
videoElement.autoplay = true;
videoElement.playsInline = true;
videoElement.style.width = "100%";
videoElement.style.height = "100%";
```

**Why**: LiveKit's `attach()` method properly integrates with the SDK's track management and ensures proper lifecycle handling.

---

### **Fix 2: Attach All Subscribed Tracks Regardless of Mute State**
**File**: `ParticipantVideo.jsx` (lines ~175-215)

```javascript
// ❌ BEFORE (WRONG):
if (publication.track && publication.isSubscribed && !publication.isMuted) {
  attachTrack(publication.track, publication);
}

// ✅ AFTER (CORRECT):
if (publication.track && publication.isSubscribed) {
  attachTrack(publication.track, publication);
  setHasVideo(!publication.isMuted); // Mute state is handled separately
}
```

**Why**: Tracks can publish as muted and then unmute later. By attaching all subscribed tracks, the unmute event handlers will properly display the video when unmuted.

---

### **Fix 3: Add Explicit Styling to Video Container**
**File**: `LocalVideoPanel.jsx` (lines ~30-38)

```javascript
// ❌ BEFORE:
<div ref={localVideoRef} className="..." style={{ zIndex: ... }} />

// ✅ AFTER:
<div 
  ref={localVideoRef} 
  className="..." 
  style={{ 
    zIndex: ...,
    width: "100%",
    height: "100%",
    display: "block"
  }} 
/>
```

**Why**: Ensures the container takes up full space for the video element to render.

---

### **Fix 4: Optimize Video Resolution & Audio Settings**
**File**: `useLiveKit.js` (lines ~65-80 and ~150-165)

```javascript
// ✅ Room Configuration:
videoCaptureDefaults: {
  resolution: { width: 640, height: 480, frameRate: 24 },
  facingMode: "user",
},
audioDefaults: {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
}

// ✅ Track Creation:
video: {
  resolution: { width: 640, height: 480, frameRate: 24 },
  facingMode: "user",
},
audio: {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
}
```

**Why**: 
- Lower resolution (640x480) works better on most networks and devices
- 24fps is sufficient for interviews and reduces bandwidth
- Audio enhancements improve call quality
- `facingMode: "user"` ensures front-facing camera on mobile devices

---

## 📋 Files Modified

| File | Changes | Impact |
|------|---------|--------|
| [useLiveKit.js](frontend/src/Hooks/InterviewHooks/useLiveKit.js) | Use `track.attach()`, optimize resolution, add audio settings | ✅ Local video now displays |
| [ParticipantVideo.jsx](frontend/src/components/Interview/ParticipantVideo.jsx) | Remove mute check from initial track attachment | ✅ Remote videos now display |
| [LocalVideoPanel.jsx](frontend/src/components/Interview/LocalVideoPanel.jsx) | Add explicit width/height/display to container | ✅ Video container properly sized |
| [LivekitService.py](backend/src/Utils/LivekitService.py) | Documentation improvement | ℹ️ Clarity on permissions |

---

## 🧪 Testing Checklist

After deployment, verify:

- [ ] **Candidate View**
  - [ ] Camera permission prompt appears
  - [ ] Own video displays after permission granted
  - [ ] Can toggle camera on/off
  - [ ] Can toggle mic on/off
  - [ ] Own video has mirror effect (flipped)

- [ ] **HR View**
  - [ ] Can see candidate's video within 2-3 seconds
  - [ ] Candidate can see HR's video (if HR joins as second participant)
  - [ ] Multiple participants display correctly in grid

- [ ] **Edge Cases**
  - [ ] Video works with low bandwidth (throttle to 3G in DevTools)
  - [ ] Unmuting/remuting works smoothly
  - [ ] No "Camera off" placeholder when camera is actually on
  - [ ] Permission denial doesn't crash the app

---

## 🔍 Debugging Tips

If video still doesn't appear:

1. **Check Browser Console** for errors:
   ```
   📹 Attaching video track to DOM...
   ✅ Video metadata loaded
   ✅ Video playing
   ```

2. **Check LiveKit URL**: Verify `VITE_BASE_URL` and `LIVEKIT_URL` environment variables

3. **Check Permissions**: 
   ```javascript
   navigator.mediaDevices.getUserMedia({ video: true, audio: true })
   ```

4. **Check Network**: Ensure WebSocket connection to LiveKit is established
   - Open DevTools → Network → Filter: "ws"
   - Should see connection to LiveKit server

5. **Enable Debug Logging**:
   ```javascript
   // In useLiveKit.js and ParticipantVideo.jsx
   // Already added extensive console.log statements
   ```

---

## 🚀 Future Improvements

1. **Video Quality Selection**: Allow users to select resolution (low/medium/high)
2. **Bandwidth Detection**: Automatically adjust quality based on network
3. **Screen Sharing**: Add support for sharing browser tab during interview
4. **Recording Indicator**: Show clear recording status
5. **Network Stats**: Display connection quality to user

---

## 📞 Support

If issues persist:
1. Check if LiveKit server is running and accessible
2. Verify all environment variables are set correctly
3. Test with different browsers (Chrome, Firefox, Safari)
4. Check for browser extensions blocking camera access
5. Test with microphone permissions at OS level
