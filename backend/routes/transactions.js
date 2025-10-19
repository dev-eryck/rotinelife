const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Obter transações do usuário
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('type').optional().isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
  query('category').optional().isMongoId().withMessage('Categoria inválida'),
  query('startDate').optional().isISO8601().withMessage('Data de início inválida'),
  query('endDate').optional().isISO8601().withMessage('Data de fim inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Parâmetros inválidos',
        errors: errors.array()
      });
    }

    // Modo demo - dados simulados
    const demoTransactions = [
      {
        _id: 'demo-1',
        type: 'income',
        amount: 5000,
        description: 'Salário',
        category: { name: 'Salário', icon: '💰', color: '#4CAF50', type: 'income' },
        date: new Date(),
        paymentMethod: 'bank_transfer'
      },
      {
        _id: 'demo-2',
        type: 'expense',
        amount: -1200,
        description: 'Supermercado',
        category: { name: 'Alimentação', icon: '🍽️', color: '#F44336', type: 'expense' },
        date: new Date(Date.now() - 86400000),
        paymentMethod: 'credit_card'
      },
      {
        _id: 'demo-3',
        type: 'expense',
        amount: -300,
        description: 'Gasolina',
        category: { name: 'Transporte', icon: '🚗', color: '#607D8B', type: 'expense' },
        date: new Date(Date.now() - 172800000),
        paymentMethod: 'debit_card'
      }
    ];

    res.json({
      transactions: demoTransactions,
      pagination: {
        current: 1,
        pages: 1,
        total: demoTransactions.length,
        limit: 20
      },
      summary: {
        income: 5000,
        expense: 1500,
        balance: 3500
      }
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/transactions
// @desc    Criar nova transação
// @access  Private
router.post('/', [
  auth,
  body('type').isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Descrição deve ter entre 1 e 200 caracteres'),
  body('category').isMongoId().withMessage('Categoria é obrigatória'),
  body('date').isISO8601().withMessage('Data inválida'),
  body('paymentMethod').optional().isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'other']).withMessage('Método de pagamento inválido')
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
    const transaction = {
      _id: 'transaction-' + Date.now(),
      ...req.body,
      user: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      message: 'Transação criada com sucesso (modo demo)',
      transaction
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Atualizar transação
// @access  Private
router.put('/:id', [
  auth,
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('description').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Descrição deve ter entre 1 e 200 caracteres'),
  body('date').optional().isISO8601().withMessage('Data inválida')
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
    const transaction = {
      _id: req.params.id,
      ...req.body,
      updatedAt: new Date()
    };

    res.json({
      message: 'Transação atualizada com sucesso (modo demo)',
      transaction
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Excluir transação
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Modo demo - simular exclusão
    res.json({
      message: 'Transação excluída com sucesso (modo demo)'
    });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;