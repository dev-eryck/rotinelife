const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Goal = require('../models/Goal');

const router = express.Router();

// @route   GET /api/goals
// @desc    Obter metas do usuário
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    // Calcular progresso para cada meta
    const goalsWithProgress = goals.map(goal => {
      const progress = goal.calculateProgress();
      return {
        ...goal.toObject(),
        deadline: goal.targetDate, // Mapear targetDate para deadline
        percentage: progress.percentage,
        remaining: progress.remaining,
        daysRemaining: progress.daysRemaining,
        isCompleted: progress.isCompleted,
        isOverdue: progress.isOverdue
      };
    });

    res.json(goalsWithProgress);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   POST /api/goals
// @desc    Criar nova meta
// @access  Private
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Nome deve ter entre 1 e 100 caracteres'),
  body('target').isFloat({ min: 0.01 }).withMessage('Valor alvo deve ser maior que zero'),
  body('description').optional().isString().withMessage('Descrição deve ser uma string'),
  body('deadline').optional().isISO8601().withMessage('Data limite inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, target, description, deadline } = req.body;

    const goal = new Goal({
      user: req.user._id,
      title: name,
      description: description || '',
      targetAmount: parseFloat(target),
      currentAmount: 0,
      targetDate: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias se não especificado
      type: 'savings',
      priority: 'medium',
      status: 'active'
    });

    await goal.save();

    res.status(201).json({
      message: 'Meta criada com sucesso',
      goal
    });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   PUT /api/goals/:id
// @desc    Atualizar meta
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Nome deve ter entre 1 e 100 caracteres'),
  body('target').optional().isFloat({ min: 0.01 }).withMessage('Valor alvo deve ser maior que zero'),
  body('description').optional().isString(),
  body('deadline').optional().isISO8601().withMessage('Data limite inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, target, description, deadline } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.title = name;
    if (target !== undefined) updateData.targetAmount = parseFloat(target);
    if (description !== undefined) updateData.description = description;
    if (deadline !== undefined) updateData.targetDate = new Date(deadline);

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }

    res.json({ message: 'Meta atualizada com sucesso', goal });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Deletar meta
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }

    res.json({ message: 'Meta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;