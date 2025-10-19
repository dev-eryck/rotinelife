import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Tag, Palette, Hash } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const CategoryModal = ({ category, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      name: '',
      type: 'expense',
      icon: '📁',
      color: '#808080'
    }
  });

  const watchType = watch('type');

  const iconOptions = [
    '📁', '💰', '💼', '📈', '💵', '🍽️', '🚗', '🏠', '🏥', '📚', 
    '🎬', '👕', '🛒', '⚡', '📱', '🎮', '✈️', '🏖️', '🎉', '🎁'
  ];

  const colorOptions = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#607D8B', '#808080', '#000000'
  ];

  React.useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color
      });
    }
  }, [category, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      if (category) {
        await axios.put(`/api/categories/${category._id}`, data);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await axios.post('/api/categories', data);
        toast.success('Categoria criada com sucesso!');
      }

      onSave();
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao salvar categoria';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {category ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name', {
                    required: 'Nome é obrigatório',
                    maxLength: { value: 50, message: 'Nome deve ter no máximo 50 caracteres' }
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Ex: Alimentação"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

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

            {/* Ícone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícone
              </label>
              <div className="grid grid-cols-10 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => reset({ ...watch(), icon })}
                    className={`h-10 w-10 rounded-md border-2 flex items-center justify-center text-lg hover:bg-gray-50 ${
                      watch('icon') === icon
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <input
                {...register('icon')}
                type="hidden"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <div className="grid grid-cols-10 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => reset({ ...watch(), color })}
                    className={`h-8 w-8 rounded-full border-2 hover:scale-110 transition-transform ${
                      watch('color') === color
                        ? 'border-gray-800'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                {...register('color')}
                type="hidden"
              />
            </div>

            {/* Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="flex items-center">
                <div 
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: watch('color') }}
                >
                  {watch('icon')}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {watch('name') || 'Nome da categoria'}
                  </p>
                  <p className={`text-xs ${
                    watchType === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {watchType === 'income' ? 'Receita' : 'Despesa'}
                  </p>
                </div>
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
                {loading ? 'Salvando...' : (category ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
