import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Categories = () => {
  const { success, error } = useToast();
  const { categories, dispatch } = useData();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        setLoading(true);
        
        // Simular exclusão
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remover categoria do contexto
        dispatch({ type: 'DELETE_CATEGORY', payload: id });
        success('Categoria excluída com sucesso!');
      } catch (err) {
        error('Erro ao excluir categoria');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCategories = (categories || []).filter(category => {
    if (filter === 'all') return true;
    return category.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize suas receitas e despesas por categoria
          </p>
        </div>
        <button className="btn btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('income')}
          className={`btn ${filter === 'income' ? 'btn-primary' : 'btn-outline'}`}
        >
          Receitas
        </button>
        <button
          onClick={() => setFilter('expense')}
          className={`btn ${filter === 'expense' ? 'btn-primary' : 'btn-outline'}`}
        >
          Despesas
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category._id} className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    {!category.isDefault && (
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Comece criando sua primeira categoria
            </p>
            <button className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;