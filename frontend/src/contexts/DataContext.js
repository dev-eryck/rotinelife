import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';

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
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c._id !== action.payload)
      };
    
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
  const { user, token } = useAuth();

  // Carregar dados do backend quando o usuário fizer login
  useEffect(() => {
    if (user && token) {
      loadData();
    } else {
      // Limpar dados quando usuário sair
      dispatch({ type: 'RESET_DATA' });
    }
  }, [user, token]);

  const loadData = async () => {
    try {
      console.log('🔄 Carregando dados do backend...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Carregar transações
      console.log('📊 Carregando transações...');
      const transactionsResponse = await axios.get(API_ENDPOINTS.TRANSACTIONS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Transações carregadas:', transactionsResponse.data.transactions);
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactionsResponse.data.transactions });

      // Carregar categorias
      console.log('🏷️ Carregando categorias...');
      const categoriesResponse = await axios.get(API_ENDPOINTS.CATEGORIES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Categorias carregadas:', categoriesResponse.data);
      dispatch({ type: 'SET_CATEGORIES', payload: categoriesResponse.data });

      // Carregar orçamentos
      console.log('💰 Carregando orçamentos...');
      const budgetsResponse = await axios.get(API_ENDPOINTS.BUDGETS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Orçamentos carregados:', budgetsResponse.data);
      dispatch({ type: 'SET_BUDGETS', payload: budgetsResponse.data });

      // Carregar metas
      console.log('🎯 Carregando metas...');
      const goalsResponse = await axios.get(API_ENDPOINTS.GOALS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Metas carregadas:', goalsResponse.data);
      dispatch({ type: 'SET_GOALS', payload: goalsResponse.data });

      console.log('🎉 Todos os dados carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      console.error('❌ Detalhes do erro:', error.response?.data);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

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

  // Funções para interagir com o backend
  const addTransaction = async (transactionData) => {
    try {
      console.log('➕ Adicionando transação:', transactionData);
      const response = await axios.post(API_ENDPOINTS.TRANSACTIONS, transactionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Transação adicionada:', response.data.transaction);
      dispatch({ type: 'ADD_TRANSACTION', payload: response.data.transaction });
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao adicionar transação:', error);
      console.error('❌ Detalhes do erro:', error.response?.data);
      return { success: false, error: error.response?.data?.message || 'Erro ao adicionar transação' };
    }
  };

  const addBudget = async (budgetData) => {
    try {
      console.log('💰 Adicionando orçamento:', budgetData);
      const response = await axios.post(API_ENDPOINTS.BUDGETS, budgetData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Orçamento adicionado:', response.data.budget);
      dispatch({ type: 'ADD_BUDGET', payload: response.data.budget });
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao adicionar orçamento:', error);
      console.error('❌ Detalhes do erro:', error.response?.data);
      return { success: false, error: error.response?.data?.message || 'Erro ao adicionar orçamento' };
    }
  };

  const addGoal = async (goalData) => {
    try {
      console.log('🎯 Adicionando meta:', goalData);
      const response = await axios.post(API_ENDPOINTS.GOALS, goalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Meta adicionada:', response.data.goal);
      dispatch({ type: 'ADD_GOAL', payload: response.data.goal });
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao adicionar meta:', error);
      console.error('❌ Detalhes do erro:', error.response?.data);
      return { success: false, error: error.response?.data?.message || 'Erro ao adicionar meta' };
    }
  };

  const value = {
    ...state,
    budgets: budgetsWithSpending,
    stats,
    dispatch,
    addTransaction,
    addBudget,
    addGoal,
    loadData
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
