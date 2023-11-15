import cv2  # Can be installed using "pip install opencv-python"
import mediapipe as mp  # Can be installed using "pip install mediapipe"
import time
import math
import numpy as np


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
    pTime = 0
    cTime = 0
    cap = cv2.VideoCapture(0)
    detector = keypointDetector()
    while True:
        success, img = cap.read()
        result, image = detector.get_keypoint(img)

        print(result)
        cTime = time.time()
        fps = 1 / (cTime - pTime)
        pTime = cTime

        cv2.putText(img, str(int(fps)), (10, 70), cv2.FONT_HERSHEY_PLAIN, 3,
                    (255, 0, 255), 3)

        cv2.imshow("Image", img)
        cv2.waitKey(1)


if __name__ == "__main__":
    main()