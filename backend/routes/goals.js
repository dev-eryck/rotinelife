const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Goal = require('../models/Goal');
const Category = require('../models/Category');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/goals
// @desc    Obter metas do usuário
// @access  Private
router.get('/', [
  auth,
  query('status').optional().isIn(['active', 'paused', 'completed', 'cancelled']).withMessage('Status inválido'),
  query('type').optional().isIn(['savings', 'debt_payment', 'purchase', 'investment', 'other']).withMessage('Tipo inválido'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Prioridade inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Parâmetros inválidos',
        errors: errors.array()
      });
    }

    // Modo demo - metas simuladas
    const demoGoals = [
      {
        _id: 'goal-1',
        title: 'Viagem para Europa',
        description: 'Economizar para uma viagem de 15 dias pela Europa',
        targetAmount: 15000,
        currentAmount: 8500,
        targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 meses
        type: 'savings',
        priority: 'high',
        status: 'active',
        category: null,
        progress: {
          percentage: 56.7,
          remaining: 6500,
          daysRemaining: 180,
          isCompleted: false,
          isOverdue: false
        }
      },
      {
        _id: 'goal-2',
        title: 'Notebook novo',
        description: 'Comprar um notebook para trabalho',
        targetAmount: 3000,
        currentAmount: 1200,
        targetDate: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000), // 2 meses
        type: 'purchase',
        priority: 'medium',
        status: 'active',
        category: null,
        progress: {
          percentage: 40,
          remaining: 1800,
          daysRemaining: 60,
          isCompleted: false,
          isOverdue: false
        }
      }
    ];

    res.json(demoGoals);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/goals
// @desc    Criar nova meta
// @access  Private
router.post('/', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('targetAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Valor alvo deve ser maior que zero'),
  body('targetDate')
    .isISO8601()
    .withMessage('Data alvo inválida'),
  body('type')
    .isIn(['savings', 'debt_payment', 'purchase', 'investment', 'other'])
    .withMessage('Tipo inválido'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Prioridade inválida'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Categoria inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      targetAmount,
      targetDate,
      type,
      priority = 'medium',
      category,
      isRecurring = false,
      recurringAmount
    } = req.body;

    // Verificar categoria se fornecida
    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id,
        isActive: true
      });

      if (!categoryExists) {
        return res.status(400).json({
          message: 'Categoria não encontrada'
        });
      }
    }

    const goal = new Goal({
      user: req.user._id,
      title,
      description,
      targetAmount,
      targetDate: new Date(targetDate),
      type,
      priority,
      category,
      isRecurring,
      recurringAmount: isRecurring ? recurringAmount : null
    });

    // Criar marcos padrão
    goal.createDefaultMilestones();

    await goal.save();
    await goal.populate('category', 'name icon color type');

    const progress = goal.calculateProgress();

    res.status(201).json({
      message: 'Meta criada com sucesso',
      goal: {
        ...goal.toObject(),
        progress
      }
    });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/goals/:id
// @desc    Atualizar meta
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('targetAmount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Valor alvo deve ser maior que zero'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Data alvo inválida'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Prioridade inválida'),
  body('status')
    .optional()
    .isIn(['active', 'paused', 'completed', 'cancelled'])
    .withMessage('Status inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        message: 'Meta não encontrada'
      });
    }

    const {
      title,
      description,
      targetAmount,
      targetDate,
      priority,
      status
    } = req.body;

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (targetDate !== undefined) goal.targetDate = new Date(targetDate);
    if (priority !== undefined) goal.priority = priority;
    if (status !== undefined) goal.status = status;

    await goal.save();
    await goal.populate('category', 'name icon color type');

    const progress = goal.calculateProgress();

    res.json({
      message: 'Meta atualizada com sucesso',
      goal: {
        ...goal.toObject(),
        progress
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/goals/:id/add-amount
// @desc    Adicionar valor à meta
// @access  Private
router.post('/:id/add-amount', [
  auth,
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que zero')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        message: 'Meta não encontrada'
      });
    }

    if (goal.status !== 'active') {
      return res.status(400).json({
        message: 'Apenas metas ativas podem receber valores'
      });
    }

    const { amount } = req.body;

    await goal.addAmount(amount);
    await goal.populate('category', 'name icon color type');

    const progress = goal.calculateProgress();

    res.json({
      message: 'Valor adicionado com sucesso',
      goal: {
        ...goal.toObject(),
        progress
      }
    });
  } catch (error) {
    console.error('Erro ao adicionar valor à meta:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Deletar meta
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        message: 'Meta não encontrada'
      });
    }

    await Goal.findByIdAndDelete(goal._id);

    res.json({
      message: 'Meta deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/goals/stats/overview
// @desc    Obter visão geral das metas
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      cancelled: goals.filter(g => g.status === 'cancelled').length,
      totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalCurrentAmount: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      averageProgress: 0
    };

    if (stats.total > 0) {
      const totalProgress = goals.reduce((sum, g) => {
        const progress = g.calculateProgress();
        return sum + progress.percentage;
      }, 0);
      stats.averageProgress = totalProgress / stats.total;
    }

    // Metas próximas do prazo (30 dias)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingGoals = goals
      .filter(g => g.status === 'active' && g.targetDate <= thirtyDaysFromNow)
      .map(g => {
        const progress = g.calculateProgress();
        return {
          ...g.toObject(),
          progress
        };
      })
      .sort((a, b) => a.targetDate - b.targetDate);

    res.json({
      stats,
      upcomingGoals
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas das metas:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;