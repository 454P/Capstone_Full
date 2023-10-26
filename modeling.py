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

mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils
mp_face_mesh = mp.solutions.face_mesh

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
    #rlf = joblib.load("weight/sentence_model.pkl")

    '''
    data = pd.read_excel("/content/drive/MyDrive/sign_language/Sign-Language-Translator/sentence_data.xlsx", engine = 'openpyxl')
    data_x = data.drop(['sentence'], axis = 1)
    data_y = data['sentence']
    le = LabelEncoder()
    le.fit(data['sentence'])
    '''

    return model



def predict_word(filePath=""):
    model = make_model()
    sequence = []
    sentence = []
    predictions = []
    count = 0
    sequence_length = 30

    cap = cv2.VideoCapture(filePath)


    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        count = count+1


        #ret, frame = cap.read()
        # 프레임 카운터 초기화
        frame_count = 0

        # 추출할 프레임 간격 설정
        frame_interval = 5  # 5프레임당 1장 추출
        while True:
            ret, frame = cap.read()

            # 비디오에서 프레임을 읽을 수 없으면 종료
            if not ret:
                break


            frame_count += 1

            # frame_interval 만큼의 간격으로 프레임 저장
            if frame_count % frame_interval == 0:
                image, results = mediapipe_detection(frame, holistic)
                keypoints = extract_keypoints(results)
                sequence.append(keypoints)
            # for frame_num in range(sequence_length):
            #   image, results = mediapipe_detection(frame, holistic)
            #   keypoints = extract_keypoints(results)
            #   sequence.append(keypoints)

            # 포즈 주석을 이미지 위에 그립니다.
            # image.flags.writeable = True
            # image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            '''
            mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())
            '''
    print(len(sequence))
    res = model.predict(np.expand_dims(sequence[:30], axis=0))[0]
    print(actions[np.argmax(res)])

predict_word("영상/수어_계산.mp4")