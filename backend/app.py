from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image
from ultralytics import YOLO
from collections import Counter

app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)
CONNECTION_STRING = "mongodb://localhost:27017/AIF"
app.config["MONGO_URI"] = CONNECTION_STRING
db = PyMongo(app).db

MODEL_DIR = './best.pt'
model = YOLO(MODEL_DIR)

def serialize_document(doc):
    if doc is not None:
        doc['_id'] = str(doc['_id']) 
    return doc

@app.route('/', methods=['GET'])
def home():
    return "Server is running."

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    mailid = data.get('mailid')
    password = data.get('password')

    if not name or not mailid or not password:
        return jsonify({"message": "Please provide name, mailid, and password"}), 400

    if db.users.find_one({"mailid": mailid}):
        return jsonify({"message": "Mailid already exists"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    result = db.users.insert_one({
        "name": name,
        "mailid": mailid,
        "password": hashed_password
    })

    user = db.users.find_one({"_id": result.inserted_id})
    user = serialize_document(user) 

    return jsonify({"message": "User registred", "user": user}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    mailid = data.get('mailid')
    password = data.get('password')

    if not mailid or not password:
        return jsonify({"message": "Please provide mailid and password"}), 400

    user = db.users.find_one({"mailid": mailid})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({"message": "Invalid credentials"}), 401

    user = serialize_document(user) 

    return jsonify({"message": "User logged in", "user": user}), 200

@app.route("/predict", methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']

    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    try:
        image = Image.open(file)
        results = model.predict(image)

        detected_classes = []
        detected_boxes = []

        for result in results:
            if result.boxes is not None:
                boxes = result.boxes
                class_ids = [int(box.cls) for box in boxes]
                class_names = {0: 'Buffalo', 1: 'Cattle', 2: 'Deer', 3: 'Dog', 4: 'Pig', 5: 'Fox', 6: 'Sheep', 7: 'Wolf'}
                detected_classes.extend([class_names[class_id] for class_id in class_ids])
                detected_boxes.extend(boxes.xyxy.tolist()) 

        if not detected_classes:
            return jsonify({'message': 0})

        class_counts = Counter(detected_classes)

        return jsonify({
            'message': 1,
            'detected': class_counts,
            'boxes': detected_boxes
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug = True)