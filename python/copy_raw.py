import os
import numpy as np
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
    },
    'zjumocapv3': {
        'root': '/Users/shuaiqing/nas/ZJUMoCap/DeepMocap/230511',
        'seqs': ['552-balance', '556-balance', '558-balance'],
        'scale': 2,
        'preview_default': ['07'],
        'preview': {
            '552-balance': ['07', '14', '22'],
            '556-balance': ['07', '14', '22'],
            '558-balance': ['07', '14', '22'],
        }
    }
}

def read_image(imgname, scale):
    img = cv2.imread(imgname)
    img = cv2.resize(img, (img.shape[1] // scale, img.shape[0] // scale), interpolation=cv2.INTER_AREA)
    return img

if __name__ == '__main__':
    collect = 'zjumocapv1'
    # collect = 'enerf-outdoor'
    collect = 'zjumocapv3'

    os.makedirs('_'+collect, exist_ok=True)
    root = config[collect]['root']
    seqs = config[collect]['seqs']
    scale = config[collect]['scale']
    output = f'dataset/{collect}'
    fps = 50

    _config = []
    for seq in seqs:
        outseq = seq.replace('-balance', '')
        outroot = os.path.join(output, outseq)
        os.makedirs(outroot, exist_ok=True)
        print(text, file=open('_'+collect + '/' + outseq +'.md', 'w'))
        subs = sorted(os.listdir(os.path.join(root, seq, 'images')))
        print(subs)
        if seq in config[collect]['preview']:
            preview_views = config[collect]['preview'][seq]
        else:
            preview_views = config[collect]['preview_default']
        input_str = ' '.join([f'-r {fps} -i {root}/{seq}/images/{sub}/%06d.jpg' for sub in preview_views])
        _scale = config[collect]['scale']
        if len(preview_views) > 2:
            _scale = 4
        filter_str = '; '.join(['[{i}:v]scale=iw/{scale}:ih/{scale}[v{i}]'.format(scale=_scale, i=i) for i in range(len(preview_views))])
        filter_str += '; ' + ''.join(['[v{i}]'.format(i=i) for i in range(len(preview_views))]) + 'hstack=inputs={}'.format(len(preview_views))
        print(input_str)
        # make preview videos
        cmd = f'ffmpeg -y {input_str} -c:v libx264 -filter_complex "{filter_str}" -pix_fmt yuv420p -r {fps} {output}/{outseq}/preview.mp4'
        print(cmd)
        os.system(cmd)
        # 
        nFrames = len(os.listdir(os.path.join(root, seq, 'images', preview_views[0])))
        # copy preview image
        srcname = [os.path.join(root, seq, 'images', view, '000000.jpg') for view in preview_views[:1]]
        img = np.hstack([read_image(name, scale) for name in srcname])
        dstname = os.path.join(output, outseq, 'preview.jpg')
        cv2.imwrite(dstname, img)
        _config.append({
            'name': outseq,
            'views': len(subs),
            'frames': nFrames,
            'preview_views': preview_views
        })
    import yaml
    with open(os.path.join('_data', f'{collect}.yml'), 'w') as f:
        yaml.dump(_config, f)