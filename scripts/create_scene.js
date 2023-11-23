import * as THREE from 'three';
import { getChessboard, getCoordinate } from './create_ground.js';

function create_scene(scene, camera, renderer, use_ground=true){
    const width = document.querySelector('.container').offsetWidth;
    const height = width;
    camera.position.set(0, -3, 3); // 将相机放置在正Z轴方向，朝向原点
    camera.up.set(0, 0, 1); // 将相机的上方设为Z轴的正方向
    camera.lookAt(new THREE.Vector3(0, 0, 1.5)); // 让相机朝向场景的原点
    
    scene.background = new THREE.Color( 0xeeeeee );
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 在场景中添加一个光源
    // 添加太阳光（方向光）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 10); // 白色光源，强度为1
    directionalLight.position.set(0, 0, 3); // 设置光源位置
    scene.add(directionalLight);

    if(use_ground){
        var plane = getChessboard();
        scene.add(plane);
    
        var coord = getCoordinate(1);
        scene.add(coord);
    }
    // renderer
    return 0
}

export { create_scene };
