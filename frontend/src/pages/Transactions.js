import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard,
  Download
} from 'lucide-react';

const Transactions = () => {
  const { success, error } = useToast();
  const { transactions, categories, stats, dispatch, addTransaction } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      type: '',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    }
  });

  // Não precisamos mais de fetchTransactions e fetchCategories
  // pois os dados vêm do DataContext

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', e.target.search.value);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    reset();
    setShowModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setValue('type', transaction.type);
    setValue('amount', Math.abs(transaction.amount));
    setValue('description', transaction.description);
    setValue('category', transaction.category._id);
    setValue('date', new Date(transaction.date).toISOString().split('T')[0]);
    setValue('paymentMethod', transaction.paymentMethod);
    setShowModal(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        setLoading(true);
        
        // Simular exclusão
        await new Promise(resolve => setTimeout(resolve, 500));
        
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
        success('Transação excluída com sucesso!');
      } catch (err) {
        error('Erro ao excluir transação');
      } finally {
        setLoading(false);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      console.log('📊 Dados recebidos:', data);
      console.log('📊 Categorias disponíveis:', categories);
      console.log('📊 Categoria selecionada ID:', data.category);
      
      const category = categories.find(c => c._id === data.category);
      console.log('📊 Categoria encontrada:', category);
      
      if (!category) {
        error('Categoria não encontrada! Verifique se a categoria foi selecionada corretamente.');
        setLoading(false);
        return;
      }
      
      const amount = data.type === 'income' ? parseFloat(data.amount) : -parseFloat(data.amount);
      
      // Verificar se é uma despesa e se há saldo suficiente
      if (data.type === 'expense' && !editingTransaction) {
        const expenseAmount = parseFloat(data.amount);
        if (expenseAmount > stats.availableBalance) {
          error(`Saldo insuficiente! Você tem apenas ${formatCurrency(stats.availableBalance)} disponível.`);
          setLoading(false);
          return;
        }
      }
      
      if (editingTransaction) {
        // Editar transação
        const updatedTransaction = {
          ...editingTransaction,
          ...data,
          amount,
          category,
          updatedAt: new Date()
        };
        
        dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
        success('Transação atualizada com sucesso!');
      } else {
        // Nova transação via backend
        const transactionData = {
          type: data.type,
          amount: Math.abs(parseFloat(data.amount)),
          description: data.description,
          category: data.category,
          date: data.date,
          paymentMethod: data.paymentMethod || 'other'
        };
        
        const result = await addTransaction(transactionData);
        if (result.success) {
          success('Transação criada com sucesso!');
        } else {
          error(result.error || 'Erro ao adicionar transação');
          setLoading(false);
          return;
        }
      }
      
      setShowModal(false);
      reset();
    } catch (err) {
      error('Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !filters.search || 
      transaction.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = !filters.type || transaction.type === filters.type;
    const matchesCategory = !filters.category || transaction.category._id === filters.category;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Transações</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <button
          onClick={handleAddTransaction}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="icon-container icon-container-green">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Receitas</p>
              <p className="stat-value text-green-600">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="icon-container icon-container-red">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Despesas</p>
              <p className="stat-value text-red-600">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="icon-container icon-container-blue">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Saldo Disponível</p>
              <p className={`stat-value ${stats.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.availableBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section - Simplificado */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Buscar transações..."
                className="input pl-10 text-sm"
                defaultValue={filters.search}
              />
            </div>
          </form>

          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input text-sm"
            >
              <option value="">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input text-sm"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button className="btn btn-outline btn-sm">
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {transactions.length === 0 ? 'Nenhuma transação encontrada' : 'Nenhuma transação corresponde aos filtros'}
            </h3>
            <p className="text-gray-600 mb-6">
              {transactions.length === 0 
                ? 'Comece adicionando sua primeira transação para controlar suas finanças.'
                : 'Tente ajustar os filtros para encontrar o que procura.'
              }
            </p>
            {transactions.length === 0 && (
              <button
                onClick={handleAddTransaction}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Transação
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                          style={{ backgroundColor: `${transaction.category.color}20` }}
                        >
                          <span style={{ color: transaction.category.color }}>
                            {transaction.category.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">
                        {transaction.category.name}
                      </span>
                    </td>
                    <td className="text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td>
                      <span className={`font-bold text-lg ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold text-gray-900">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </h3>
            </div>
            <div className="modal-body">
              <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select
                    {...register('type', { required: 'Tipo é obrigatório' })}
                    className={`input ${errors.type ? 'input-error' : ''}`}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                  {errors.type && (
                    <p className="form-error">{errors.type.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Valor</label>
                  <input
                    {...register('amount', { 
                      required: 'Valor é obrigatório',
                      min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                    })}
                    type="number"
                    step="0.01"
                    className={`input ${errors.amount ? 'input-error' : ''}`}
                    placeholder="0,00"
                  />
                  {errors.amount && (
                    <p className="form-error">{errors.amount.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <input
                    {...register('description', { 
                      required: 'Descrição é obrigatória',
                      maxLength: { value: 200, message: 'Descrição deve ter no máximo 200 caracteres' }
                    })}
                    type="text"
                    className={`input ${errors.description ? 'input-error' : ''}`}
                    placeholder="Ex: Salário, Supermercado..."
                  />
                  {errors.description && (
                    <p className="form-error">{errors.description.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select
                    {...register('category', { required: 'Categoria é obrigatória' })}
                    className={`input ${errors.category ? 'input-error' : ''}`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="form-error">{errors.category.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Data</label>
                  <input
                    {...register('date', { required: 'Data é obrigatória' })}
                    type="date"
                    className={`input ${errors.date ? 'input-error' : ''}`}
                  />
                  {errors.date && (
                    <p className="form-error">{errors.date.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Método de Pagamento</label>
                  <select
                    {...register('paymentMethod')}
                    className="input"
                  >
                    <option value="cash">Dinheiro</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="bank_transfer">Transferência</option>
                    <option value="pix">PIX</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="transaction-form"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;