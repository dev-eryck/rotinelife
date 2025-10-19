const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/categories
// @desc    Obter categorias do usuário
// @access  Private
router.get('/', [
  auth,
  query('type').optional().isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Parâmetros inválidos',
        errors: errors.array()
      });
    }

    // Modo demo - categorias simuladas
    const demoCategories = [
      // Receitas
      { _id: 'cat-1', name: 'Salário', type: 'income', icon: '💰', color: '#4CAF50', isDefault: true },
      { _id: 'cat-2', name: 'Freelance', type: 'income', icon: '💼', color: '#2196F3', isDefault: true },
      { _id: 'cat-3', name: 'Investimentos', type: 'income', icon: '📈', color: '#FF9800', isDefault: true },
      { _id: 'cat-4', name: 'Outros', type: 'income', icon: '💵', color: '#9C27B0', isDefault: true },
      
      // Despesas
      { _id: 'cat-5', name: 'Alimentação', type: 'expense', icon: '🍽️', color: '#F44336', isDefault: true },
      { _id: 'cat-6', name: 'Transporte', type: 'expense', icon: '🚗', color: '#607D8B', isDefault: true },
      { _id: 'cat-7', name: 'Moradia', type: 'expense', icon: '🏠', color: '#795548', isDefault: true },
      { _id: 'cat-8', name: 'Saúde', type: 'expense', icon: '🏥', color: '#E91E63', isDefault: true },
      { _id: 'cat-9', name: 'Educação', type: 'expense', icon: '📚', color: '#3F51B5', isDefault: true },
      { _id: 'cat-10', name: 'Lazer', type: 'expense', icon: '🎬', color: '#9C27B0', isDefault: true },
      { _id: 'cat-11', name: 'Roupas', type: 'expense', icon: '👕', color: '#FF5722', isDefault: true },
      { _id: 'cat-12', name: 'Outros', type: 'expense', icon: '📁', color: '#808080', isDefault: true }
    ];

    const { type } = req.query;
    let filteredCategories = demoCategories;
    
    if (type) {
      filteredCategories = demoCategories.filter(cat => cat.type === type);
    }

    res.json(filteredCategories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/categories
// @desc    Criar nova categoria
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nome deve ter entre 1 e 50 caracteres'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tipo deve ser income ou expense'),
  body('icon')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Ícone deve ter no máximo 10 caracteres'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Cor deve ser um código hexadecimal válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, type, icon = '📁', color = '#808080' } = req.body;

    // Verificar se já existe categoria com mesmo nome
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      user: req.user._id,
      type,
      isActive: true
    });

    if (existingCategory) {
      return res.status(400).json({
        message: 'Já existe uma categoria com este nome'
      });
    }

    // Obter próximo sortOrder
    const lastCategory = await Category.findOne({
      user: req.user._id,
      type,
      isActive: true
    }).sort({ sortOrder: -1 });

    const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;

    const category = new Category({
      user: req.user._id,
      name,
      type,
      icon,
      color,
      sortOrder
    });

    await category.save();

    res.status(201).json({
      message: 'Categoria criada com sucesso',
      category
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Atualizar categoria
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nome deve ter entre 1 e 50 caracteres'),
  body('icon')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Ícone deve ter no máximo 10 caracteres'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Cor deve ser um código hexadecimal válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });

    if (!category) {
      return res.status(404).json({
        message: 'Categoria não encontrada'
      });
    }

    const { name, icon, color } = req.body;

    // Verificar se nome já existe (se foi alterado)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        user: req.user._id,
        type: category.type,
        isActive: true,
        _id: { $ne: category._id }
      });

      if (existingCategory) {
        return res.status(400).json({
          message: 'Já existe uma categoria com este nome'
        });
      }
    }

    // Atualizar campos
    if (name !== undefined) category.name = name;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;

    await category.save();

    res.json({
      message: 'Categoria atualizada com sucesso',
      category
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Deletar categoria
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    });

    if (!category) {
      return res.status(404).json({
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se é categoria padrão
    if (category.isDefault) {
      return res.status(400).json({
        message: 'Não é possível deletar categorias padrão'
      });
    }

    // Verificar se há transações usando esta categoria
    const transactionCount = await Transaction.countDocuments({
      category: category._id,
      user: req.user._id,
      isActive: true
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: `Não é possível deletar categoria com ${transactionCount} transação(ões) associada(s)`
      });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.json({
      message: 'Categoria deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;