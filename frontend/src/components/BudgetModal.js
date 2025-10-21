import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Target, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const BudgetModal = ({ budget, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      category: '',
      amount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      alertThreshold: 80,
      notifications: {
        email: true,
        push: true
      }
    }
  });

  useEffect(() => {
    fetchCategories();
    if (budget) {
      reset({
        category: budget.category._id,
        amount: budget.amount.toString(),
        period: budget.period,
        startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
        alertThreshold: budget.alertThreshold,
        notifications: budget.notifications
      });
    }
  }, [budget, reset]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories?type=expense');
      setCategories(response.data);
    } catch (error) {
      // console.error('Erro ao carregar categorias:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const budgetData = {
        ...data,
        amount: parseFloat(data.amount)
      };

      if (budget) {
        await axios.put(`/api/budgets/${budget._id}`, budgetData);
        toast.success('Orçamento atualizado com sucesso!');
      } else {
        await axios.post('/api/budgets', budgetData);
        toast.success('Orçamento criado com sucesso!');
      }

      onSave();
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar orçamento';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Função removida - não utilizada
  // const formatCurrency = (value) => {
  //   return new Intl.NumberFormat('pt-BR', {
  //     style: 'currency',
  //     currency: 'BRL'
  //   }).format(value);
  // };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Target className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register('category', { required: 'Categoria é obrigatória' })}
                  className="input pl-10"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Valor do Orçamento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('amount', {
                    required: 'Valor é obrigatório',
                    min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                  })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input pl-10"
                  placeholder="0,00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Período */}
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                {...register('period', { required: 'Período é obrigatório' })}
                className="input"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            {/* Data de Início */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('startDate', { required: 'Data de início é obrigatória' })}
                  type="date"
                  className="input pl-10"
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            {/* Limite de Alerta */}
            <div>
              <label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                Limite de Alerta (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AlertTriangle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('alertThreshold', {
                    required: 'Limite de alerta é obrigatório',
                    min: { value: 0, message: 'Limite deve ser maior ou igual a 0' },
                    max: { value: 100, message: 'Limite deve ser menor ou igual a 100' }
                  })}
                  type="number"
                  min="0"
                  max="100"
                  className="input pl-10"
                  placeholder="80"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Você será alertado quando atingir esta porcentagem do orçamento
              </p>
              {errors.alertThreshold && (
                <p className="mt-1 text-sm text-red-600">{errors.alertThreshold.message}</p>
              )}
            </div>

            {/* Notificações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notificações
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('notifications.email')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('notifications.push')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Push</span>
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {loading ? 'Salvando...' : (budget ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
