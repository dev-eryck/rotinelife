const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/settings
// @desc    Obter configurações do usuário
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Modo demo - configurações simuladas
    res.json({
      preferences: {
        currency: 'BRL',
        language: 'pt-BR',
        theme: 'light'
      },
      customLabels: {
        income: 'Receitas',
        expense: 'Despesas',
        balance: 'Saldo',
        budget: 'Orçamento',
        goal: 'Meta'
      },
      notifications: {
        email: true,
        push: true,
        budgetAlerts: true,
        goalMilestones: true,
        monthlyReports: true
      }
    });
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/settings/preferences
// @desc    Atualizar preferências do usuário
// @access  Private
router.put('/preferences', [
  auth,
  body('currency')
    .optional()
    .isIn(['BRL', 'USD', 'EUR'])
    .withMessage('Moeda inválida'),
  body('language')
    .optional()
    .isIn(['pt-BR', 'en-US', 'es-ES'])
    .withMessage('Idioma inválido'),
  body('theme')
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

    const { currency, language, theme } = req.body;
    const user = await User.findById(req.user._id);

    if (currency) user.preferences.currency = currency;
    if (language) user.preferences.language = language;
    if (theme) user.preferences.theme = theme;

    await user.save();

    res.json({
      message: 'Preferências atualizadas com sucesso',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/settings/labels
// @desc    Atualizar rótulos personalizados
// @access  Private
router.put('/labels', [
  auth,
  body('income')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Rótulo de receitas deve ter entre 1 e 50 caracteres'),
  body('expense')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Rótulo de despesas deve ter entre 1 e 50 caracteres'),
  body('balance')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Rótulo de saldo deve ter entre 1 e 50 caracteres'),
  body('budget')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Rótulo de orçamento deve ter entre 1 e 50 caracteres'),
  body('goal')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Rótulo de meta deve ter entre 1 e 50 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { income, expense, balance, budget, goal } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.customLabels) {
      user.customLabels = {};
    }

    if (income !== undefined) user.customLabels.income = income;
    if (expense !== undefined) user.customLabels.expense = expense;
    if (balance !== undefined) user.customLabels.balance = balance;
    if (budget !== undefined) user.customLabels.budget = budget;
    if (goal !== undefined) user.customLabels.goal = goal;

    await user.save();

    res.json({
      message: 'Rótulos personalizados atualizados com sucesso',
      customLabels: user.customLabels
    });
  } catch (error) {
    console.error('Erro ao atualizar rótulos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/settings/notifications
// @desc    Atualizar configurações de notificação
// @access  Private
router.put('/notifications', [
  auth,
  body('email')
    .optional()
    .isBoolean()
    .withMessage('Email deve ser boolean'),
  body('push')
    .optional()
    .isBoolean()
    .withMessage('Push deve ser boolean'),
  body('budgetAlerts')
    .optional()
    .isBoolean()
    .withMessage('Alertas de orçamento devem ser boolean'),
  body('goalMilestones')
    .optional()
    .isBoolean()
    .withMessage('Marcos de meta devem ser boolean'),
  body('monthlyReports')
    .optional()
    .isBoolean()
    .withMessage('Relatórios mensais devem ser boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, push, budgetAlerts, goalMilestones, monthlyReports } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.notifications) {
      user.notifications = {};
    }

    if (email !== undefined) user.notifications.email = email;
    if (push !== undefined) user.notifications.push = push;
    if (budgetAlerts !== undefined) user.notifications.budgetAlerts = budgetAlerts;
    if (goalMilestones !== undefined) user.notifications.goalMilestones = goalMilestones;
    if (monthlyReports !== undefined) user.notifications.monthlyReports = monthlyReports;

    await user.save();

    res.json({
      message: 'Configurações de notificação atualizadas com sucesso',
      notifications: user.notifications
    });
  } catch (error) {
    console.error('Erro ao atualizar notificações:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/settings/export
// @desc    Exportar dados do usuário
// @access  Private
router.post('/export', auth, async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const Category = require('../models/Category');
    const Budget = require('../models/Budget');
    const Goal = require('../models/Goal');

    // Buscar todos os dados do usuário
    const [transactions, categories, budgets, goals] = await Promise.all([
      Transaction.find({ user: req.user._id, isActive: true })
        .populate('category', 'name icon color type')
        .sort({ date: -1 }),
      Category.find({ user: req.user._id, isActive: true })
        .sort({ sortOrder: 1, name: 1 }),
      Budget.find({ user: req.user._id, isActive: true })
        .populate('category', 'name icon color type')
        .sort({ startDate: -1 }),
      Goal.find({ user: req.user._id })
        .populate('category', 'name icon color type')
        .sort({ priority: -1, targetDate: 1 })
    ]);

    const exportData = {
      user: {
        name: req.user.name,
        email: req.user.email,
        preferences: req.user.preferences,
        customLabels: req.user.customLabels,
        exportDate: new Date().toISOString()
      },
      transactions,
      categories,
      budgets,
      goals
    };

    res.json({
      message: 'Dados exportados com sucesso',
      data: exportData
    });
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/settings/import
// @desc    Importar dados do usuário
// @access  Private
router.post('/import', [
  auth,
  body('data')
    .isObject()
    .withMessage('Dados de importação inválidos')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { data } = req.body;
    const Transaction = require('../models/Transaction');
    const Category = require('../models/Category');
    const Budget = require('../models/Budget');
    const Goal = require('../models/Goal');

    // Atualizar preferências e rótulos
    if (data.user) {
      const user = await User.findById(req.user._id);
      if (data.user.preferences) {
        user.preferences = { ...user.preferences, ...data.user.preferences };
      }
      if (data.user.customLabels) {
        user.customLabels = data.user.customLabels;
      }
      await user.save();
    }

    // Importar categorias
    if (data.categories && Array.isArray(data.categories)) {
      for (const catData of data.categories) {
        const existingCategory = await Category.findOne({
          name: catData.name,
          user: req.user._id,
          type: catData.type
        });

        if (!existingCategory) {
          await Category.create({
            ...catData,
            user: req.user._id,
            isDefault: false
          });
        }
      }
    }

    // Importar transações
    if (data.transactions && Array.isArray(data.transactions)) {
      for (const transData of data.transactions) {
        // Buscar categoria correspondente
        const category = await Category.findOne({
          name: transData.category?.name,
          user: req.user._id,
          type: transData.type
        });

        if (category) {
          await Transaction.create({
            ...transData,
            user: req.user._id,
            category: category._id
          });
        }
      }
    }

    // Importar orçamentos
    if (data.budgets && Array.isArray(data.budgets)) {
      for (const budgetData of data.budgets) {
        const category = await Category.findOne({
          name: budgetData.category?.name,
          user: req.user._id,
          type: 'expense'
        });

        if (category) {
          await Budget.create({
            ...budgetData,
            user: req.user._id,
            category: category._id
          });
        }
      }
    }

    // Importar metas
    if (data.goals && Array.isArray(data.goals)) {
      for (const goalData of data.goals) {
        let category = null;
        if (goalData.category?.name) {
          category = await Category.findOne({
            name: goalData.category.name,
            user: req.user._id
          });
        }

        await Goal.create({
          ...goalData,
          user: req.user._id,
          category: category?._id || null
        });
      }
    }

    res.json({
      message: 'Dados importados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;