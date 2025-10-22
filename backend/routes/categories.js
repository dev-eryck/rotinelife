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

    const { type } = req.query;
    
    // Construir filtros
    const filters = { userId: req.user._id };
    if (type) filters.type = type;

    // Buscar categorias
    const categories = await Category.find(filters)
      .sort({ sortOrder: 1, name: 1 });

    res.json(categories);
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
      userId: req.user._id,
      type
    });

    if (existingCategory) {
      return res.status(400).json({
        message: 'Já existe uma categoria com este nome'
      });
    }

    // Obter próximo sortOrder
    const lastCategory = await Category.findOne({
      userId: req.user._id,
      type
    }).sort({ sortOrder: -1 });

    const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;

    const category = new Category({
      userId: req.user._id,
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
      userId: req.user._id
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
        userId: req.user._id,
        type: category.type,
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
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se há transações usando esta categoria
    const transactionCount = await Transaction.countDocuments({
      category: category._id,
      userId: req.user._id
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: `Não é possível deletar categoria com ${transactionCount} transação(ões) associada(s)`
      });
    }

    // Deletar categoria
    await Category.findByIdAndDelete(category._id);

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