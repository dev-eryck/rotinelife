import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Tag, DollarSign, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const TransactionModal = ({ transaction, categories, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      tags: '',
      location: '',
      notes: ''
    }
  });

  const watchType = watch('type');

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.description,
        category: transaction.category?._id || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
        paymentMethod: transaction.paymentMethod || 'cash',
        tags: transaction.tags?.join(', ') || '',
        location: transaction.location || '',
        notes: transaction.notes || ''
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const transactionData = {
        ...data,
        amount: parseFloat(data.amount),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      if (transaction) {
        await axios.put(`/api/transactions/${transaction._id}`, transactionData);
        toast.success('Transação atualizada com sucesso!');
      } else {
        await axios.post('/api/transactions', transactionData);
        toast.success('Transação criada com sucesso!');
      }

      onSave();
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar transação';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === watchType);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {transaction ? 'Editar Transação' : 'Nova Transação'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center">
                  <input
                    {...register('type')}
                    type="radio"
                    value="expense"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Despesa</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('type')}
                    type="radio"
                    value="income"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Receita</span>
                </label>
              </div>
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Valor
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

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('description', {
                    required: 'Descrição é obrigatória',
                    maxLength: { value: 200, message: 'Descrição deve ter no máximo 200 caracteres' }
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Ex: Almoço no restaurante"
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register('category', { required: 'Categoria é obrigatória' })}
                  className="input pl-10"
                >
                  <option value="">Selecione uma categoria</option>
                  {filteredCategories.map((category) => (
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

            {/* Data */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('date', { required: 'Data é obrigatória' })}
                  type="date"
                  className="input pl-10"
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* Método de Pagamento */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pagamento
              </label>
              <select
                {...register('paymentMethod')}
                className="input"
              >
                <option value="cash">Dinheiro</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="bank_transfer">Transferência Bancária</option>
                <option value="other">Outro</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                {...register('tags')}
                type="text"
                className="input"
                placeholder="Ex: trabalho, urgente, importante"
              />
            </div>

            {/* Localização */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Localização
              </label>
              <input
                {...register('location')}
                type="text"
                className="input"
                placeholder="Ex: Shopping Center, Supermercado ABC"
              />
            </div>

            {/* Notas */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                {...register('notes', {
                  maxLength: { value: 500, message: 'Notas devem ter no máximo 500 caracteres' }
                })}
                rows={3}
                className="input"
                placeholder="Observações adicionais..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
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
                {loading ? 'Salvando...' : (transaction ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
