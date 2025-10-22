import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Plus, 
  Target, 
  Edit, 
  Trash2, 
  TrendingUp,
  DollarSign,
  CheckCircle
} from 'lucide-react';

const Goals = () => {
  const { success, error } = useToast();
  const { goals, dispatch, stats } = useData();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      title: '',
      description: '',
      target: '',
      deadline: ''
    }
  });

  // Dados vêm do DataContext - não precisamos mais de fetch

  const handleAddGoal = () => {
    setEditingGoal(null);
    reset();
    setShowModal(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setValue('title', goal.title);
    setValue('description', goal.description);
    setValue('target', goal.target);
    setValue('deadline', new Date(goal.deadline).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        setLoading(true);
        
        // Simular exclusão
        await new Promise(resolve => setTimeout(resolve, 500));
        
        dispatch({ type: 'DELETE_GOAL', payload: id });
        success('Meta excluída com sucesso!');
      } catch (err) {
        error('Erro ao excluir meta');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddMoney = (goal) => {
    setSelectedGoal(goal);
    reset();
    setShowAddMoneyModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      if (editingGoal) {
        // Editar meta
        const updatedGoal = {
          ...editingGoal,
          ...data,
          target: parseFloat(data.target) || 0,
          updatedAt: new Date()
        };
        
        dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
        success('Meta atualizada com sucesso!');
      } else {
        // Nova meta via backend
        const goalData = {
          name: data.name,
          target: parseFloat(data.target) || 0,
          description: data.description || '',
          deadline: data.deadline || null
        };
        
        const result = await addGoal(goalData);
        if (result.success) {
          success('Meta criada com sucesso!');
        } else {
          error(result.error || 'Erro ao adicionar meta');
          setLoading(false);
          return;
        }
      }
      
      setShowModal(false);
      reset();
    } catch (err) {
      error('Erro ao salvar meta');
    } finally {
      setLoading(false);
    }
  };

  const onAddMoneySubmit = async (data) => {
    try {
      setLoading(true);
      
      const amount = parseFloat(data.amount);
      
      // Verificar se há saldo suficiente
      if (amount > stats.availableBalance) {
        error(`Saldo insuficiente! Você tem apenas ${formatCurrency(stats.availableBalance)} disponível.`);
        setLoading(false);
        return;
      }
      
      // Simular adição de dinheiro
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCurrent = selectedGoal.current + amount;
      const newPercentage = Math.min((newCurrent / selectedGoal.target) * 100, 100);
      const newStatus = newPercentage >= 100 ? 'completed' : 'active';
      
      const updatedGoal = {
        ...selectedGoal,
        current: newCurrent,
        percentage: newPercentage,
        status: newStatus,
        updatedAt: new Date()
      };
      
      dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
      success(`R$ ${amount.toFixed(2)} adicionado à meta!`);
      setShowAddMoneyModal(false);
      reset();
    } catch (err) {
      error('Erro ao adicionar dinheiro à meta');
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

  // Função removida - não utilizada
  // const getDaysRemaining = (deadline) => {
  //   const today = new Date();
  //   const deadlineDate = new Date(deadline);
  //   const diffTime = deadlineDate - today;
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   return diffDays;
  // };

  const getStatusColor = (status, percentage) => {
    if (status === 'completed') return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusText = (status, percentage) => {
    if (status === 'completed') return 'Concluída';
    if (percentage >= 75) return 'Quase lá!';
    if (percentage >= 50) return 'Em andamento';
    return 'Iniciando';
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const totalSaved = goals.reduce((sum, g) => sum + (g.current || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + (g.target || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Metas Financeiras</h1>
          <p className="text-gray-600 mt-1">
            Defina e acompanhe seus objetivos financeiros
          </p>
        </div>
        <button
          onClick={handleAddGoal}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
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
              <p className="stat-label">Total Economizado</p>
              <p className="stat-value text-blue-600">
                {formatCurrency(totalSaved)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="icon-container icon-container-green">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Meta Total</p>
              <p className="stat-value text-green-600">
                {formatCurrency(totalTarget)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="icon-container icon-container-purple">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Progresso Geral</p>
              <p className="stat-value text-purple-600">
                {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-6">
        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Metas Ativas</h3>
            </div>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal._id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {goal.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddMoney(goal)}
                        className="btn btn-sm btn-primary"
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Adicionar
                      </button>
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{formatCurrency(goal.current)}</span>
                      <span>{formatCurrency(goal.target)}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill progress-fill-safe"
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getStatusColor(goal.status, goal.percentage)}`}>
                        {getStatusText(goal.status, goal.percentage)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({goal.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Prazo: {formatDate(goal.deadline)}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Faltam {formatCurrency(goal.target - goal.current)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Metas Concluídas</h3>
            </div>
            <div className="space-y-4">
              {completedGoals.map((goal) => (
                <div key={goal._id} className="border border-green-200 bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {goal.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-green-600">
                        Meta Concluída! 🎉
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Concluída em {formatDate(goal.updatedAt)}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Valor: {formatCurrency(goal.target)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="card">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma meta criada
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando suas primeiras metas financeiras para ter mais controle sobre seus objetivos.
              </p>
              <button
                onClick={handleAddGoal}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold text-gray-900">
                {editingGoal ? 'Editar Meta' : 'Nova Meta'}
              </h3>
            </div>
            <div className="modal-body">
              <form id="goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Título da Meta</label>
                  <input
                    {...register('title', { 
                      required: 'Título é obrigatório',
                      maxLength: { value: 100, message: 'Título deve ter no máximo 100 caracteres' }
                    })}
                    type="text"
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Ex: Viagem para Europa"
                  />
                  {errors.title && (
                    <p className="form-error">{errors.title.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição (Opcional)</label>
                  <textarea
                    {...register('description')}
                    className="input"
                    rows="3"
                    placeholder="Descreva sua meta..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Valor da Meta</label>
                  <input
                    {...register('target', { 
                      required: 'Valor é obrigatório',
                      min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                    })}
                    type="number"
                    step="0.01"
                    className={`input ${errors.target ? 'input-error' : ''}`}
                    placeholder="0,00"
                  />
                  {errors.target && (
                    <p className="form-error">{errors.target.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Prazo</label>
                  <input
                    {...register('deadline', { 
                      required: 'Prazo é obrigatório',
                      validate: (value) => {
                        const deadline = new Date(value);
                        const today = new Date();
                        return deadline > today || 'Prazo deve ser uma data futura';
                      }
                    })}
                    type="date"
                    className={`input ${errors.deadline ? 'input-error' : ''}`}
                  />
                  {errors.deadline && (
                    <p className="form-error">{errors.deadline.message}</p>
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
                form="goal-form"
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

      {/* Add Money Modal */}
      {showAddMoneyModal && selectedGoal && (
        <div className="modal-overlay" onClick={() => setShowAddMoneyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold text-gray-900">
                Adicionar Dinheiro à Meta
              </h3>
            </div>
            <div className="modal-body">
              <form id="add-money-form" onSubmit={handleSubmit(onAddMoneySubmit)} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {selectedGoal.title}
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Atual: {formatCurrency(selectedGoal.current)} / {formatCurrency(selectedGoal.target)}
                  </p>
                  <p className="text-xs text-blue-600">
                    Saldo disponível: {formatCurrency(stats.availableBalance)}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Valor a Adicionar</label>
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
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowAddMoneyModal(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="add-money-form"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;