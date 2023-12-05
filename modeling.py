import mediapipe as mp
import numpy as np
import pandas as pd
from PIL import Image
from PIL import Image, ImageDraw, ImageFont
import base64,cv2
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import TensorBoard
from sklearn.preprocessing import LabelEncoder
import joblib
import time, io, os, time, sys, natsort, random, math
import json
from socket import *
import requests
datas = {'id': 'asap0123', 'password': 'asap0123!'}
HOST = "49.142.76.124"
TCP_PORT = 8080

mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils
mp_face_mesh = mp.solutions.face_mesh
'''
def make_numpy(keypoints):
    key_np_list = []
    keypoint_list = json.loads(keypoints)
    for k in keypoint_list:
        key_np_list.append(np.array(k))
    return np.expand_dims(key_np_list, axis=0)

def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    return image, results

# 왼손, 오른손 key_point 추출
def extract_keypoints(results):
    lh = np.array([[res.x*3, res.y*3, res.z*3] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x*3, res.y*3, res.z*3] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([lh, rh])

my_dict ={"None":0, "계산":1, "고맙다":2, "괜찮다":3, "기다리다":4, "나" :5, "네": 6,
          "다음":7, "달다":8, "더":9, "도착":10, "돈":11, "또":12,
          "맵다":13, "먼저":14, "무엇":15, "물":16, "물음":17, "부탁":18, "사람":19,
          "수저":20, "시간":21, "아니요":22, "어디":23, "얼마":24,"예약":25,
          "오다":26, "우리":27, "음식":28, "이거":29, "인기":30, "있다":31, "자리":32,
          "접시":33, "제일":34, "조금":35, "주문":36, "주세요":37, "짜다":38, "책":39,
          "추천":40, "화장실":41, "확인":42}

## 받은 5개의 단어들을 데이터 프레임으로 변환
def make_word_df(word0, word1, word2, word3, word4):
    info = [[word0, word1, word2, word3, word4]]
    df = pd.DataFrame(info, columns = ['target0', 'target1', 'target2', 'target3', 'target4'])
    return df

## 받은 단어를 숫자로 반환
def get_key(val):
    for key, value in my_dict.items():
         if val == key:
             return value

    return "There is no such Key"

## 인자로 받은 단어 5개의 데이터프레임을
def make_num_df(input_1):
    num_oflist = []
    for i in input_1.columns:
        num_oflist.append(get_key(input_1[i].values))
    input2 = make_word_df(num_oflist[0], num_oflist[1], num_oflist[2], num_oflist[3], num_oflist[4])
    return input2

log_dir = os.path.join('Logs')
tb_callback = TensorBoard(log_dir = log_dir)

# Actions that we try to detect
actions = np.array(['None', '계산', '고맙다', '괜찮다', '기다리다', '나', '네', '다음',
                   '달다', '더', '도착', '돈', '또', '맵다', '먼저', '무엇', '물', '물음',
                   '부탁', '사람', '수저', '시간', '아니요', '어디', '얼마', '예약', '오다',
                   '우리', '음식', '이거', '인기', '있다', '자리', '접시', '제일', '조금',
                   '주문', '주세요', '짜다', '책', '추천', '화장실', '확인'])
def make_model():
    model = Sequential()
    model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(30, 126)))
    model.add(LSTM(128, return_sequences=True, activation='relu'))
    model.add(LSTM(64, return_sequences=False, activation='relu'))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(actions.shape[0], activation='softmax'))

    model.compile(optimizer='Adam', loss ='categorical_crossentropy', metrics=['categorical_accuracy'])
    model.load_weights("weight/actionxhand_data0524_0513.h5")

    return model

def predict_word(sequence):
    model = make_model()
    restored_sequence = json.loads(sequence)
    sequence_np = []
    for elem in restored_sequence:
        sequence_np.append(np.array(elem))

    res = model.predict(np.expand_dims(sequence_np, axis=0))[0]
    return actions[np.argmax(res)]
'''

# Actions that we try to detect
actions = np.array(['나', '너', '많다', '맞다', '모르다', '수고하다', '슬퍼요', '아니요', '안녕하세요', '인사'])
# Thirty videos worth of data
no_sequences = 30
# Videos are going to be 30 frames in length
sequence_length = 30
def make_label():
    label_map = {label: num for num, label in enumerate(actions)}
    return label_map
def make_model(model_type):
    if model_type == "cnn":
        model = tf.keras.models.load_model('weight/model_cnn_w10.h5')

    return model
def predict_word(sequence, model):
    restored_sequence = json.loads(sequence)
    sequence_np = []
    for elem in restored_sequence:
        sequence_np.append(np.array(elem))

    res = model.predict(np.expand_dims(sequence_np, axis=0))[0]
    return actions[np.argmax(res)]

def get_key():
    dict = {'type': 3, 'api': '123'}
    return json.dumps(dict)

if __name__=="__main__":
    # TCP connection
    data = get_key()
    byte_data = bytes(data,'utf-8')
    clientSocket = socket(AF_INET, SOCK_STREAM)
    clientSocket.connect((HOST, TCP_PORT))
    clientSocket.send(byte_data)
    end_msg = "0000000000"
    end_byte = bytes(end_msg,'utf-8')
    clientSocket.send(bytes(end_msg,'utf-8'))
    received_data = b''
    model = make_model()
    while True:
        while True:
            # 데이터를 최대 BUFFER_SIZE만큼 받음
            data = clientSocket.recv(4096)
            if not data or data.endswith(bytes(end_msg,'utf-8')):  # 데이터가 더 이상 없으면 루프 종료
                received_data += data
                received_data[:-len(end_byte)]
                break
            received_data += data  # 받은 데이터를 저장
        keypoint_data = received_data.decode('utf-8')[:-10]
        received_data = b''
        print(f"data: {keypoint_data}")
        if len(data):
            word = predict_word(keypoint_data, model)
            print(word)
            clientSocket.send(bytes(word,'utf-8'))
            clientSocket.send(bytes(end_msg,'utf-8'))