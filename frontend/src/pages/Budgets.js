import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Plus, 
  Target, 
  AlertCircle, 
  Edit, 
  Trash2, 
  TrendingUp,
  DollarSign
} from 'lucide-react';

const Budgets = () => {
  const { success, error } = useToast();
  const { budgets, categories, dispatch } = useData();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      category: '',
      limit: '',
      period: ''
    }
  });

  // Dados vêm do DataContext - não precisamos mais de fetch

  const handleAddBudget = () => {
    setEditingBudget(null);
    reset();
    setShowModal(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setValue('category', budget.category._id);
    setValue('limit', budget.limit);
    setValue('period', budget.period);
    setShowModal(true);
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        setLoading(true);
        
        // Simular exclusão
        await new Promise(resolve => setTimeout(resolve, 500));
        
        dispatch({ type: 'DELETE_BUDGET', payload: id });
        success('Orçamento excluído com sucesso!');
      } catch (err) {
        error('Erro ao excluir orçamento');
      } finally {
        setLoading(false);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const category = categories.find(c => c._id === data.category);
      
      if (editingBudget) {
        // Editar orçamento
        const updatedBudget = {
          ...editingBudget,
          ...data,
          limit: parseFloat(data.limit) || 0,
          category,
          updatedAt: new Date()
        };
        
        dispatch({ type: 'UPDATE_BUDGET', payload: updatedBudget });
        success('Orçamento atualizado com sucesso!');
      } else {
        // Novo orçamento
        const newBudget = {
          _id: 'budget-' + Date.now(),
          ...data,
          limit: parseFloat(data.limit) || 0,
          category,
          spent: 0,
          percentage: 0,
          createdAt: new Date()
        };
        
        dispatch({ type: 'ADD_BUDGET', payload: newBudget });
        success('Orçamento criado com sucesso!');
      }
      
      setShowModal(false);
      reset();
    } catch (err) {
      error('Erro ao salvar orçamento');
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

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'progress-fill-danger';
    if (percentage >= 75) return 'progress-fill-warning';
    return 'progress-fill-safe';
  };

  const getStatusText = (percentage) => {
    if (percentage >= 100) return 'Orçamento estourado';
    if (percentage >= 75) return 'Próximo do limite';
    return 'Dentro do orçamento';
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  // Calcular totais dos orçamentos
  const totalBudgeted = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = totalBudgeted - totalSpent;
  
  // Debug: verificar se há duplicação
  console.log('Budgets:', budgets);
  console.log('Total Budgeted:', totalBudgeted);
  console.log('Total Spent:', totalSpent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Orçamentos</h1>
          <p className="text-gray-600 mt-1">
            Controle seus gastos por categoria
          </p>
        </div>
        <button
          onClick={handleAddBudget}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="icon-container icon-container-blue">
              <Target className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Total Orçado</p>
              <p className="stat-value text-blue-600">
                {formatCurrency(totalBudgeted)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="icon-container icon-container-red">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Total Gasto</p>
              <p className="stat-value text-red-600">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="icon-container icon-container-green">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Restante</p>
              <p className={`stat-value ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalRemaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budgets List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum orçamento criado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando orçamentos para controlar seus gastos por categoria.
            </p>
            <button
              onClick={handleAddBudget}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Orçamento
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.map((budget) => (
              <div key={budget._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                      style={{ backgroundColor: `${budget.category.color}20` }}
                    >
                      <span style={{ color: budget.category.color }} className="text-xl">
                        {budget.category.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {budget.category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {budget.period === 'monthly' ? 'Mensal' : 'Anual'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditBudget(budget)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Gasto: {formatCurrency(budget.spent)}</span>
                    <span>Limite: {formatCurrency(budget.limit)}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getProgressBarColor(budget.percentage)}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${getStatusColor(budget.percentage)}`}>
                      {getStatusText(budget.percentage)}
                    </span>
                    {budget.percentage >= 75 && (
                      <AlertCircle className="w-4 h-4 ml-2 text-orange-500" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {budget.percentage.toFixed(1)}% utilizado
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Restam {formatCurrency(budget.limit - budget.spent)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
              </h3>
            </div>
            <div className="modal-body">
              <form id="budget-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  <label className="form-label">Valor do Orçamento</label>
                  <input
                    {...register('limit', { 
                      required: 'Valor é obrigatório',
                      min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                    })}
                    type="number"
                    step="0.01"
                    className={`input ${errors.limit ? 'input-error' : ''}`}
                    placeholder="0,00"
                  />
                  {errors.limit && (
                    <p className="form-error">{errors.limit.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Período</label>
                  <select
                    {...register('period', { required: 'Período é obrigatório' })}
                    className={`input ${errors.period ? 'input-error' : ''}`}
                  >
                    <option value="">Selecione o período</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                  {errors.period && (
                    <p className="form-error">{errors.period.message}</p>
                  )}
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
                form="budget-form"
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

export default Budgets;