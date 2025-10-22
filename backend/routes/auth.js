const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Category = require('../models/Category');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Gerar token JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'rotinelife_demo_secret_key_2024';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Registro - Dados recebidos:', req.body);
    
    // Validação manual simples
    const { name, email, password } = req.body;
    
    console.log('Validando nome:', name, 'length:', name?.length);
    if (!name || name.length < 2) {
      console.log('Erro: Nome inválido');
      return res.status(400).json({
        message: 'Nome deve ter pelo menos 2 caracteres'
      });
    }
    
    console.log('Validando email:', email);
    if (!email || !email.includes('@')) {
      console.log('Erro: Email inválido');
      return res.status(400).json({
        message: 'Email inválido'
      });
    }
    
    console.log('Validando senha:', password, 'length:', password?.length);
    if (!password || password.length < 6) {
      console.log('Erro: Senha inválida');
      return res.status(400).json({
        message: 'Senha deve ter pelo menos 6 caracteres'
      });
    }
    
    console.log('Validação passou, verificando usuário existente...');

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    console.log('Usuário existente encontrado:', existingUser ? 'Sim' : 'Não');
    if (existingUser) {
      console.log('Erro: Usuário já existe');
      return res.status(400).json({
        message: 'Usuário já existe com este email'
      });
    }

    // Criar hash da senha
    console.log('Criando hash da senha...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hash criado com sucesso');

    // Criar usuário
    console.log('Criando usuário...');
    const user = new User({
      name,
      email,
      password: hashedPassword,
      preferences: {
        currency: 'BRL',
        language: 'pt-BR',
        theme: 'light'
      }
    });

    await user.save();
    console.log('Usuário salvo com sucesso, ID:', user._id);

    // Criar categorias padrão para o usuário
    const defaultCategories = [
      { name: 'Alimentação', type: 'expense', color: '#FF6B6B', user: user._id },
      { name: 'Transporte', type: 'expense', color: '#4ECDC4', user: user._id },
      { name: 'Lazer', type: 'expense', color: '#45B7D1', user: user._id },
      { name: 'Saúde', type: 'expense', color: '#96CEB4', user: user._id },
      { name: 'Educação', type: 'expense', color: '#FFEAA7', user: user._id },
      { name: 'Salário', type: 'income', color: '#6C5CE7', user: user._id },
      { name: 'Freelance', type: 'income', color: '#A29BFE', user: user._id },
      { name: 'Investimentos', type: 'income', color: '#FD79A8', user: user._id }
    ];

    await Category.insertMany(defaultCategories);

    // Gerar token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Fazer login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login - Dados recebidos:', req.body);
    
    // Validação manual simples
    const { email, password } = req.body;
    
    console.log('Validando email:', email);
    if (!email || !email.includes('@')) {
      console.log('Erro: Email inválido');
      return res.status(400).json({
        message: 'Email inválido'
      });
    }
    
    console.log('Validando senha:', password);
    if (!password) {
      console.log('Erro: Senha obrigatória');
      return res.status(400).json({
        message: 'Senha é obrigatória'
      });
    }
    
    console.log('Validação passou, buscando usuário...');

    // Buscar usuário
    const user = await User.findOne({ email }).select('+password');
    console.log('Usuário encontrado:', user ? 'Sim' : 'Não');
    if (!user) {
      console.log('Erro: Usuário não encontrado');
      return res.status(400).json({
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    console.log('Verificando senha...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Senha correta:', isMatch);
    if (!isMatch) {
      console.log('Erro: Senha incorreta');
      return res.status(400).json({
        message: 'Credenciais inválidas'
      });
    }
    
    console.log('Login bem-sucedido!');

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Obter dados do usuário atual
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        preferences: req.user.preferences,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Atualizar perfil do usuário
// @access  Private
router.put('/profile', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('preferences.currency')
    .optional()
    .isIn(['BRL', 'USD', 'EUR'])
    .withMessage('Moeda inválida'),
  body('preferences.language')
    .optional()
    .isIn(['pt-BR', 'en-US', 'es-ES'])
    .withMessage('Idioma inválido'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Tema inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, preferences } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (preferences) {
      updateData.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/auth/password
// @desc    Alterar senha
// @access  Private
router.put('/password', [
  auth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter no mínimo 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Buscar usuário com senha
    const user = await User.findById(req.user._id).select('+password');
    
    // Verificar senha atual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/auth/account
// @desc    Deletar conta
// @access  Private
router.delete('/account', [
  auth,
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória para deletar conta')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { password } = req.body;

    // Buscar usuário com senha
    const user = await User.findById(req.user._id).select('+password');
    
    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Senha incorreta'
      });
    }

    // Desativar conta (soft delete)
    user.isActive = false;
    await user.save();

    res.json({
      message: 'Conta deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;