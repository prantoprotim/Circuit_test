import os
from flask import Blueprint, request, jsonify, current_app
from prompts.viva_prompt import SYSTEM_PROMPT as VIVA_SYSTEM_PROMPT, get_viva_start_prompt
from utils.gemini_helper import generate_content, generate_chat_response

chat_bp = Blueprint('chat', __name__)

CHAT_SYSTEM_PROMPT = """You are CircuitMindAI, a helpful, knowledgeable engineering assistant.
Answer the student's questions about the circuit diagram, experimental setup, or general electronics.
Explain complex concepts using analogies, calculations, or circuit behavior. Use clean Markdown for response formatting."""

@chat_bp.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json() or {}
        message = data.get('message')
        history = data.get('history', [])
        image_filename = data.get('image_filename')
        
        if not message:
            return jsonify({"error": "Message is required."}), 400
            
        image_path = None
        if image_filename:
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_filename)
            if not os.path.exists(image_path):
                return jsonify({"error": f"Image file {image_filename} not found."}), 404
        
        # Append latest message to history
        full_history = list(history)
        full_history.append({"role": "user", "content": message})
        
        response_text = generate_chat_response(
            messages=full_history,
            system_instruction=CHAT_SYSTEM_PROMPT,
            image_path=image_path
        )
        
        return jsonify({
            "success": True,
            "response": response_text
        })
        
    except Exception as e:
        print(f"Error in chat route: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@chat_bp.route('/api/viva/start', methods=['POST'])
def viva_start():
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
            return jsonify({"error": "Please provide either a circuit image or an experiment title to start the Viva session."}), 400
            
        prompt = get_viva_start_prompt(experiment_title)
        
        viva_init_text = generate_content(
            prompt=prompt,
            system_instruction=VIVA_SYSTEM_PROMPT,
            image_path=image_path
        )
        
        return jsonify({
            "success": True,
            "response": viva_init_text
        })
        
    except Exception as e:
        print(f"Error in viva start route: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@chat_bp.route('/api/viva/respond', methods=['POST'])
def viva_respond():
    try:
        data = request.get_json() or {}
        message = data.get('message')
        history = data.get('history', [])
        image_filename = data.get('image_filename')
        
        if not message:
            return jsonify({"error": "Message is required."}), 400
            
        image_path = None
        if image_filename:
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_filename)
            if not os.path.exists(image_path):
                return jsonify({"error": f"Image file {image_filename} not found."}), 404
                
        # Append latest student answer to the history
        full_history = list(history)
        full_history.append({"role": "user", "content": message})
        
        response_text = generate_chat_response(
            messages=full_history,
            system_instruction=VIVA_SYSTEM_PROMPT,
            image_path=image_path
        )
        
        return jsonify({
            "success": True,
            "response": response_text
        })
        
    except Exception as e:
        print(f"Error in viva respond route: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
