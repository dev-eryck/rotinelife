import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Flag, DollarSign, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const GoalModal = ({ goal, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      type: 'savings',
      priority: 'medium',
      category: '',
      isRecurring: false,
      recurringAmount: ''
    }
  });

  useEffect(() => {
    fetchCategories();
    if (goal) {
      reset({
        title: goal.title,
        description: goal.description || '',
        targetAmount: goal.targetAmount.toString(),
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
        type: goal.type,
        priority: goal.priority,
        category: goal.category?._id || '',
        isRecurring: goal.isRecurring,
        recurringAmount: goal.recurringAmount?.toString() || ''
      });
    }
  }, [goal, reset]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      // console.error('Erro ao carregar categorias:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const goalData = {
        ...data,
        targetAmount: parseFloat(data.targetAmount),
        recurringAmount: data.isRecurring ? parseFloat(data.recurringAmount) : null
      };

      if (goal) {
        await axios.put(`/api/goals/${goal._id}`, goalData);
        toast.success('Meta atualizada com sucesso!');
      } else {
        await axios.post('/api/goals', goalData);
        toast.success('Meta criada com sucesso!');
      }

      onSave();
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar meta';
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
              {goal ? 'Editar Meta' : 'Nova Meta'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Flag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('title', {
                    required: 'Título é obrigatório',
                    maxLength: { value: 100, message: 'Título deve ter no máximo 100 caracteres' }
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Ex: Viagem para Europa"
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  {...register('description', {
                    maxLength: { value: 500, message: 'Descrição deve ter no máximo 500 caracteres' }
                  })}
                  rows={3}
                  className="input pl-10"
                  placeholder="Descreva sua meta..."
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Valor Alvo */}
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Valor Alvo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('targetAmount', {
                    required: 'Valor alvo é obrigatório',
                    min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                  })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input pl-10"
                  placeholder="0,00"
                />
              </div>
              {errors.targetAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
              )}
            </div>

            {/* Data Alvo */}
            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data Alvo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('targetDate', { required: 'Data alvo é obrigatória' })}
                  type="date"
                  className="input pl-10"
                />
              </div>
              {errors.targetDate && (
                <p className="mt-1 text-sm text-red-600">{errors.targetDate.message}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                {...register('type', { required: 'Tipo é obrigatório' })}
                className="input"
              >
                <option value="savings">Economia</option>
                <option value="debt_payment">Pagamento de Dívida</option>
                <option value="purchase">Compra</option>
                <option value="investment">Investimento</option>
                <option value="other">Outro</option>
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                {...register('priority', { required: 'Prioridade é obrigatória' })}
                className="input"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria (opcional)
              </label>
              <select
                {...register('category')}
                className="input"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recorrente */}
            <div>
              <label className="flex items-center">
                <input
                  {...register('isRecurring')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Meta recorrente</span>
              </label>
            </div>

            {/* Valor Recorrente */}
            {watch('isRecurring') && (
              <div>
                <label htmlFor="recurringAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Recorrente
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('recurringAmount', {
                      required: watch('isRecurring') ? 'Valor recorrente é obrigatório' : false,
                      min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                    })}
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input pl-10"
                    placeholder="0,00"
                  />
                </div>
                {errors.recurringAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.recurringAmount.message}</p>
                )}
              </div>
            )}

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
                {loading ? 'Salvando...' : (goal ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
