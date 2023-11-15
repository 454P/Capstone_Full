from flask import Flask
import virtualcamera as vc
import cv2
import time
import json

app = Flask(__name__)

detector = vc.keypointDetector()
cap = cv2.VideoCapture(0)
@app.route('/')
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
    
        if cTime - pTime > 5.5:
            break

    for img in images:
        result, _ = detector.get_keypoint(img)
        sequence.append(result.tolist())
    print(len(sequence))
    return json.dumps(sequence[:30])


if __name__=="__main__":
  app.run(debug=True)
  # host 등을 직접 지정하고 싶다면
  # app.run(host="127.0.0.1", port="5000", debug=True)