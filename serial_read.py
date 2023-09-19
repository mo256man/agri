import serial
ser = serial.Serial('COM6', 115200)

while True:
    String_data = ser.read()
    print(String_data)
ser.close()
