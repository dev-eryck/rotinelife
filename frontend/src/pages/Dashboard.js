import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
// import { useToast } from '../contexts/ToastContext'; // Removido - não utilizado
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  HelpCircle,
  BarChart3,
  PieChart
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, transactions, budgets, goals, loading } = useData();
  // const { error } = useToast(); // Removido - não utilizado
  const navigate = useNavigate();

  // Pegar as 5 transações mais recentes
  const recentTransactions = transactions.slice(0, 5);

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

  const handleStatCardClick = (type) => {
    navigate('/transactions', { state: { filter: type } });
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'progress-fill-danger';
    if (percentage >= 75) return 'progress-fill-warning';
    return 'progress-fill-safe';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Olá, {user?.name || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo ao RotineLife! Comece adicionando suas primeiras transações.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/transactions"
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Link>
        </div>
      </div>

      {/* Stats Cards - Clicáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="stat-card"
          onClick={() => handleStatCardClick('income')}
        >
          <div className="flex items-center">
            <div className="icon-container icon-container-green">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <p className="stat-label">Receitas</p>
                <div className="tooltip ml-1">
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                  <span className="tooltip-text">
                    Soma de todas as receitas no período
                  </span>
                </div>
              </div>
              <p className="stat-value text-green-600">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="stat-card"
          onClick={() => handleStatCardClick('expense')}
        >
          <div className="flex items-center">
            <div className="icon-container icon-container-red">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <p className="stat-label">Despesas</p>
                <div className="tooltip ml-1">
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                  <span className="tooltip-text">
                    Soma de todas as despesas no período
                  </span>
                </div>
              </div>
              <p className="stat-value text-red-600">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="stat-card"
          onClick={() => handleStatCardClick('all')}
        >
          <div className="flex items-center">
            <div className="icon-container icon-container-blue">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <p className="stat-label">Saldo Disponível</p>
                <div className="tooltip ml-1">
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                  <span className="tooltip-text">
                    Dinheiro disponível para gastos (Receitas - Despesas - Metas)
                  </span>
                </div>
              </div>
              <p className={`stat-value ${stats.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.availableBalance)}
              </p>
            </div>
          </div>
        </div>


        <div 
          className="stat-card"
          onClick={() => handleStatCardClick('goals')}
        >
          <div className="flex items-center">
            <div className="icon-container icon-container-orange">
              <Target className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <p className="stat-label">Reservado em Metas</p>
                <div className="tooltip ml-1">
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                  <span className="tooltip-text">
                    Dinheiro reservado em metas ativas
                  </span>
                </div>
              </div>
              <p className="stat-value text-orange-600">
                {formatCurrency(stats.totalReservedInGoals)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State - Quando não há dados */}
      {stats.totalIncome === 0 && stats.totalExpense === 0 && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Comece sua jornada financeira!
          </h3>
          <p className="text-gray-600 mb-6">
            Adicione sua primeira transação para ver seu resumo financeiro aqui.
          </p>
          <Link
            to="/transactions"
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeira Transação
          </Link>
        </div>
      )}

      {/* Budgets - Só aparece quando há orçamentos */}
      {budgets.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Orçamentos</h3>
              <Link
                to="/budgets"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Gerenciar
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            {budgets.slice(0, 3).map((budget) => (
              <div key={budget._id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {budget.category.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getProgressBarColor(budget.percentage)}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {budget.percentage.toFixed(1)}% utilizado
                  </span>
                  {budget.percentage > 75 && (
                    <div className="flex items-center text-xs text-orange-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {budget.percentage >= 100 ? 'Orçamento estourado' : 'Próximo do limite'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals - Só aparece quando há metas */}
      {goals.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Metas Financeiras</h3>
              <Link
                to="/goals"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Ver todas
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.slice(0, 2).map((goal) => (
              <div key={goal._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <span className="text-sm text-gray-500">
                    {formatDate(goal.deadline)}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
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
                  <span className="text-sm font-medium text-blue-600">
                    {goal.percentage.toFixed(1)}% concluído
                  </span>
                  <span className="text-sm text-gray-500">
                    Faltam {formatCurrency(goal.target - goal.current)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section - Só aparece quando há dados */}
      {(stats.totalIncome > 0 || stats.totalExpense > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receitas vs Despesas Chart */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title">Receitas vs Despesas</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Receitas</span>
                </div>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats.monthlyIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Despesas</span>
                </div>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats.monthlyExpense)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${(stats.monthlyIncome / (stats.monthlyIncome + stats.monthlyExpense)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Gastos por Categoria Chart */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title">Gastos por Categoria</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500">Adicione transações para ver o gráfico de categorias</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions - Só aparece quando há transações */}
      {recentTransactions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Transações Recentes</h3>
              <Link
                to="/transactions"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Ver todas
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${transaction.category.color}20` }}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5" style={{ color: transaction.category.color }} />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" style={{ color: transaction.category.color }} />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.category.name} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;