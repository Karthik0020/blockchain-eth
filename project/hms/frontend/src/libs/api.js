import { API_BASE } from "./config";


export const api = {
  get: async (endpoint) => {
    try {
      console.log(`Making GET request to: ${API_BASE}${endpoint}`);
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log(`GET response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },
  post: async (endpoint, data) => {
    try {
      console.log(`Making POST request to: ${API_BASE}${endpoint}`, data);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      console.log(`POST response for ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },
  put: async (endpoint, data) => {
    try {
      console.log(`Making PUT request to: ${API_BASE}${endpoint}`, data);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      console.log(`PUT response for ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }
}