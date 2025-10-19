const { body, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validações para transações
const validateTransaction = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tipo deve ser income ou expense'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que zero'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Descrição deve ter entre 1 e 200 caracteres'),
  body('category')
    .isMongoId()
    .withMessage('Categoria inválida'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Data inválida'),
  handleValidationErrors
];

// Validações para categorias
const validateCategory = [
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
    .withMessage('Cor deve ser um código hexadecimal válido'),
  handleValidationErrors
];

// Validações para orçamentos
const validateBudget = [
  body('category')
    .isMongoId()
    .withMessage('Categoria inválida'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Valor do orçamento deve ser maior que zero'),
  body('period')
    .isIn(['monthly', 'weekly', 'yearly'])
    .withMessage('Período deve ser monthly, weekly ou yearly'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início inválida'),
  body('alertThreshold')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Limite de alerta deve ser entre 0 e 100'),
  handleValidationErrors
];

// Validações para metas
const validateGoal = [
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
    .withMessage('Categoria inválida'),
  handleValidationErrors
];

// Validações para autenticação
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateTransaction,
  validateCategory,
  validateBudget,
  validateGoal,
  validateRegister,
  validateLogin
};