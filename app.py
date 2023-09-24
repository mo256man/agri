from flask import Flask, render_template, request
from koyomi import Ephem
import subprocess
import json
import random
import RPi.GPIO as GPIO
import dht11
import time
import datetime
import subprocess
from gpiozero import MCP3004

app = Flask(__name__)
my_ephem = Ephem()
light_pins = [26, 19, 13, 6, 5]
temp_pin = 20
led_pin = 16
pilot_pin = 21
pilot_status = False
sensor = dht11.DHT11(pin=temp_pin)

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.cleanup()
GPIO.setup(pilot_pin, GPIO.OUT)
GPIO.setup(led_pin, GPIO.OUT)

Vref = 5

for pin in light_pins:
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
    
dict = {"temp":0, "humi":0}
for pin in light_pins:
    dict[str(pin)] = 0

def analog_read(ch):
    adc = MCP3004(ch)
#    volt = adc.value * Vref
    return adc.value


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
    global pilot_status
    cnt = 0
    for pin in light_pins:
        status = GPIO.input(pin)
        dict[str(pin)] = status
        if status:
            cnt += 1
    dict["cnt"] = cnt
    if cnt < 3:
        dict["result"] = "LED ON"
        GPIO.output(led_pin, True)
    else:
        dict["result"] = "LED OFF"
        GPIO.output(led_pin, False)

    result = sensor.read()
    if result.is_valid():
        dict["temp"] = f"{result.temperature:.1f} ℃"
        dict["humi"] = f"{result.humidity:.1f} %"

    GPIO.output(pilot_pin, pilot_status)
    pilot_status = not pilot_status
    
    # voltage
    ana3 = analog_read(ch=3)
    ana0 = analog_read(ch=0)
    dict["ana3"] = int(ana3*100)
    dict["ana0"] = int(ana0*100)
    #print(dict["bat"])
            
    return json.dumps(dict)

if __name__ == "__main__":
    app.run(debug=True)
