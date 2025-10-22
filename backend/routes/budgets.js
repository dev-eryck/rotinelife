const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Budget = require('../models/Budget');
const Category = require('../models/Category');

const router = express.Router();

// @route   GET /api/budgets
// @desc    Obter orçamentos do usuário
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id })
      .populate('category', 'name color type icon')
      .sort({ createdAt: -1 });

    res.json(budgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   POST /api/budgets
// @desc    Criar novo orçamento
// @access  Private
router.post('/', [
  auth,
  body('category').isMongoId().withMessage('Categoria é obrigatória'),
  body('limit').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { category, limit, description } = req.body;

    // Verificar se a categoria existe e pertence ao usuário
    const categoryDoc = await Category.findOne({ _id: category, user: req.user._id });
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Categoria não encontrada' });
    }

    const budget = new Budget({
      user: req.user._id,
      category,
      amount: parseFloat(limit),
      period: 'monthly',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      description: description || ''
    });

    await budget.save();
    await budget.populate('category', 'name color type icon');

    res.status(201).json({
      message: 'Orçamento criado com sucesso',
      budget
    });
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Atualizar orçamento
// @access  Private
router.put('/:id', [
  auth,
  body('limit').optional().isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { limit, description } = req.body;
    const updateData = {};

    if (limit !== undefined) updateData.amount = parseFloat(limit);
    if (description !== undefined) updateData.description = description;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name color type icon');

    if (!budget) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }

    res.json({ message: 'Orçamento atualizado com sucesso', budget });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Deletar orçamento
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }

    res.json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;