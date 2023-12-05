import cv2
import numpy as np
import sys
import io
import os, time

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding = 'utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding = 'utf-8')

def VideoWrite(num):
    try:
        print("카메라 구동")
        cap = cv2.VideoCapture(0)
    except:
        print("카메라 구동실패")
        return

    # 폭, 높이 값을 카메라속성에 맞춤
    # cap.set(probID, 속성값) 은 출력될 값들을 지정해주는 것이고
    # cap.get(probID) 는 해당 속성에 대한 값을 받아오는 것임.
    # 아래의 폭과 높이는 웹캠의 속성을 그대로 가져와 사용하는것.
    width = int(cap.get(3))
    height = int(cap.get(4))

    # 코덱정보를 나타냄 아래의 두줄과 같이 사용할 수 있음.
    # 둘중 어느것을 쓰든 상관없음.
    # 여러가지의 코덱종류가 있지만 윈도우라면 DIVX 를 사용
    #fourcc = cv2.VideoWriter_fourcc(*'DIVX')
    fourcc = cv2.VideoWriter_fourcc('m','p','4','v')
    # fourcc = cv2.VideoWriter_fourcc('D','I','V','X')


    directory = os.path.join("data", "많다")  # 새로운 디렉토리 이름
    file_name = "많다_" + str(num) + ".mp4"
    if not os.path.exists(directory):
        os.makedirs(directory)

    file_path = os.path.join(directory, file_name)
    print(file_path)
    # 비디오 저장을 위한 객체를 생성해줌.
    out = cv2.VideoWriter(file_path,fourcc,30.0,(width, height))

    pTime = time.time()
    while(True):
        ret, frame = cap.read()

        if not ret:
            print("비디오 읽기 오류")
            break

        # 비디오 프레임이 정확하게 촬영되었으면 화면에 출력하여줌
        cv2.imshow('video',frame)
        # 비디오 프레임이 제대로 출력되면 해당파일에 프레임을 저장
        out.write(frame)
        cTime = time.time()
        if cTime - pTime > 3.5:
            break
        # ESC키값을 입력받으면 녹화종료 메세지와 함께 녹화종료
        k= cv2.waitKey(1)
        if(k == 27):
            print('녹화 종료')
            break

    # 비디와 관련 장치들을 다 닫아줌.
    cap.release()
    out.release()
    cv2.destroyAllWindows()

i=1

while True:
    VideoWrite(i)
    i += 1
    user_input = input("Press 'q' to quit: ")
    if user_input.lower() == 'q':
        break