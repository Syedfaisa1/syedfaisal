from PIL import Image
import numpy as np
from collections import deque

def clean_bg(img_path, out_path):
    im = Image.open(img_path).convert('RGB')
    w, h = im.size
    arr = np.array(im, dtype=np.int32)
    
    # Check if a pixel is checkerboard:
    # 1. Neutral: max(r,g,b) - min(r,g,b) <= 8
    # 2. Bright: min(r,g,b) >= 190
    diff = np.max(arr, axis=2) - np.min(arr, axis=2)
    min_val = np.min(arr, axis=2)
    is_checker = (diff <= 8) & (min_val >= 185)
    
    # BFS / Flood fill from all border pixels
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    
    # Add border pixels that are checkerboard
    for x in range(w):
        if is_checker[0, x]:
            visited[0, x] = True
            q.append((0, x))
        if is_checker[h - 1, x]:
            visited[h - 1, x] = True
            q.append((h - 1, x))
            
    for y in range(h):
        if is_checker[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            q.append((y, 0))
        if is_checker[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True
            q.append((y, w - 1))
            
    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not visited[ny, nx] and is_checker[ny, nx]:
                    visited[ny, nx] = True
                    q.append((ny, nx))
                    
    # Visited pixels are the background! Make them alpha = 0
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = arr[:, :, :3]
    rgba[:, :, 3] = np.where(visited, 0, 255)
    
    out_im = Image.fromarray(rgba, 'RGBA')
    out_im.save(out_path)
    print(f'Saved {out_path}, transparent pixels: {np.sum(visited)} / {w * h}')

clean_bg('src/assets/first_row_character_pngs/05_push_3.png', 'scratch/05_test_clean.png')
