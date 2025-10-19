# 🚀 Guia de Instalação Rápida - RotineLife

## ⚡ Instalação em 5 Minutos

### 1️⃣ **Pré-requisitos**
```bash
# Verificar se Node.js está instalado
node --version  # Deve ser 16+

# Verificar se MongoDB está instalado
mongod --version  # Deve ser 4.4+
```

### 2️⃣ **Clone e Instale**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/rotine-life.git
cd rotine-life

# Instale todas as dependências
npm run install-all
```

### 3️⃣ **Configure o Banco**
```bash
# Copie o arquivo de configuração
cp backend/env.example backend/.env

# Edite o arquivo .env (opcional - funciona com configurações padrão)
nano backend/.env
```

### 4️⃣ **Inicie o MongoDB**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 5️⃣ **Execute a Aplicação**
```bash
# Execute frontend e backend juntos
npm run dev
```

### 6️⃣ **Acesse**
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

## 🎯 Primeiro Uso

1. **Crie sua conta** em http://localhost:3000
2. **Faça login** com suas credenciais
3. **Adicione uma transação** para começar
4. **Explore as funcionalidades** do dashboard

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Frontend + Backend
npm run server       # Apenas Backend
npm run client       # Apenas Frontend

# Produção
npm run build        # Build do frontend
npm start           # Executar em produção

# Manutenção
npm run install-all # Reinstalar dependências
```

## 🆘 Solução de Problemas

### **Erro de Porta em Uso**
```bash
# Verificar processos na porta 3000 ou 5000
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Matar processo (Windows)
taskkill /PID <PID> /F
```

### **Erro de MongoDB**
```bash
# Verificar se MongoDB está rodando
net start MongoDB  # Windows
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

### **Erro de Dependências**
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm run install-all
```

## 📱 Demo Rápido

**Conta de Teste:**
- Email: `demo@rotinelife.com`
- Senha: `123456`

## 🎉 Pronto!

Sua aplicação **RotineLife** está funcionando! 

**Funcionalidades disponíveis:**
- ✅ Dashboard financeiro
- ✅ Gestão de transações
- ✅ Categorias personalizáveis
- ✅ Orçamentos inteligentes
- ✅ Metas financeiras
- ✅ Configurações avançadas

---

**Precisa de ajuda?** Consulte o [README.md](README.md) completo ou abra uma issue no GitHub.
