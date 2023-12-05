import cv2  # Can be installed using "pip install opencv-python"
import mediapipe as mp  # Can be installed using "pip install mediapipe"
import time
import math
import numpy as np
import virtualcamera as vc

class keypointDetector():
    def __init__(self, mode=False, maxHands=2, detectionCon=False, trackCon=0.5):
        self.mp_holistic = mp.solutions.holistic
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_face_mesh = mp.solutions.face_mesh
    

    def mediapipe_detection(self, image, model):
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        self.results = model.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        return image
    def extract_keypoints(self):
        lh = np.array([[res.x*3, res.y*3, res.z*3] for res in self.results.left_hand_landmarks.landmark]).flatten() if self.results.left_hand_landmarks else np.zeros(21*3)
        rh = np.array([[res.x*3, res.y*3, res.z*3] for res in self.results.right_hand_landmarks.landmark]).flatten() if self.results.right_hand_landmarks else np.zeros(21*3)
        return np.concatenate([lh, rh])
    
    def get_keypoint(self, frame, draw=True):
        with self.mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
            image = self.mediapipe_detection(frame, holistic)
            keypoints = self.extract_keypoints()
        return keypoints, image
    

def main():
    directory = os.path.join("data", "인사")  # 새로운 디렉토리 이름
    file_name = "인사_" + str(num) + ".mp4"
    if not os.path.exists(directory):
        os.makedirs(directory)

    file_path = os.path.join(directory, file_name)
    
    frame_count = 0
    # 추출할 프레임 간격 설정
    frame_interval = 5  # 5프레임당 1장 추출

    #cap = cv2.VideoCapture(0)
    #detector = vc.keypointDetector()

    while True:
        success, img = cap.read()
        
        frame_count += 1
        # frame_interval 만큼의 간격으로 프레임 저장
        if frame_count % frame_interval == 0:
            images.append(img)
            #result, image = detector.get_keypoint(img)
            #sequence.append(result.tolist())
            #print(cTime - pTime)
            print(f"time: {cTime - pTime}")
        if not success:
            break
    
    for img in images:
        result, _ = detector.get_keypoint(img)
        sequence.append(result.tolist())



if __name__ == "__main__":
    main()
np.save('D:/admin/Documents/x_save', x) # x_save.npy
