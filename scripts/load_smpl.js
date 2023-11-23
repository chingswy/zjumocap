import * as THREE from 'three';

async function load_smpl(scene){
    const urls = [
        '/assets/dump_smpl/v_template.bin',
        '/assets/dump_smpl/faces.bin',
        '/assets/dump_smpl/skinWeights.bin',
        '/assets/dump_smpl/skinIndice.bin',
        '/assets/dump_smpl/keypoints.bin',
    ];
    const geometry = new THREE.BufferGeometry();
    const buffers = await Promise.all(urls.map(url => fetch(url).then(response => response.arrayBuffer())));
    const v_template = new Float32Array(buffers[0]);
    const faces = new Uint16Array(buffers[1]);
    const skinWeights = new Float32Array(buffers[2]);
    const skinIndices = new Uint16Array(buffers[3]);
    const keypoints = new Float32Array(buffers[4]);
    // edges包含骨架链接关系
    const edges = [-1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 12, 13, 14, 16, 17, 18, 19, 20, 21];
    // 假设 jointPositions 是一个 J x 3 的数组，每个元素是一个包含 X, Y, Z 坐标的数组
    var rootBone = new THREE.Bone();
    rootBone.position.set(keypoints[0], keypoints[1], keypoints[2]);
    // scene.add(rootBone);
    var bones = [rootBone];
    // 创建骨骼
    for (let i = 1; i < keypoints.length / 3; i++) {
        const bone = new THREE.Bone();
        const parentIndex = edges[i];
        bone.position.set(
            keypoints[3 * i] - keypoints[3 * parentIndex],
            keypoints[3 * i + 1] - keypoints[3 * parentIndex + 1],
            keypoints[3 * i + 2] - keypoints[3 * parentIndex + 2]);
        console.log(i, bone.position);
        bones.push(bone);
        bones[parentIndex].add(bone);
    }
    var skeleton = new THREE.Skeleton(bones);
    geometry.setIndex(new THREE.BufferAttribute(faces, 1));
    geometry.setAttribute('position', new THREE.BufferAttribute(v_template, 3));
    geometry.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndices, 4));
    geometry.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeights, 4));
    geometry.computeVertexNormals();
    console.log(geometry);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, skinning: true, side: THREE.DoubleSide, });
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        skinning: true,
        side: THREE.DoubleSide
    });
    var mesh = new THREE.SkinnedMesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.add(bones[0]);
    mesh.bind(skeleton);
    bones[0].rotation.x = Math.PI / 2;
    bones[0].position.z = 1.1;
    return { bones, skeleton, mesh };
}

function reshapeArrayTo2D(float32Array, rows) {
    const twoDArray = [];
    const cols = float32Array.length / rows;
    for (let i = 0; i < rows; i++) {
        const row = new Float32Array(cols);
        for (let j = 0; j < cols; j++) {
            row[j] = float32Array[i * cols + j];
        }
        twoDArray.push(row);
    }
    return twoDArray;
}

async function load_smpl_params(filename){
    const response = await fetch(filename);
    const data = await response.json();
    // 遍历每个键，解码 Base64 数据
    for (const key in data) {
        if (key !== 'nframes') {
            const base64String = data[key];

            // 解码 Base64 字符串
            const binaryString = atob(base64String);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);

            // 转换为字节流
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // TODO: 根据您的需要处理字节流
            // 例如，如果您知道数据是浮点数，可以进一步转换为 Float32Array
            const floatArray = new Float32Array(bytes.buffer);
            if (key == 'shapes'){
                data[key] = floatArray;
            }else{
                data[key] = reshapeArrayTo2D(floatArray, data.nframes); // 重塑为二维数组
            }
            // 输出结果
            console.log(`Key: ${key}, Data:`, data[key]);
        }
    }
    console.log('Number of frames:', data.nframes);
    return data;
}

export { load_smpl, load_smpl_params };