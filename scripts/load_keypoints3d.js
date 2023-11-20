function loadKeypoints3d(root, index) {
    // 构建 URL，使用 index 参数来确定加载哪个文件
    const url = `../../dataset/${root}/keypoints3d/${index.toString().padStart(6, '0')}.json`; // 格式化文件名

    // 返回一个 Promise，以便可以使用 .then() 或 async/await 处理结果
    return fetch(url)
        .then(response => {
            // 检查响应是否成功
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // 返回解析后的 JSON 数据
            return data;
        })
        .catch(error => {
            // 处理加载或解析中的任何错误
            console.error('There has been a problem with your fetch operation:', error);
        });
}

async function loadAllKeypoints3d(root, N) {
    let keypoints3dArray = [];
    let index = 0;
    let keepLoading = true;

    while (keepLoading) {
        try {
            const data = await loadKeypoints3d(root, index);
            if (data) {
                keypoints3dArray.push(data);
                index++;
                if (N !== undefined && index >= N) {
                    keepLoading = false; // 当达到指定的帧数时停止
                }
            } else {
                keepLoading = false; // 如果数据为空，则停止加载
            }
        } catch (error) {
            console.log('Loading completed or file does not exist:', error.message);
            keepLoading = false; // 如果出现错误（如文件不存在），停止加载
        }
    }

    return keypoints3dArray; // 返回包含所有数据的数组
}

export { loadAllKeypoints3d };
