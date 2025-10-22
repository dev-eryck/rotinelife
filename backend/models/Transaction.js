const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  amount: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    validate: {
      validator: function(value) {
        return Math.abs(value) >= 0.01;
      },
      message: 'Valor deve ser maior que zero'
    }
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [200, 'Descrição deve ter no máximo 200 caracteres']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: undefined
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'other'],
    default: 'cash'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notas devem ter no máximo 500 caracteres']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, date: -1 });

// Middleware para validar data
transactionSchema.pre('save', function(next) {
  if (this.date > new Date()) {
    return next(new Error('Data não pode ser futura'));
  }
  next();
});

// Método virtual para calcular valor absoluto
transactionSchema.virtual('absoluteAmount').get(function() {
  return Math.abs(this.amount);
});

// Método para obter resumo da transação
transactionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    amount: this.amount,
    description: this.description,
    date: this.date,
    category: this.category
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);