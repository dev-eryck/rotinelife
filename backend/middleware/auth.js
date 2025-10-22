const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acesso necessário' 
      });
    }

    const secret = process.env.JWT_SECRET || 'rotinelife_demo_secret_key_2024';
    const decoded = jwt.verify(token, secret);
    
    // Buscar usuário real no banco
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        message: 'Usuário não encontrado' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado' 
      });
    }
    
    console.error('Erro na autenticação:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
};

// Middleware opcional - não falha se não houver token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const secret = process.env.JWT_SECRET || 'rotinelife_demo_secret_key_2024';
      const decoded = jwt.verify(token, secret);
      
      // Buscar usuário real no banco
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continua sem usuário autenticado
    next();
  }
};

module.exports = { auth, optionalAuth };