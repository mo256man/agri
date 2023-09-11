from flask import Flask, render_template, request
from koyomi import Ephem
import subprocess
import json
import random

app = Flask(__name__)
my_ephem = Ephem()
dict = {}
for pin in [26, 19, 13, 6, 5]:
    dict[str(pin)] = 0

@app.route("/")
def index():
    return render_template("index.html", ephem = my_ephem)

@app.route("/date_minus")
def date_minus():
    my_ephem.change_date(-1)
    return render_template("index.html", ephem = my_ephem)

@app.route("/date_today")
def date_today():
    my_ephem.change_date(0)
    return render_template("index.html", ephem = my_ephem)

@app.route("/date_plus")
def date_plus():
    my_ephem.change_date(1)
    return render_template("index.html", ephem = my_ephem)

@app.route("/call_from_ajax", methods = ["POST"])
def call_from_ajax():
    # GPIOを持たないときのためのサンプルプログラム
    #cp = subprocess.run(["echo", "%TIME%"], shell=True, encoding="utf-8", stdout=subprocess.PIPE)
    #print(cp.stdout)
    #val = int(cp.stdout[-3:-1])
    cnt = 0
    dict["cnt"] = cnt
    for pin in [26, 19, 13, 6, 5]:
        if random.random() < 0.2:
            dict[str(pin)] = not dict[str(pin)]
        if dict[str(pin)]:
            cnt += 1
    dict["cnt"] = cnt
    if cnt > 2:
        dict["result"] = "LED ON"
    else:
        dict["result"] = "LED OFF"

    return json.dumps(dict)

if __name__ == "__main__":
    app.run(debug=True)