import cv2
import numpy as np
import math
from PIL import Image

def cv2pil(imgCV):
    imgCV_RGB = cv2.cvtColor(imgCV, cv2.COLOR_BGRA2RGBA)
    imgPIL = Image.fromarray(imgCV_RGB)
    return imgPIL

BLACK = (0,0,0,0)
YELLOW = (100,255,255,255)
RED = (0,0,255,255)
GRAY = (60,60,60,255)
SIZE = 200
xc, yc = SIZE//2, SIZE//2
R = 90

fullmoon = np.full((SIZE, SIZE, 4), BLACK, np.uint8)
cv2.circle(fullmoon, (xc,yc), R, YELLOW, -1)

mask = fullmoon // YELLOW

imgs = []
for age in range(0, 28):
# for age in [15]:
    pts = [(xc, yc-R-5), (xc-R-10,yc-R-5), (xc-R-10,yc+R+5), (xc, yc+R+5)]  # 塗りつぶしエリアの初期値
    a = 2 * math.pi * age / 28                          # 月齢を角度に直す
    img = fullmoon.copy()                               # 満月画像

    if age==0:                                          # 月齢0のときに素直に計算すると誤差の線が出て
        cv2.circle(img, (xc,yc), R, GRAY, -1)           # 新月にならないので特別扱いする
    elif age==14:                                       # 月齢14のときに素直に計算すると誤差の線が出て
        cv2.circle(img, (xc,yc), R, YELLOW, -1)         # 満月にならないので特別扱いする
    else:
        for t in range(0, 180, 5):                      # 0度（北極）から180度（南極）まで
            th = math.radians(t)                        # 度をラジアンに直す
            r = R * math.sin(th) * math.cos(a)          # その緯度における半径
            x = int(xc + r)                             # x座標
            y = int(yc + R * math.cos(th))              # y座標
            pts.append((x,y))                           # その座標を塗りつぶしエリア座標群に追加する
        cv2.fillConvexPoly(img, np.array(pts), GRAY)    # 塗りつぶしエリアを塗りつぶす

    img = (img * mask).astype(np.uint8)             # 満月の外を透過色にする
#    cv2.circle(img, (xc,yc), R, RED, 1)          # あらためて円を描く
#    cv2.ellipse(img, (xc,yc), (R,R), 90, 0, -180, YELLOW, 1)
#    cv2.ellipse(img, (xc,yc), (R,R), 90, 0, 180, RED, 1)
    cv2.putText(img, f"age={age}", (10,SIZE-20), cv2.FONT_HERSHEY_SIMPLEX, 0.8, RED, 1)
    cv2.imshow("moon", img)
    cv2.waitKey(0)
    imgs.append(cv2pil(img))
cv2.destroyAllWindows()

imgs[0].save("moon.gif", save_all=True, append_images=imgs[1:], 
           optimize=False, duration=1000, loop=0)