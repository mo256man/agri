import ephem
import datetime
import pytz
import numpy as np
import cv2
import math
import base64

sun = ephem.Sun()                       # 太陽
moon = ephem.Moon()                     # 月

class Ephem():
    def __init__(self):
        self.lat = 35.1667                              # 北緯
        self.lon = 136.9167                             # 東経
        elev = 0                                        # 標高
        self.name = "名古屋"                            # 地名
        self.timedelta = datetime.timedelta(hours=9)    # utcと日本時間の時差
        self.location = ephem.Observer()

        dt_local = datetime.datetime.now(pytz.timezone("Asia/Tokyo"))   # 日本の日時
        self.date = dt_local.date()                     # 日本の日付
        dt_utc = dt_local - self.timedelta              # UTC時間での日時
        self.dt0 = self.get0hour(dt_utc)                # 今日の0時0分0秒を登録
        self.location.date = self.get0hour(self.dt0)
        self.location.lat = str(self.lat)
        self.location.lon = str(self.lon)
        self.location.elev = elev

        self.getResult()
        self.moon_image = self.draw_moon(self.moon_phase)
        
    def get0hour(self, dt):
        # 現在時刻ではなく今日の0時を基準とするために時差で日付を修正する
        if dt.hour < 15:                                # 15時以前ならば
            dt = dt + datetime.timedelta(days=1)        # -1日する
        return dt

    def getResult(self):
        self.today_rising = self.dt2str(self.location.next_rising(sun))
        self.today_setting = self.dt2str(self.location.next_setting(sun))
        self.moon_phase = round(self.location.date - ephem.previous_new_moon(self.location.date),2)

        self.location.date= self.dt0 + datetime.timedelta(days=1)      # 翌日に注目
        self.tomorrow_rising = self.dt2str(self.location.next_rising(sun))
        self.tomorrow_setting = self.dt2str(self.location.next_setting(sun))

    def dt2str(self, dt):
        return (ephem.localtime(dt).strftime("%H:%M"))

    def change_date(self, k):
        if k==0:
            self.date = datetime.datetime.now().date()
        else:
            self.date = self.date + datetime.timedelta(days=k)
        self.location.date = self.date
        self.getResult()
        self.moon_image = self.draw_moon(self.moon_phase)

    def draw_moon(self, age):
        BLACK = (0,0,0,0)
        YELLOW = (100,255,255,255)
        RED = (0,0,255,255)
        GRAY = (60,60,60,255)
        SIZE = 120                                              # 画像サイズ
        xc, yc = SIZE//2, SIZE//2                               # 円（満月）の中心
        R = 50                                                  # 円（満月）の半径

        img = np.full((SIZE, SIZE, 4), BLACK, np.uint8)         # 透明背景
        cv2.circle(img, (xc,yc), R, YELLOW, -1)                 # 満月を描く
        mask = img // YELLOW                                    # 満月を黄色で割る　つまり0と1からなるマスク

        pts = [(xc, yc-R-5), (xc-R-10,yc-R-5), (xc-R-10,yc+R+5), (xc, yc+R+5)]  # 塗りつぶしエリアの初期値
        a = 2 * math.pi * age / 28                              # 月齢を角度に直す

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

        img = (img * mask).astype(np.uint8)                 # 満月の外を透過色にする
#       cv2.ellipse(img, (xc,yc), (R,R), 90, 0, -180, YELLOW, 1)
#       cv2.ellipse(img, (xc,yc), (R,R), 90, 0, 180, RED, 1)

        _, imgEnc = cv2.imencode(".png", img)               # メモリ上にエンコード
        imgB64 = base64.b64encode(imgEnc)                   # base64にエンコード
        strB64 = "data:image/png;base64," + str(imgB64, "utf-8")    # 文字列化
        return strB64


def main():
    ep = Ephem()
    
    ep.getResult()

    pass

if __name__=="__main__":
    main()