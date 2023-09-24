import RPi.GPIO as GPIO
import dht11
import time
import datetime

temp_pin = 20
GPIO.setmode(GPIO.BCM)
GPIO.cleanup()
sensor = dht11.DHT11(pin=temp_pin)

def main(args):
    try:
        while True:
            result = sensor.read()
            if result.is_valid():
                print(datetime.datetime.now())
                print(f"{  result.temperature:.1f} ℃")
                print(f"{  result.humidity:.1f} %")
            time.sleep(1)
    except KeyboardInterrupt:
        print("break")

if __name__ == '__main__':
    import sys
    sys.exit(main(sys.argv))
