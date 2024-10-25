import os, tempfile
import cv2 as cv
from PIL import Image
import streamlit as st
from ultralytics import YOLO
from collections import Counter

MODEL_DIR = './miscellaneous/runs/detect/train/weights/best.pt'
 
def main():
    global model
    model = YOLO(MODEL_DIR)
    
    st.title("Voice-Activated Deterrent System for Preventing Wild Animal Intrusion in Farmland")
    st.write("This model is trained to detect and identify animals commonly found in farmland environments, such as Buffalo, Cattle, Deer, Dog, Fox, Pig, Sheep, and Wolf. These animals are specifically chosen due to their frequent presence in and around farmland areas.")

    uploaded_file = st.file_uploader("Upload an image or video", type=['jpg', 'jpeg', 'png', 'mp4'])

    if uploaded_file:
        if uploaded_file.type.startswith('image'):
            inference_images(uploaded_file)
        
        if uploaded_file.type.startswith('video'):
            inference_video(uploaded_file)

def inference_images(uploaded_file):
    image = Image.open(uploaded_file)
    predict = model.predict(image)
    print("predict", predict)

    boxes = predict[0].boxes
    print("boxes", boxes)
    plotted = predict[0].plot()[:, :, ::-1]

    if len(boxes) == 0:
        st.markdown("<h2 style='text-align: center;'>No Detection</h2>", unsafe_allow_html=True)

    class_ids = [int(box.cls) for box in boxes]
    class_names = {0: 'Buffalo', 1: 'Cattle', 2: 'Deer', 3: 'Dog', 4: 'Pig', 5: 'Fox', 6: 'Sheep', 7: 'Wolf'}
    detected_classes = [class_names[class_id] for class_id in class_ids]
    class_counts = Counter(detected_classes)
    caption = ", ".join([f"{count} {cls}" for cls, count in class_counts.items()])
    
    st.image(plotted, caption=caption)

def inference_video(uploaded_file):
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    temp_file.write(uploaded_file.read())
    temp_file.close()

    cap = cv.VideoCapture(temp_file.name)
    frame_count = 0

    if not cap.isOpened():
        st.error("Error opening video file.")

    frame_placeholder = st.empty()
    stop_placeholder = st.button("Cancel")

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        frame_count += 1
        
        if frame_count % 2 == 0:
            predict = model.predict(frame, conf=0.75)
            plotted = predict[0].plot()
            frame_placeholder.image(plotted, channels="BGR", caption="")
        
        if stop_placeholder:
            os.unlink(temp_file.name)
            break

    cap.release()  
    
if __name__=='__main__':
    main()