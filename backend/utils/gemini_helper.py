import os
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

# Load env variables from backend/.env if it exists
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
load_dotenv() # also load from current dir

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)

def is_gemini_available():
    return bool(os.getenv("GEMINI_API_KEY"))

def get_model(system_instruction=None):
    if not is_gemini_available():
        raise ValueError("GEMINI_API_KEY is not set. Please create a backend/.env file and set GEMINI_API_KEY.")
    
    # Using gemini-1.5-flash or gemini-2.5-flash
    # Let's try gemini-2.5-flash which is fast and supports multimodality + system instructions
    return genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        system_instruction=system_instruction
    )

def generate_content(prompt, system_instruction=None, image_path=None):
    if not is_gemini_available():
        return get_mock_response(prompt, image_path)
        
    try:
        model = get_model(system_instruction)
        
        contents = []
        if image_path and os.path.exists(image_path):
            try:
                img = Image.open(image_path)
                contents.append(img)
            except Exception as e:
                print(f"Error loading image: {e}")
                
        contents.append(prompt)
        
        response = model.generate_content(contents)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return f"Error calling Gemini API: {str(e)}"

def generate_chat_response(messages, system_instruction=None, image_path=None):
    """
    messages format: [{'role': 'user'|'model', 'content': 'text'}]
    """
    if not is_gemini_available():
        last_msg = messages[-1]['content'] if messages else ""
        return get_mock_chat_response(last_msg, messages)

    try:
        model = get_model(system_instruction)
        
        # Format history for Gemini
        formatted_contents = []
        
        for i, msg in enumerate(messages):
            role = 'user' if msg['role'] == 'user' else 'model'
            
            parts = []
            # For the very first user message, if we have an image, append it
            if i == 0 and role == 'user' and image_path and os.path.exists(image_path):
                try:
                    img = Image.open(image_path)
                    parts.append(img)
                except Exception as e:
                    print(f"Error loading image in history: {e}")
                    
            parts.append(msg['content'])
            formatted_contents.append({
                'role': role,
                'parts': parts
            })
            
        response = model.generate_content(formatted_contents)
        return response.text
    except Exception as e:
        print(f"Gemini Chat API Error: {e}")
        return f"Error calling Gemini API for chat: {str(e)}"

def get_mock_response(prompt, image_path=None):
    has_image = f"with image upload (`{os.path.basename(image_path)}`)" if image_path else "without image"
    prompt_summary = prompt.split('.')[0]
    
    template = r"""### ⚠️ Gemini API Key Not Configured

To enable real-time analysis using Gemini, please create a `.env` file in the `backend/` directory and add your API key:
```env
GEMINI_API_KEY=your_api_key_here
```

---

### [Demo Mode] Circuit Explanation
*This is a mock response demonstrating the layout and features.*

* **Status**: Running in Demo Mode ({has_image})
* **Prompt analyzed**: {prompt_summary}

#### 1. Circuit Overview
The circuit appears to be a standard **RC Low Pass Filter** connected to an operational amplifier (**Op-Amp**) configured as a non-inverting buffer. It is designed to filter out high-frequency noise from an analog sensor signal before digital conversion.

#### 2. Key Components
| Component | Reference | Value | Description |
| :--- | :--- | :--- | :--- |
| Operational Amplifier | IC1 | UA741 or LM358 | Non-inverting buffer (voltage follower) providing high input impedance. |
| Resistor | R1 | 10 kΩ | Forms the RC low-pass network with C1. |
| Capacitor | C1 | 100 nF | Forms the RC low-pass network with R1. Cut-off frequency filter. |

#### 3. Mathematical Formulae & Calculations
The cut-off frequency (\(f_c\)) of the RC filter is calculated as:
\[f_c = \frac{1}{2 \pi R C}\]

Substituting the component values:
\[f_c = \frac{1}{2 \pi \times 10,000 \times 100 \times 10^{-9}} \approx 159.15\text{ Hz}\]

Signals below \(159.15\text{ Hz}\) will pass through with minimal attenuation, while higher frequencies will be attenuated at a rate of \(-20\text{ dB/decade}\).

#### 4. Practical Applications
- Sensor signal conditioning (e.g., temperature sensors, pressure transducers).
- Anti-aliasing filter before Analog-to-Digital Conversion (ADC).
- Audio pre-processing circuits.
"""
    return template.replace('{has_image}', has_image).replace('{prompt_summary}', prompt_summary)

def get_mock_chat_response(last_msg, messages):
    is_viva = any("viva" in str(msg.get('content', '')).lower() for msg in messages)
    
    if is_viva:
        viva_step = sum(1 for m in messages if m.get('role') == 'user')
        if viva_step == 1:
            return """Welcome to the CircuitMindAI mock Viva Session! Let's test your knowledge about the RC Low Pass Filter.

**Question 1**: What is the primary purpose of the capacitor in an RC low-pass filter, and how does its impedance change with frequency?"""
        elif viva_step == 2:
            template = r"""Your response: "{last_msg}"

**Evaluation**: Good attempt! The capacitor acts as a frequency-dependent resistor. At high frequencies, its impedance ($Z_c = 1 / j\omega C$) becomes very small, shunting the high-frequency components to ground.

**Question 2**: If you want to double the cut-off frequency of this filter without changing the resistor, what modification should you make to the capacitor value?"""
            return template.replace('{last_msg}', last_msg)
        elif viva_step == 3:
            template = r"""Your response: "{last_msg}"

**Evaluation**: Correct! To double the frequency, you need to halve the capacitance since $f_c$ is inversely proportional to $C$.

**Question 3**: What is the purpose of placing a voltage follower (Op-Amp buffer) after the passive RC network?"""
            return template.replace('{last_msg}', last_msg)
        else:
            template = r"""Your response: "{last_msg}"

**Evaluation**: Spot on! The buffer provides high input impedance (preventing loading effects on the RC filter) and low output impedance to drive subsequent stages.

---
### 🎉 Viva Examination Complete!
**Performance Summary**: 
- Basic understanding of passive components: **Excellent**
- Math and filter design relationship: **Good**
- Loading effects and buffering concepts: **Excellent**

**Overall Grade**: A (5/5)"""
            return template.replace('{last_msg}', last_msg)

    template = r"""### [Demo Mode] Chat Reply
*Please set your `GEMINI_API_KEY` in the `backend/.env` file to chat with the live model.*

You asked: "{last_msg}"

**Response**: To calculate the power dissipation in the resistor, use Joule's Law:
\[P = I^2 R = \frac{V^2}{R}\]
Ensure the resistor power rating (e.g., $1/4\text{ W}$) is at least double your calculated power dissipation to prevent overheating. What other aspect of the circuit would you like to discuss?
"""
    return template.replace('{last_msg}', last_msg)
