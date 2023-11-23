import os
import json
import numpy as np
import base64

if __name__ == '__main__':
    path = '/Users/shuaiqing/nas/ZJUMoCap/Part1/20201014/377/output-smpl-3d/smplfull'
    filenames = sorted(os.listdir(path))

    res = {}
    for filename in filenames:
        with open(os.path.join(path, filename)) as f:
            data = json.load(f)
        annots = data['annots'][0]
        if 'shapes' not in res:
            res['shapes'] = annots['shapes']
            for key in annots.keys():
                if key == 'shapes' or key == 'id':
                    continue
                res[key] = [annots[key][0]]
            continue
        for key in annots.keys():
            if key == 'shapes' or key == 'id':
                continue
            res[key].append(annots[key][0])
    for key, val in res.items():
        array = np.array(val, dtype=np.float32)
        base64_encoded = base64.b64encode(array.tobytes()).decode('utf-8')
        res[key] = base64_encoded
    res['nframes'] = len(filenames)
    with open('data.json', 'w') as f:
        json.dump(res, f)