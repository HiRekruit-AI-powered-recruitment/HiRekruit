# Video Not Displaying - Debugging Guide

## 🆘 Current Issue
Camera is active (permissions granted) but video is not displaying in the interview.

## ✅ Applied Fixes
1. **useLiveKit.js**: Added extensive console logging to debug video attachment
2. **LocalVideoPanel.jsx**: Simplified container styling to ensure video has proper space
3. **Debugging**: Added multiple console logs to trace the issue

## 🔍 How to Debug

### Step 1: Open Browser DevTools
1. Press `F12` in your browser
2. Go to **Console** tab
3. Open the interview link and accept camera permissions

### Step 2: Look for These Logs (In Order)

```
✅ Created 2 local tracks
📋 Track details: { videoTrack: {...}, audioTrack: {...} }
✅ Video track reference stored
✅ Audio track reference stored
📤 Published video track
📤 Published audio track
📹 Attaching video track to DOM using LiveKit attach...
📹 localVideoRef.current: <div>...
📹 Container size: { offsetWidth: ..., offsetHeight: ..., clientWidth: ..., clientHeight: ... }
📹 Video element created: <video>
📹 Video element tag: VIDEO
✅ Video element attached to DOM
📹 Video in DOM? true
📹 Video displayed? block
```

Then wait for:
```
✅ Video metadata loaded
✅ Local video playing
```

### Step 3: Check Container Size
If you see `Container size:` log, check the values:
- `offsetWidth` and `offsetHeight` should NOT be 0
- If they are 0, the container div has no size (CSS issue)

### Step 4: Check Permission State
Look for this log:
```
📹 LocalVideoPanel state: {
  cameraPermission: "granted",
  isVideoOff: false,
  livekitConnected: true,
  showOverlay: false
}
```

All values must be as shown above for video to display.

### Step 5: Check for Errors
Look for any `❌` errors in the console:
- `❌ Error attaching video:`
- `❌ Video element error:`
- Any errors here indicate the real problem

---

## 🐛 Common Issues & Solutions

### Issue 1: Container Size is 0x0
**Cause**: The parent div doesn't have proper dimensions
**Solution**: 
- Check if `aspect-video` class is properly applied
- Verify CSS isn't overriding the styling

### Issue 2: showOverlay = true
**Cause**: One of these is wrong:
- `cameraPermission !== "granted"`
- `isVideoOff === true`
- `livekitConnected === false`

**Solution**: 
- Accept camera permissions when browser asks
- Check that `livekitConnected` becomes true (wait 3-5 seconds after entering room)

### Issue 3: Video Element in DOM but Not Visible
**Logs show**:
- `✅ Video element attached to DOM`
- `📹 Video in DOM? true`
- But no video displays

**Cause**: 
- CSS display property being overridden
- Video element has `display: none` or `visibility: hidden`
- Video element behind another element

**Solution**:
- Check computed styles: Right-click video element → Inspect → check "display" property
- Should be `display: block` not `none`

### Issue 4: Video Created but Never Plays
**Logs show**:
- `✅ Video metadata loaded` - but never shows `✅ Local video playing`

**Cause**:
- Track is muted at source level
- Browser autoplay policy blocking playback
- No active media stream

**Solution**:
- Check: `videoTrack.isMuted` in logs (should be false)
- Browser requires user interaction before playing - should be fine since user clicked to join
- Try toggling camera off/on to trigger playback

---

## 🔧 Manual Testing Steps

1. **After entering interview**, open DevTools Console
2. **Paste this code** to check video element:
```javascript
// Check if video element exists
const videoContainer = document.querySelector('[style*="zIndex: 10"]');
console.log('Video container:', videoContainer);
console.log('Video in container:', videoContainer?.querySelector('video'));

// Get the video element
const video = videoContainer?.querySelector('video');
if (video) {
  console.log('Video stats:', {
    playing: !video.paused,
    muted: video.muted,
    display: window.getComputedStyle(video).display,
    width: video.offsetWidth,
    height: video.offsetHeight,
    srcObject: !!video.srcObject,
    readyState: video.readyState, // 0=nothing, 1=metadata, 2=current data, 3=future data, 4=enough data
  });
}
```

3. **Check the output**:
   - `playing: true` ✅ Video should show
   - `playing: false` ❌ Video not playing
   - `display: "block"` ✅ CSS is correct
   - `display: "none"` ❌ CSS is hiding it
   - `width: 0, height: 0` ❌ Container has no size

---

## 📋 What Each Log Means

| Log | Meaning |
|-----|---------|
| `Created 2 local tracks` | Camera & mic permissions granted ✅ |
| `Container size: {0, 0}` | Container div has no dimensions ❌ |
| `Video element created: <video>` | LiveKit created video element ✅ |
| `Video in DOM? true` | Element appended to page ✅ |
| `Video displayed? block` | CSS display is correct ✅ |
| `Video can play` | Browser ready to play ✅ |
| `Local video playing` | Video actively playing ✅ |
| `Video metadata loaded` | Video codec/resolution info available ✅ |

---

## 🚀 If Everything Looks Right But Still No Video

Try this in console:
```javascript
// Force refresh the video element
const video = document.querySelector('video');
if (video) {
  video.play().catch(e => console.error('Play failed:', e));
}

// Or try toggling camera
// In the UI, click the camera button off, then on
```

---

## 📞 Report These Logs

If the issue persists, share these logs:

```javascript
// Copy these commands into console to get diagnostics
console.log('=== VIDEO DEBUGGING REPORT ===');
console.log('Camera Permission:', document.querySelector('[style*="📹"]')?.textContent || 'Unknown');
console.log('LiveKit Connected:', document.querySelector('[style*="zIndex: 10"]')?.offsetWidth > 0);
console.log('Video Element:', document.querySelector('video') ? '✅ Found' : '❌ Missing');
console.log('Video Playing:', document.querySelector('video')?.playing || 'N/A');
console.log('Container Size:', {
  width: document.querySelector('[style*="zIndex: 10"]')?.offsetWidth,
  height: document.querySelector('[style*="zIndex: 10"]')?.offsetHeight,
});
```

Share the output of this command when reporting the issue.
