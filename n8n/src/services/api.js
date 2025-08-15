import axios from 'axios';

const API_BASE_URL = 'http://localhost:5678';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2 minute timeout
    });
  }

  /**
   * Send a message to the n8n webhook
   * @param {string} message - The message to send
   * @returns {Promise<Object>} The response from the webhook
   */
  async sendMessage(message) {
    try {
      const response = await this.client.post('/webhook/demo', {
        text: message
      });

      // Parse the response to extract result and steps
      const data = response.data;
      
      // Log the raw response for debugging
      console.log('Raw API Response:', data);
      
      // Handle the case where response is an array with a single object
      let responseData = data;
      if (Array.isArray(data) && data.length > 0) {
        responseData = data[0];
      }
      
      console.log('Parsed Response Data:', responseData);
      
      // Check for graph in the response
      if (responseData.markdown && typeof responseData.markdown === 'string' && responseData.markdown.startsWith('![Chart](data:image/png;base64,')) {
        return {
          success: true,
          result: responseData.markdown.substring('![Chart]('.length, responseData.markdown.length - 1),
          steps: [],
          isGraph: true,
          rawResponse: data,
        };
      }
      
      return {
        success: true,
        result: responseData.output || responseData.result || 'No result found',
        steps: responseData.intermediateSteps || responseData.steps || [],
        isGraph: false,
        rawResponse: data
      };
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: `Server error: ${error.response.status}`,
          message: error.response.data?.message || 'Unknown server error',
          result: null,
          steps: []
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: 'Network error',
          message: 'Unable to connect to the server. Make sure n8n is running and the webhook is in test mode.',
          result: null,
          steps: []
        };
      } else {
        // Other error
        return {
          success: false,
          error: 'Unknown error',
          message: error.message || 'An unexpected error occurred',
          result: null,
          steps: []
        };
      }
    }
  }

  /**
   * Parse the steps from the response to extract thinking process
   * @param {Object|Array} steps - The steps object or array from the response
   * @returns {Array} Formatted thinking steps
   */
  parseThinkingSteps(steps) {
    console.log('Parsing thinking steps:', steps);
    
    // Handle case where steps is an array (intermediateSteps format)
    if (Array.isArray(steps)) {
      const parsed = steps.map((step, index) => {
        const action = step.action || {};
        const observation = step.observation || '';

        return {
          id: index + 1,
          tool: action.tool || 'unknown',
          toolInput: action.toolInput || '',
          log: action.log || '',
          observation: observation,
          timestamp: new Date().toISOString()
        };
      });
      
      console.log('Parsed thinking steps (array):', parsed);
      return parsed;
    }
    
    // Handle case where steps is an object (single step)
    if (steps && typeof steps === 'object' && !Array.isArray(steps)) {
      const action = steps.action || {};
      const observation = steps.observation || '';

      const parsed = [{
        id: 1,
        tool: action.tool || 'unknown',
        toolInput: action.toolInput || '',
        log: action.log || '',
        observation: observation,
        timestamp: new Date().toISOString()
      }];
      
      console.log('Parsed thinking steps (object):', parsed);
      return parsed;
    }

    console.log('No valid steps found, returning empty array');
    return [];
  }
}

const apiService = new ApiService();
export default apiService; 