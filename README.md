# 🚀 RotineLife - Organizador Financeiro

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?logo=react" alt="React 18.2.0" />
  <img src="https://img.shields.io/badge/Node.js-16+-green?logo=node.js" alt="Node.js 16+" />
  <img src="https://img.shields.io/badge/MongoDB-4.4+-green?logo=mongodb" alt="MongoDB 4.4+" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License" />
</div>

<br>

<div align="center">
  <h3>🎯 Controle total das suas finanças pessoais</h3>
  <p>Uma aplicação web completa para gerenciar receitas, despesas, orçamentos e metas financeiras de forma simples e eficiente.</p>
</div>

## ✨ Funcionalidades

### 📊 **Dashboard Inteligente**
- Visão geral das suas finanças
- Resumo de receitas, despesas e saldo
- Transações recentes
- Alertas de orçamento
- Progresso das metas

### 💰 **Gestão de Transações**
- Adicionar, editar e excluir transações
- Categorização personalizada
- Filtros avançados por período e categoria
- Suporte a diferentes métodos de pagamento
- Transações recorrentes

### 🏷️ **Categorias Personalizáveis**
- Categorias padrão para receitas e despesas
- Criação de categorias personalizadas
- Ícones e cores personalizáveis
- Organização hierárquica

### 📈 **Orçamentos Inteligentes**
- Definição de limites por categoria
- Alertas quando próximo do limite
- Acompanhamento de progresso em tempo real
- Períodos flexíveis (semanal, mensal, anual)

### 🎯 **Metas Financeiras**
- Definição de objetivos financeiros
- Acompanhamento de progresso visual
- Marcos e notificações
- Diferentes tipos de metas (poupança, investimento, etc.)

### ⚙️ **Personalização Avançada**
- Rótulos personalizáveis
- Múltiplas moedas (BRL, USD, EUR)
- Temas claro/escuro
- Configurações de notificação
- Exportação/importação de dados

## 🛠️ Tecnologias

### **Frontend**
- **React 18.2.0** - Biblioteca para interfaces de usuário
- **React Router** - Roteamento de páginas
- **Tailwind CSS** - Framework CSS utilitário
- **Chart.js** - Gráficos interativos
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação por tokens
- **Bcryptjs** - Criptografia de senhas
- **Express Validator** - Validação de dados

### **Ferramentas de Desenvolvimento**
- **Concurrently** - Execução paralela de scripts
- **Nodemon** - Reinicialização automática do servidor
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Prefixos CSS automáticos

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 16 ou superior
- MongoDB 4.4 ou superior
- Git

### **1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/rotine-life.git
cd rotine-life
```

### **2. Instale as dependências**
```bash
# Instalar dependências de todos os projetos
npm run install-all

# Ou instalar individualmente:
# npm install                    # Dependências do projeto principal
# cd backend && npm install      # Dependências do backend
# cd ../frontend && npm install  # Dependências do frontend
```

### **3. Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp backend/env.example backend/.env

# Edite o arquivo .env com suas configurações
nano backend/.env
```

**Exemplo de configuração (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rotine-life
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRE=7d
```

### **4. Inicie o MongoDB**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### **5. Execute a aplicação**
```bash
# Executar frontend e backend simultaneamente
npm run dev

# Ou executar separadamente:
# npm run server  # Backend na porta 5000
# npm run client  # Frontend na porta 3000
```

### **6. Acesse a aplicação**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 📱 Como Usar

### **1. Criar Conta**
- Acesse http://localhost:3000
- Clique em "Criar uma nova conta"
- Preencha seus dados
- Faça login

### **2. Adicionar Transações**
- Vá para "Transações"
- Clique em "Nova Transação"
- Preencha os dados (valor, descrição, categoria, data)
- Salve

### **3. Criar Categorias**
- Vá para "Categorias"
- Clique em "Nova Categoria"
- Defina nome, tipo, ícone e cor
- Salve

### **4. Definir Orçamentos**
- Vá para "Orçamentos"
- Clique em "Novo Orçamento"
- Selecione categoria e valor
- Defina período e alertas
- Salve

### **5. Criar Metas**
- Vá para "Metas"
- Clique em "Nova Meta"
- Defina objetivo e prazo
- Acompanhe o progresso

### **6. Personalizar Interface**
- Vá para "Configurações"
- Ajuste rótulos, moeda, tema
- Configure notificações
- Exporte/importe dados

## 🔧 Scripts Disponíveis

### **Projeto Principal**
```bash
npm run dev          # Executar frontend e backend
npm run server       # Executar apenas backend
npm run client       # Executar apenas frontend
npm run build        # Build do frontend
npm run install-all  # Instalar todas as dependências
```

### **Backend**
```bash
cd backend
npm start           # Executar em produção
npm run dev         # Executar em desenvolvimento
```

### **Frontend**
```bash
cd frontend
npm start           # Executar em desenvolvimento
npm run build       # Build para produção
npm test            # Executar testes
```

## 📊 Estrutura do Projeto

```
rotine-life/
├── backend/                 # Servidor Node.js
│   ├── models/             # Modelos do MongoDB
│   ├── routes/             # Rotas da API
│   ├── middleware/         # Middlewares
│   ├── config/             # Configurações
│   ├── utils/              # Utilitários
│   └── server.js           # Servidor principal
├── frontend/               # Aplicação React
│   ├── public/             # Arquivos públicos
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── contexts/       # Contextos React
│   │   └── index.js        # Ponto de entrada
│   └── package.json
├── package.json            # Configuração principal
├── .gitignore             # Arquivos ignorados pelo Git
└── README.md              # Este arquivo
```

## 🔐 Segurança

- **Autenticação JWT** - Tokens seguros para sessões
- **Criptografia de senhas** - Bcrypt para hash das senhas
- **Validação de dados** - Validação rigorosa de entrada
- **Rate limiting** - Proteção contra ataques de força bruta
- **CORS configurado** - Controle de origem das requisições
- **Helmet** - Headers de segurança HTTP

## 🚀 Deploy

### **Frontend (Netlify) - Configuração Otimizada**

#### **1. Preparação do Código**
```bash
# Instalar dependências
cd frontend
npm install

# Testar build localmente
npm run build

# Verificar se não há erros
npm run lint
```

#### **2. Configuração do Netlify**
O projeto já inclui `netlify.toml` otimizado:

```toml
[build]
  base = "frontend"
  publish = "build"
  command = "npm ci --silent && npm run build"

[build.environment]
  NODE_VERSION = "18.20.8"
  NPM_FLAGS = "--silent"
```

#### **3. Deploy Automático**
1. **Conecte ao GitHub:**
   - Acesse [Netlify](https://netlify.com)
   - Clique em "New site from Git"
   - Conecte seu repositório GitHub
   - O Netlify detectará automaticamente as configurações

2. **Configurações Recomendadas:**
   - **Build command**: `npm ci --silent && npm run build`
   - **Publish directory**: `build`
   - **Node version**: `18.20.8`

#### **4. Variáveis de Ambiente (Opcional)**
Se usar backend externo, adicione no Netlify:
- `REACT_APP_API_BASE_URL`: `https://seu-backend.onrender.com`

### **Backend (Render) - Configuração Completa**

#### **1. Preparação**
```bash
cd backend
npm install
```

#### **2. Configuração no Render**
1. Conecte seu repositório ao Render
2. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Node Version**: `18`

#### **3. Variáveis de Ambiente**
```
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_super_segura
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/rotinelife
PORT=5000
```

### **📱 Acesso Mobile**
- **URL**: `https://seu-site.netlify.app`
- **PWA**: Funciona offline após primeiro acesso
- **Responsivo**: Otimizado para mobile

### **🔄 Atualizações Automáticas**
- **Frontend**: Push para GitHub → Deploy automático no Netlify
- **Backend**: Push para GitHub → Deploy automático no Render

### **🛠️ Troubleshooting**

#### **Erros Comuns no Netlify:**
1. **Build falha**: Verifique se `npm run build` funciona localmente
2. **Node version**: Use Node.js 18.20.8 (especificado no netlify.toml)
3. **Dependências**: Use `npm ci` em vez de `npm install`

#### **Logs de Debug:**
```bash
# Testar build local
cd frontend
npm run lint
npm run build

# Verificar tamanho do bundle
ls -la build/static/js/
```

#### **Performance:**
- Bundle otimizado: ~97KB gzipped
- Build time: ~2-3 minutos
- Deploy time: ~1-2 minutos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**ErycK**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

## 🙏 Agradecimentos

- Comunidade React
- Equipe do Tailwind CSS
- Desenvolvedores do MongoDB
- Todos os contribuidores de código aberto

---

<div align="center">
  <p>Feito com ❤️ por ErycK</p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>