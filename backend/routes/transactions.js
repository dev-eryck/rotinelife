const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

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

    const { page = 1, limit = 20, type, category, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const filters = { user: req.user._id };
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // Buscar transações
    const transactions = await Transaction.find(filters)
      .populate('category', 'name color type')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total
    const total = await Transaction.countDocuments(filters);

    // Calcular resumo
    const summary = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = summary.find(s => s._id === 'income')?.total || 0;
    const expense = Math.abs(summary.find(s => s._id === 'expense')?.total || 0);
    const balance = income - expense;

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      summary: {
        income,
        expense,
        balance
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

    const { type, amount, description, category, date, paymentMethod } = req.body;

    // Verificar se categoria existe e pertence ao usuário
    const categoryDoc = await Category.findOne({ _id: category, user: req.user._id });
    if (!categoryDoc) {
      return res.status(400).json({
        message: 'Categoria não encontrada'
      });
    }

    // Criar transação
    const transaction = new Transaction({
      type,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      description,
      category,
      date: new Date(date),
      paymentMethod: paymentMethod || 'other',
      user: req.user._id
    });

    await transaction.save();
    await transaction.populate('category', 'name color type');

    res.status(201).json({
      message: 'Transação criada com sucesso',
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

    const { amount, description, date } = req.body;
    const updateData = {};

    if (amount !== undefined) {
      const transaction = await Transaction.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({
          message: 'Transação não encontrada'
        });
      }
      updateData.amount = transaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    }
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name color type');

    if (!transaction) {
      return res.status(404).json({
        message: 'Transação não encontrada'
      });
    }

    res.json({
      message: 'Transação atualizada com sucesso',
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
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        message: 'Transação não encontrada'
      });
    }

    res.json({
      message: 'Transação excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;