const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Título da meta é obrigatório'],
    trim: true,
    maxlength: [100, 'Título deve ter no máximo 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Valor alvo é obrigatório'],
    min: [0.01, 'Valor deve ser maior que zero']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Valor atual não pode ser negativo']
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  type: {
    type: String,
    required: true,
    enum: ['savings', 'debt_payment', 'purchase', 'investment', 'other'],
    default: 'savings'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringAmount: {
    type: Number,
    min: [0, 'Valor recorrente não pode ser negativo']
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    milestone: {
      type: Number,
      default: 25 // Notificar a cada 25% de progresso
    }
  },
  milestones: [{
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    description: {
      type: String,
      trim: true
    },
    achieved: {
      type: Boolean,
      default: false
    },
    achievedAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Índices
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, targetDate: 1 });
goalSchema.index({ user: 1, priority: 1 });

// Middleware para validar datas
goalSchema.pre('save', function(next) {
  if (this.targetDate <= this.startDate) {
    return next(new Error('Data alvo deve ser posterior à data de início'));
  }
  next();
});

// Método para calcular progresso
goalSchema.methods.calculateProgress = function() {
  const percentage = (this.currentAmount / this.targetAmount) * 100;
  const remaining = this.targetAmount - this.currentAmount;
  const daysRemaining = Math.ceil((this.targetDate - new Date()) / (1000 * 60 * 60 * 24));
  
  return {
    percentage: Math.min(percentage, 100),
    remaining,
    daysRemaining: Math.max(daysRemaining, 0),
    isCompleted: this.currentAmount >= this.targetAmount,
    isOverdue: daysRemaining < 0 && !this.isCompleted
  };
};

// Método para adicionar valor à meta
goalSchema.methods.addAmount = function(amount) {
  if (amount <= 0) {
    throw new Error('Valor deve ser positivo');
  }
  
  this.currentAmount += amount;
  
  // Verificar marcos
  this.checkMilestones();
  
  // Verificar se a meta foi completada
  if (this.currentAmount >= this.targetAmount && this.status === 'active') {
    this.status = 'completed';
  }
  
  return this.save();
};

// Método para verificar marcos
goalSchema.methods.checkMilestones = function() {
  const progress = this.calculateProgress();
  
  this.milestones.forEach(milestone => {
    if (!milestone.achieved && progress.percentage >= milestone.percentage) {
      milestone.achieved = true;
      milestone.achievedAt = new Date();
    }
  });
};

// Método para criar marcos padrão
goalSchema.methods.createDefaultMilestones = function() {
  const milestones = [25, 50, 75, 100].map(percentage => ({
    percentage,
    description: `${percentage}% da meta alcançada`,
    achieved: false
  }));
  
  this.milestones = milestones;
  return this;
};

module.exports = mongoose.model('Goal', goalSchema);