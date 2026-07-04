import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Import blueprints
from routes.analyze import analyze_bp
from routes.report import report_bp
from routes.chat import chat_bp

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configure Upload Folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Register Blueprints
app.register_blueprint(analyze_bp)
app.register_blueprint(report_bp)
app.register_blueprint(chat_bp)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part in the request"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        # Generate unique filename to avoid collision
        filename = secure_filename(file.filename)
        unique_prefix = str(uuid.uuid4())[:8]
        filename = f"{unique_prefix}_{filename}"
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        return jsonify({
            "success": True,
            "filename": filename,
            "message": "File uploaded successfully"
        })
        
    return jsonify({"success": False, "error": "Allowed file types are png, jpg, jpeg, gif, webp"}), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    from utils.gemini_helper import is_gemini_available
    return jsonify({
        "status": "healthy",
        "gemini_api_configured": is_gemini_available()
    })

if __name__ == '__main__':
    # Listen on all interfaces for local development
    app.run(host='127.0.0.1', port=5000, debug=True)
