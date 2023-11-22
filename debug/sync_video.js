document.addEventListener("DOMContentLoaded", function() {
    var videos = document.querySelectorAll("video");
    var currentTimeDisplay = document.getElementById("currentTime");
    var syncInterval = 1000; // 同步间隔，单位毫秒（例如，5000毫秒即5秒）

    var allVideosLoaded = 0;

    videos.forEach(function(video, index) {
        video.addEventListener("loadedmetadata", function() {
            allVideosLoaded++;
            if (allVideosLoaded === videos.length) {
                videos.forEach(function(v) { v.play(); });
            }
        });

        // 添加播放事件监听器
        video.addEventListener("play", function() {
            videos.forEach(function(v) {
                if (v.paused) {
                    v.play();
                }
            });
        });

        // 添加暂停事件监听器
        video.addEventListener("pause", function() {
            videos.forEach(function(v) {
                if (!v.paused) {
                    v.pause();
                }
            });
        });

    });

    // 设置定时器同步视频
    setInterval(function() {
        var masterTime = videos[0].currentTime;
        videos.forEach(function(v, i) {
            if (i !== 0) { v.currentTime = masterTime; }
        });
        updateCurrentTimeDisplay(masterTime);
    }, syncInterval);

    function updateCurrentTimeDisplay(time) {
        var minutes = Math.floor(time / 60);
        var seconds = Math.floor(time % 60);
        currentTimeDisplay.textContent = '当前时间：' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }
});
