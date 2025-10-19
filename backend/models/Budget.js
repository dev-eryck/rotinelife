const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Valor do orçamento é obrigatório'],
    min: [0.01, 'Valor deve ser maior que zero']
  },
  period: {
    type: String,
    required: true,
    enum: ['monthly', 'weekly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  alertThreshold: {
    type: Number,
    default: 80, // Alerta quando 80% do orçamento for usado
    min: 0,
    max: 100
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Índices
budgetSchema.index({ user: 1, startDate: 1, endDate: 1 });
budgetSchema.index({ user: 1, category: 1, isActive: 1 });

// Middleware para calcular data de fim baseada no período
budgetSchema.pre('save', function(next) {
  if (this.isNew && !this.endDate) {
    const start = new Date(this.startDate);
    switch (this.period) {
      case 'weekly':
        this.endDate = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        this.endDate = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
        break;
      case 'yearly':
        this.endDate = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
        break;
    }
  }
  next();
});

// Método para verificar se o orçamento está ativo
budgetSchema.methods.isActivePeriod = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

// Método para calcular progresso do orçamento
budgetSchema.methods.calculateProgress = async function() {
  const Transaction = mongoose.model('Transaction');
  const startDate = this.startDate;
  const endDate = this.endDate;
  
  const spent = await Transaction.aggregate([
    {
      $match: {
        user: this.user,
        category: this.category,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  const totalSpent = spent.length > 0 ? spent[0].total : 0;
  const percentage = (totalSpent / this.amount) * 100;
  
  return {
    spent: totalSpent,
    budget: this.amount,
    remaining: this.amount - totalSpent,
    percentage: Math.min(percentage, 100),
    isOverBudget: totalSpent > this.amount
  };
};

module.exports = mongoose.model('Budget', budgetSchema);