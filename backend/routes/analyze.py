import os
from flask import Blueprint, request, jsonify, current_app
from prompts.circuit_prompt import SYSTEM_PROMPT, get_explain_prompt
from utils.gemini_helper import generate_content

analyze_bp = Blueprint('analyze', __name__)

@analyze_bp.route('/api/analyze', methods=['POST'])
def analyze_circuit():
    try:
        data = request.get_json() or {}
        experiment_title = data.get('experiment_title')
        image_filename = data.get('image_filename')
        
        image_path = None
        if image_filename:
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_filename)
            if not os.path.exists(image_path):
                return jsonify({"error": f"Image file {image_filename} not found."}), 404
        
        if not experiment_title and not image_filename:
            return jsonify({"error": "Please provide either a circuit image or an experiment title."}), 400
            
        prompt = get_explain_prompt(experiment_title)
        
        explanation = generate_content(
            prompt=prompt,
            system_instruction=SYSTEM_PROMPT,
            image_path=image_path
        )
        
        return jsonify({
            "success": True,
            "response": explanation
        })
        
    except Exception as e:
        print(f"Error in analyze route: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
