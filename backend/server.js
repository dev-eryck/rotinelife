const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://rotinelife.netlify.app', 
        'https://meek-quokka-ac7e0d.netlify.app',
        'https://rotinelifes.netlify.app'
      ]
    : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting (mais permissivo em desenvolvimento)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests em dev, 100 em prod
  trustProxy: false, // Desabilitar proxy para evitar warnings
  skip: (req) => {
    // Pular rate limiting para localhost em desenvolvimento
    return process.env.NODE_ENV !== 'production' && req.ip === '::1';
  }
});
app.use(limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conectar ao MongoDB (opcional para desenvolvimento)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));
} else {
  console.log('⚠️ MongoDB não configurado - usando modo demo');
}

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/settings', require('./routes/settings'));

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Algo deu errado!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});