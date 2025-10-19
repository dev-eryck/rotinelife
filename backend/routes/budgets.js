const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/budgets
// @desc    Obter orçamentos do usuário
// @access  Private
router.get('/', [
  auth,
  query('active').optional().isBoolean().withMessage('Active deve ser boolean'),
  query('category').optional().isMongoId().withMessage('Categoria inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Parâmetros inválidos',
        errors: errors.array()
      });
    }

    // Modo demo - orçamentos simulados
    const demoBudgets = [
      {
        _id: 'budget-1',
        category: { name: 'Alimentação', icon: '🍽️', color: '#F44336', type: 'expense' },
        amount: 2000,
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        alertThreshold: 80,
        progress: {
          spent: 1200,
          budget: 2000,
          remaining: 800,
          percentage: 60,
          isOverBudget: false
        }
      },
      {
        _id: 'budget-2',
        category: { name: 'Transporte', icon: '🚗', color: '#607D8B', type: 'expense' },
        amount: 800,
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        alertThreshold: 80,
        progress: {
          spent: 300,
          budget: 800,
          remaining: 500,
          percentage: 37.5,
          isOverBudget: false
        }
      }
    ];

    res.json(demoBudgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/budgets/alerts/threshold
// @desc    Obter alertas de limite de orçamento
// @access  Private
router.get('/alerts/threshold', auth, async (req, res) => {
  try {
    // Modo demo - alertas simulados
    const thresholdAlerts = [
      {
        budget: {
          id: 'budget-1',
          category: { name: 'Alimentação', icon: '🍽️', color: '#F44336', type: 'expense' },
          amount: 2000,
          period: 'monthly'
        },
        progress: {
          spent: 1600,
          budget: 2000,
          remaining: 400,
          percentage: 80,
          isOverBudget: false
        },
        alertType: 'threshold'
      }
    ];

    res.json(thresholdAlerts);
  } catch (error) {
    console.error('Erro ao obter alertas de limite:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/budgets
// @desc    Criar novo orçamento
// @access  Private
router.post('/', [
  auth,
  body('category').isMongoId().withMessage('Categoria é obrigatória'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('period').isIn(['weekly', 'monthly', 'yearly']).withMessage('Período inválido'),
  body('startDate').isISO8601().withMessage('Data de início inválida'),
  body('endDate').isISO8601().withMessage('Data de fim inválida'),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }).withMessage('Limite de alerta deve ser entre 1 e 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Modo demo - simular criação
    const budget = {
      _id: 'budget-' + Date.now(),
      ...req.body,
      user: req.user._id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      message: 'Orçamento criado com sucesso (modo demo)',
      budget
    });
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Atualizar orçamento
// @access  Private
router.put('/:id', [
  auth,
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('period').optional().isIn(['weekly', 'monthly', 'yearly']).withMessage('Período inválido'),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }).withMessage('Limite de alerta deve ser entre 1 e 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Modo demo - simular atualização
    const budget = {
      _id: req.params.id,
      ...req.body,
      updatedAt: new Date()
    };

    res.json({
      message: 'Orçamento atualizado com sucesso (modo demo)',
      budget
    });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Excluir orçamento
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Modo demo - simular exclusão
    res.json({
      message: 'Orçamento excluído com sucesso (modo demo)'
    });
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;