import virtualcamera as vc
import cv2
import time
import json
import argparse
import requests
from socket import *

url = 'http://49.142.76.124:8000/login'
datas = {'id': 'asap0123', 'password': 'asap0123!'}
HOST = "49.142.76.124"
TCP_PORT = 8080

detector = vc.keypointDetector()
cap = cv2.VideoCapture(0)

def record_video():
    pTime = 0
    cTime = 0
    sequence = []
    images = []
    frame_count = 0
    # 추출할 프레임 간격 설정
    frame_interval = 5  # 5프레임당 1장 추출

    #cap = cv2.VideoCapture(0)
    #detector = vc.keypointDetector()
    pTime = time.time()
    while True:
        success, img = cap.read()
        cTime = time.time()
        
        frame_count += 1
        # frame_interval 만큼의 간격으로 프레임 저장
        if frame_count % frame_interval == 0:
            images.append(img)
            #result, image = detector.get_keypoint(img)
            #sequence.append(result.tolist())
            #print(cTime - pTime)
            print(f"time: {cTime - pTime}")
        if cTime - pTime > 5.5:
            break
    
    for img in images:
        result, _ = detector.get_keypoint(img)
        sequence.append(result.tolist())
    print(len(sequence))
    return json.dumps(sequence[:30])

def get_key():
    response = requests.post(url, data=datas)
    api = response.json()['data']['api']
    # json 저장
    dict = {'type': 1, 'api': api}
    return json.dumps(dict)

if __name__=="__main__":
    data = get_key()

    # TCP connection
    byte_data = bytes(data,'utf-8')
    clientSocket = socket(AF_INET, SOCK_STREAM)
    clientSocket.connect((HOST, TCP_PORT))
    clientSocket.send(byte_data)
    end_msg = "0000000000"
    clientSocket.send(bytes(end_msg,'utf-8'))

    while True:
        data = clientSocket.recv(1024)
        if len(data):
            msg = data.decode()
            print(f"msg: {msg}")
            sequence_data = bytes(record_video(), 'utf-8')
            clientSocket.sendall(sequence_data)
            clientSocket.send(bytes(end_msg,'utf-8'))
    