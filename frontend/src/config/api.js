// Configuração da API
const API_BASE_URL = window.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  ME: `${API_BASE_URL}/api/auth/me`,
  
  // Transactions
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  
  // Budgets
  BUDGETS: `${API_BASE_URL}/api/budgets`,
  
  // Goals
  GOALS: `${API_BASE_URL}/api/goals`,
  
  // Settings
  SETTINGS: `${API_BASE_URL}/api/settings`,
};

export default API_BASE_URL;
