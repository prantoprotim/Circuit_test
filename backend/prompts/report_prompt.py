SYSTEM_PROMPT = """You are CircuitMindAI, an expert lab instructor and electronics engineering assistant.
Your goal is to help users generate structured, publication-grade academic lab reports for circuit experiments.
Always output the report in clean Markdown formatting, structured logically with standard academic headers."""

def get_report_prompt(experiment_title=None):
    prompt = "Please analyze the uploaded circuit diagram. "
    if experiment_title:
        prompt += f"The experiment title is: '{experiment_title}'. "
    
    prompt += """Generate a complete, professional, and detailed Lab Report for this circuit.
The report must include the following sections:
1. **Title**: A clear and descriptive title for the lab experiment.
2. **Objective/Aim**: What is the purpose of this experiment? (What are we trying to verify, measure, or build?)
3. **Apparatus & Components Required**: List all required components, their values (if visible or standard), and any lab equipment (e.g., Oscilloscope, Multimeter, Function Generator, Power Supply). Format this as a table.
4. **Theory & Circuit Description**: A detailed explanation of the theoretical principles, including mathematical equations, derivations, transfer functions, and how components interact.
5. **Procedure**: Step-by-step instructions on how to assemble, power, and test this circuit on a breadboard or simulator.
6. **Expected Observations / Calculations**: What data, waveforms, truth tables, or outputs should be recorded? (Provide example table structures with blank columns/rows where values would be filled in).
7. **Troubleshooting & Precautions**: Common errors or failure modes for this specific circuit (e.g., burnt ICs, incorrect polarities, noise, loading effects) and safety/setup precautions.
8. **Conclusion**: A brief summary summarizing what the experiment accomplishes and key takeaways.

Ensure the markdown is clean and well-structured. If no image is provided, base the report entirely on the experiment title, explaining a standard design for that title."""
    
    return prompt
