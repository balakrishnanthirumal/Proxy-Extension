chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "pauseOrPlayVideo") {
        const video = document.querySelector("video");
        if (video) {
            if (message.action === "pause") {
                video.pause();
            } else if (message.action === "play") {
                video.play();
            }
        }
    }
});


// Listen for changes in tab visibility (whether it's active or inactive)
document.addEventListener('visibilitychange', function () {
    const video = document.querySelector('video'); // Select the video element

    if (!video) return;  // If there's no video element on the page, exit the function

    if (document.visibilityState === 'hidden') {
        video.pause();  // Pause the video when the tab becomes inactive
    } else if (document.visibilityState === 'visible') {
        video.play();   // Resume playing the video when the tab becomes active again
    }
});

