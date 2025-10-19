import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Bell, 
  Globe, 
  Palette, 
  Download, 
  Upload, 
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [, setSettings] = useState({
    preferences: {
      currency: 'BRL',
      language: 'pt-BR',
      theme: 'light'
    },
    customLabels: {
      income: 'Receitas',
      expense: 'Despesas',
      balance: 'Saldo',
      budget: 'Orçamento',
      goal: 'Meta'
    },
    notifications: {
      email: true,
      push: true,
      budgetAlerts: true,
      goalMilestones: true,
      monthlyReports: true
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
      
      // Preencher formulário
      setValue('name', user?.name || '');
      setValue('email', user?.email || '');
      setValue('currency', response.data.preferences.currency);
      setValue('language', response.data.preferences.language);
      setValue('theme', response.data.preferences.theme);
      setValue('incomeLabel', response.data.customLabels.income);
      setValue('expenseLabel', response.data.customLabels.expense);
      setValue('balanceLabel', response.data.customLabels.balance);
      setValue('budgetLabel', response.data.customLabels.budget);
      setValue('goalLabel', response.data.customLabels.goal);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, [user, setValue]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmitProfile = async (data) => {
    try {
      setLoading(true);
      await axios.put('/api/auth/profile', data);
      updateUser(data);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPreferences = async (data) => {
    try {
      setLoading(true);
      await axios.put('/api/settings/preferences', data);
      setSettings(prev => ({
        ...prev,
        preferences: { ...prev.preferences, ...data }
      }));
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitLabels = async (data) => {
    try {
      setLoading(true);
      await axios.put('/api/settings/labels', data);
      setSettings(prev => ({
        ...prev,
        customLabels: { ...prev.customLabels, ...data }
      }));
    } catch (error) {
      console.error('Erro ao atualizar rótulos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitNotifications = async (data) => {
    try {
      setLoading(true);
      await axios.put('/api/settings/notifications', data);
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...data }
      }));
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post('/api/settings/export');
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rotine-life-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await axios.post('/api/settings/import', { data });
      fetchSettings();
    } catch (error) {
      console.error('Erro ao importar dados:', error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'preferences', name: 'Preferências', icon: Globe },
    { id: 'labels', name: 'Rótulos', icon: Palette },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'data', name: 'Dados', icon: Download }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-1 text-sm text-gray-500">
          Personalize sua experiência no RotineLife
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card">
            <div className="card-content">
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Informações do Perfil</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo
                    </label>
                    <input
                      {...register('name', {
                        required: 'Nome é obrigatório',
                        minLength: { value: 2, message: 'Nome deve ter no mínimo 2 caracteres' }
                      })}
                      type="text"
                      className="input"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email é obrigatório',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Email inválido'
                        }
                      })}
                      type="email"
                      className="input"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </button>
                </form>
              )}

              {activeTab === 'preferences' && (
                <form onSubmit={handleSubmit(onSubmitPreferences)} className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Preferências Gerais</h3>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moeda
                      </label>
                      <select {...register('currency')} className="input">
                        <option value="BRL">Real (BRL)</option>
                        <option value="USD">Dólar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Idioma
                      </label>
                      <select {...register('language')} className="input">
                        <option value="pt-BR">Português (BR)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español (ES)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tema
                      </label>
                      <select {...register('theme')} className="input">
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </button>
                </form>
              )}

              {activeTab === 'labels' && (
                <form onSubmit={handleSubmit(onSubmitLabels)} className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Rótulos Personalizados</h3>
                  <p className="text-sm text-gray-500">
                    Personalize os termos usados na interface
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rótulo para Receitas
                      </label>
                      <input
                        {...register('incomeLabel', {
                          required: 'Rótulo é obrigatório',
                          maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                        })}
                        type="text"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rótulo para Despesas
                      </label>
                      <input
                        {...register('expenseLabel', {
                          required: 'Rótulo é obrigatório',
                          maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                        })}
                        type="text"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rótulo para Saldo
                      </label>
                      <input
                        {...register('balanceLabel', {
                          required: 'Rótulo é obrigatório',
                          maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                        })}
                        type="text"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rótulo para Orçamento
                      </label>
                      <input
                        {...register('budgetLabel', {
                          required: 'Rótulo é obrigatório',
                          maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                        })}
                        type="text"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rótulo para Meta
                      </label>
                      <input
                        {...register('goalLabel', {
                          required: 'Rótulo é obrigatório',
                          maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                        })}
                        type="text"
                        className="input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Rótulos
                  </button>
                </form>
              )}

              {activeTab === 'notifications' && (
                <form onSubmit={handleSubmit(onSubmitNotifications)} className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Notificações</h3>
                  <p className="text-sm text-gray-500">
                    Configure como você deseja receber notificações
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email</h4>
                        <p className="text-sm text-gray-500">Receber notificações por email</p>
                      </div>
                      <input
                        {...register('email')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Push</h4>
                        <p className="text-sm text-gray-500">Receber notificações push</p>
                      </div>
                      <input
                        {...register('push')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Alertas de Orçamento</h4>
                        <p className="text-sm text-gray-500">Notificar quando o orçamento estiver próximo do limite</p>
                      </div>
                      <input
                        {...register('budgetAlerts')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Marcos de Meta</h4>
                        <p className="text-sm text-gray-500">Notificar quando atingir marcos nas suas metas</p>
                      </div>
                      <input
                        {...register('goalMilestones')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Relatórios Mensais</h4>
                        <p className="text-sm text-gray-500">Receber relatórios mensais por email</p>
                      </div>
                      <input
                        {...register('monthlyReports')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Notificações
                  </button>
                </form>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Gerenciamento de Dados</h3>
                  
                  <div className="space-y-4">
                    <div className="card">
                      <div className="card-content">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Exportar Dados</h4>
                            <p className="text-sm text-gray-500">
                              Baixe todos os seus dados em formato JSON
                            </p>
                          </div>
                          <button
                            onClick={handleExport}
                            className="btn btn-outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-content">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Importar Dados</h4>
                            <p className="text-sm text-gray-500">
                              Importe dados de um arquivo JSON
                            </p>
                          </div>
                          <div>
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImport}
                              className="hidden"
                              id="import-file"
                            />
                            <label
                              htmlFor="import-file"
                              className="btn btn-outline cursor-pointer"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Importar
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;