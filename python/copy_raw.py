import os
import cv2

text = '''---
layout: video
---
'''

config = {
    'zjumocapv1':{
        'root': '/Users/shuaiqing/nas/ZJUMoCap/Part1/20201014',
        'seqs': '377 378 381 382 383 384 385 386 387 388 390 392 393 394 395'.split(),
        'scale': 2,
    },
    'enerf-outdoor': {
        'root': '/Users/shuaiqing/nas/datasets/enerf_outdoor',
        'seqs': 'actor1 actor1_4 actor1_complex actor2 actor2_3 actor3 actor5_6'.split(),
        'scale': 4,
    }
}

if __name__ == '__main__':
    collect = 'zjumocapv1'
    # collect = 'enerf-outdoor'

    root = config[collect]['root']
    seqs = config[collect]['seqs']
    scale = config[collect]['scale']
    output = f'dataset/{collect}'
    fps = 50

    config = []
    for seq in seqs:
        print(root, seq)
        print(text, file=open('_'+collect + '/' + seq +'.md', 'w'))
        subs = sorted(os.listdir(os.path.join(root, seq, 'images')))
        print(subs)
        preview_sub = subs[0]
        # make preview videos
        cmd = f'ffmpeg -y -r {fps} -i {root}/{seq}/images/{preview_sub}/%06d.jpg -c:v libx264 -vf scale="iw/2:ih/2" -pix_fmt yuv420p -r {fps} {output}/{seq}/preview.mp4'
        os.system(cmd)
        break
        # 
        nFrames = len(os.listdir(os.path.join(root, seq, 'images', preview_sub)))
        # copy preview image
        srcname = os.path.join(root, seq, 'images', preview_sub, '000000.jpg')
        dstname = os.path.join(output, seq, 'preview.jpg')
        img = cv2.imread(srcname)
        img = cv2.resize(img, (img.shape[1] // scale, img.shape[0] // scale), interpolation=cv2.INTER_AREA)
        os.makedirs(os.path.join(output, seq), exist_ok=True)
        cv2.imwrite(dstname, img)
        config.append({
            'name': seq,
            'views': len(subs),
            'frames': nFrames,
        })
    import yaml
    with open(os.path.join('_data', f'{collect}.yml'), 'w') as f:
        yaml.dump(config, f)