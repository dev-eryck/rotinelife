import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t._id === action.payload._id ? action.payload : t
        )
      };
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t._id !== action.payload)
      };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    
    case 'ADD_BUDGET':
      return { ...state, budgets: [action.payload, ...state.budgets] };
    
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(b => 
          b._id === action.payload._id ? action.payload : b
        )
      };
    
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(b => b._id !== action.payload)
      };
    
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    
    case 'ADD_GOAL':
      return { ...state, goals: [action.payload, ...state.goals] };
    
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => 
          g._id === action.payload._id ? action.payload : g
        )
      };
    
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g._id !== action.payload)
      };
    
    case 'RESET_DATA':
      return {
        ...state,
        transactions: [],
        budgets: [],
        goals: [],
        loading: false
      };
    
    default:
      return state;
  }
};

const initialState = {
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
  loading: false
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user } = useAuth();

  // Calcular estatísticas
  const calculateStats = () => {
    const totalIncome = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calcular dinheiro reservado em metas ativas
    const totalReservedInGoals = state.goals
      .filter(g => g.status === 'active')
      .reduce((sum, g) => sum + g.current, 0);
    
    // Saldo disponível = Receitas - Despesas - Dinheiro reservado em metas
    const availableBalance = totalIncome - totalExpense - totalReservedInGoals;
    
    // Calcular valores mensais
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = state.transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpense = state.transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const monthlyBalance = monthlyIncome - monthlyExpense;
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense, // Saldo total (sem considerar metas)
      availableBalance, // Saldo disponível (considerando metas)
      totalReservedInGoals,
      monthlyIncome,
      monthlyExpense,
      monthlyBalance
    };
  };

  // Calcular gastos por categoria para orçamentos
  const calculateBudgetSpending = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return state.budgets.map(budget => {
      // Calcular gastos na categoria deste orçamento no mês atual
      const spent = state.transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return t.type === 'expense' && 
                 t.category._id === budget.category._id &&
                 transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      
      return {
        ...budget,
        spent,
        percentage
      };
    });
  };

  const budgetsWithSpending = calculateBudgetSpending();
  const stats = calculateStats();

  // Carregar categorias padrão
  useEffect(() => {
    const defaultCategories = [
      { _id: 'cat-1', name: 'Salário', type: 'income', icon: '💰', color: '#10B981' },
      { _id: 'cat-2', name: 'Freelance', type: 'income', icon: '💼', color: '#3B82F6' },
      { _id: 'cat-3', name: 'Investimentos', type: 'income', icon: '📈', color: '#F59E0B' },
      { _id: 'cat-4', name: 'Outros', type: 'income', icon: '💵', color: '#8B5CF6' },
      { _id: 'cat-5', name: 'Alimentação', type: 'expense', icon: '🍽️', color: '#EF4444' },
      { _id: 'cat-6', name: 'Transporte', type: 'expense', icon: '🚗', color: '#6B7280' },
      { _id: 'cat-7', name: 'Moradia', type: 'expense', icon: '🏠', color: '#92400E' },
      { _id: 'cat-8', name: 'Saúde', type: 'expense', icon: '🏥', color: '#EC4899' },
      { _id: 'cat-9', name: 'Educação', type: 'expense', icon: '📚', color: '#6366F1' },
      { _id: 'cat-10', name: 'Lazer', type: 'expense', icon: '🎬', color: '#8B5CF6' }
    ];
    
    dispatch({ type: 'SET_CATEGORIES', payload: defaultCategories });
  }, [dispatch]);

  const value = {
    ...state,
    budgets: budgetsWithSpending,
    stats,
    dispatch
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};
