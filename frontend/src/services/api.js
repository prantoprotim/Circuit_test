const API_BASE_URL = 'https://circuit-test-zk76.onrender.com/api';

/**
 * Uploads a circuit image file to the backend
 * @param {File} file 
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>}
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Network error connecting to backend.' };
  }
}

/**
 * Generates an explanation for the circuit
 * @param {string} experimentTitle 
 * @param {string} imageFilename 
 */
export async function explainCircuit(experimentTitle, imageFilename) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experiment_title: experimentTitle,
        image_filename: imageFilename
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Analyze error:', error);
    return { success: false, error: 'Network error connecting to backend.' };
  }
}

/**
 * Generates a structured lab report
 * @param {string} experimentTitle 
 * @param {string} imageFilename 
 */
export async function generateLabReport(experimentTitle, imageFilename) {
  try {
    const response = await fetch(`${API_BASE_URL}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experiment_title: experimentTitle,
        image_filename: imageFilename
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Report error:', error);
    return { success: false, error: 'Network error connecting to backend.' };
  }
}

/**
 * Sends a message in the general chat context
 * @param {string} message 
 * @param {Array<{role: string, content: string}>} history 
 * @param {string} imageFilename 
 */
export async function sendChatMessage(message, history, imageFilename) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        image_filename: imageFilename
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Chat error:', error);
    return { success: false, error: 'Network error connecting to backend.' };
  }
}

/**
 * Starts a viva session
 * @param {string} experimentTitle 
 * @param {string} imageFilename 
 */
export async function startVivaSession(experimentTitle, imageFilename) {
  try {
    const response = await fetch(`${API_BASE_URL}/viva/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experiment_title: experimentTitle,
        image_filename: imageFilename
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Viva start error:', error);
    return { success: false, error: 'Network error connecting to backend.' };
  }
}

/**
 * Sends a student response in the viva context
 * @param {string} message 
 * @param {Array<{role: string, content: string}>} history 
 * @param {string} imageFilename 
 */
export async function sendVivaResponse(message, history, imageFilename) {
  try {
    const response = await fetch(`${API_BASE_URL}/viva/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        image_filename: imageFilename
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Viva respond error:', error);
    return { success: false, error: 'Network error connecting to backend.' };
  }
}
