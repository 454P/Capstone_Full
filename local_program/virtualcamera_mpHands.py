import argparse
import cv2


import mediapipe as mp  # Can be installed using "pip install mediapipe"
import time
import math
import numpy as np


class keypointDetector():
    def __init__(self, mode=False, maxHands=2, detectionCon=False, trackCon=0.5):
        self.mp_holistic = mp.solutions.holistic
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_face_mesh = mp.solutions.face_mesh
        

        
        self.mode = mode
        self.maxHands = maxHands
        self.detectionCon = detectionCon
        self.trackCon = trackCon

        self.mpHands = mp.solutions.hands
        self.hands = self.mpHands.Hands(self.mode, self.maxHands,
                                        self.detectionCon, self.trackCon)
        self.mpDraw = mp.solutions.drawing_utils
        self.tipIds = [4, 8, 12, 16, 20]
    
    def findHands(self, img, draw=True):    # Finds all hands in a frame
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.results = self.hands.process(imgRGB)

        if self.results.multi_hand_landmarks:
            for handLms in self.results.multi_hand_landmarks:
                if draw:
                    self.mpDraw.draw_landmarks(img, handLms,
                                               self.mpHands.HAND_CONNECTIONS)
        return img
    
    def findPosition(self, img, handNo=0, draw=True):   # Fetches the position of hands
        print(self.results.left_hand_landmarks.landmark)
        lh = np.array([[res.x*3, res.y*3, res.z*3] for res in self.results.left_hand_landmarks.landmark]).flatten() if self.results.left_hand_landmarks else np.zeros(21*3)
        rh = np.array([[res.x*3, res.y*3, res.z*3] for res in self.results.right_hand_landmarks.landmark]).flatten() if self.results.right_hand_landmarks else np.zeros(21*3)
        return np.concatenate([lh, rh])

def main():
    pTime = 0
    cTime = 0
    cap = cv2.VideoCapture(0)
    detector = keypointDetector()
    ff=0
    while True:
        success, img = cap.read()
        #result, image = detector.get_keypoint(img)
        img = detector.findHands(img)
        #result = detector.findPosition(img)
        cTime = time.time()
        fps = 1 / (cTime - pTime)
        pTime = cTime
        print(f"ff: {ff}")
        ff+=1
        cv2.putText(img, str(int(fps)), (10, 70), cv2.FONT_HERSHEY_PLAIN, 3,
                    (255, 0, 255), 3)

        cv2.imshow("Image", img)
        cv2.waitKey(1)


if __name__ == "__main__":
    main()