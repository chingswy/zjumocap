function playAllVideos() {
    var videos = document.querySelectorAll("video");
    videos.forEach(function(v) {
        if (v.paused) {
            v.play();
        }
    });
}

function resetAllVideos() {
    var videos = document.querySelectorAll("video");
    videos.forEach(function(v) {
        v.currentTime = 0;
    });
}

export { playAllVideos, resetAllVideos};