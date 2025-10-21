// Configuração de ambiente para produção
window.REACT_APP_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://rotinelife-backend.onrender.com' 
  : 'http://localhost:5000';
