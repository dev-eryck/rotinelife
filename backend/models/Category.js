const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nome da categoria é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  icon: {
    type: String,
    default: '📁',
    maxlength: [10, 'Ícone deve ter no máximo 10 caracteres']
  },
  color: {
    type: String,
    default: '#808080',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve ser um código hexadecimal válido']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices
categorySchema.index({ user: 1, type: 1 });
categorySchema.index({ user: 1, isActive: 1 });

// Middleware para garantir que apenas uma categoria padrão existe por tipo
categorySchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, type: this.type, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Método para obter categorias padrão
categorySchema.statics.getDefaultCategories = function() {
  return [
    // Categorias de receita
    { name: 'Salário', type: 'income', icon: '💰', color: '#4CAF50', isDefault: true },
    { name: 'Freelance', type: 'income', icon: '💼', color: '#2196F3', isDefault: true },
    { name: 'Investimentos', type: 'income', icon: '📈', color: '#FF9800', isDefault: true },
    { name: 'Outros', type: 'income', icon: '💵', color: '#9C27B0', isDefault: true },
    
    // Categorias de despesa
    { name: 'Alimentação', type: 'expense', icon: '🍽️', color: '#F44336', isDefault: true },
    { name: 'Transporte', type: 'expense', icon: '🚗', color: '#607D8B', isDefault: true },
    { name: 'Moradia', type: 'expense', icon: '🏠', color: '#795548', isDefault: true },
    { name: 'Saúde', type: 'expense', icon: '🏥', color: '#E91E63', isDefault: true },
    { name: 'Educação', type: 'expense', icon: '📚', color: '#3F51B5', isDefault: true },
    { name: 'Lazer', type: 'expense', icon: '🎬', color: '#9C27B0', isDefault: true },
    { name: 'Roupas', type: 'expense', icon: '👕', color: '#FF5722', isDefault: true },
    { name: 'Outros', type: 'expense', icon: '📁', color: '#808080', isDefault: true }
  ];
};

// Método para criar categorias padrão para um usuário
categorySchema.statics.createDefaultCategories = async function(userId) {
  const defaultCategories = this.getDefaultCategories();
  const categories = defaultCategories.map(cat => ({
    ...cat,
    user: userId
  }));
  return await this.insertMany(categories);
};

module.exports = mongoose.model('Category', categorySchema);