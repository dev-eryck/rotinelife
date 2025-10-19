# 🚀 Guia de Deploy - RotineLife

## 📋 Pré-requisitos

- Conta no [Netlify](https://netlify.com) (gratuita)
- Conta no [Render](https://render.com) (gratuita)
- Git configurado no seu computador
- Node.js instalado

## 🎯 Deploy do Frontend (Netlify)

### Opção 1: Deploy via Netlify CLI (Recomendado)

1. **Instalar Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Fazer login no Netlify:**
```bash
netlify login
```

3. **Navegar para a pasta frontend:**
```bash
cd frontend
```

4. **Fazer build do projeto:**
```bash
npm run build
```

5. **Deploy:**
```bash
netlify deploy --prod --dir=build
```

### Opção 2: Deploy via GitHub (Mais fácil)

1. **Criar repositório no GitHub:**
   - Acesse [github.com](https://github.com)
   - Clique em "New repository"
   - Nome: `rotinelife`
   - Marque como público
   - Clique em "Create repository"

2. **Subir código para GitHub:**
```bash
# Na pasta do projeto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/rotinelife.git
git push -u origin main
```

3. **Conectar ao Netlify:**
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Escolha "GitHub"
   - Selecione o repositório `rotinelife`
   - Configurações:
     - Build command: `cd frontend && npm run build`
     - Publish directory: `frontend/build`
   - Clique em "Deploy site"

## 🔧 Deploy do Backend (Render)

1. **Acesse [render.com](https://render.com)**
2. **Clique em "New +" → "Web Service"**
3. **Conecte seu repositório GitHub**
4. **Configurações:**
   - Name: `rotinelife-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Node Version: `18`

5. **Variáveis de Ambiente:**
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render define automaticamente)
   - `JWT_SECRET`: `sua_chave_secreta_super_forte_aqui`
   - `MONGODB_URI`: `sua_string_de_conexao_mongodb` (opcional)

6. **Clique em "Create Web Service"**

## 🔗 Configurar URLs

Após o deploy, você receberá:
- **Frontend**: `https://seu-site.netlify.app`
- **Backend**: `https://rotinelife-backend.onrender.com`

### Atualizar configuração do frontend:

1. **Edite o arquivo `frontend/public/env.js`:**
```javascript
window.REACT_APP_API_URL = 'https://rotinelife-backend.onrender.com';
```

2. **Faça novo deploy:**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=build
```

## ✅ Verificação Final

1. **Teste o frontend:** Acesse sua URL do Netlify
2. **Teste o login:** Use as credenciais demo
3. **Teste funcionalidades:** Adicione transações, orçamentos, etc.
4. **Teste mobile:** Acesse pelo celular

## 🆘 Solução de Problemas

### Erro de CORS:
- Verifique se o backend está rodando
- Confirme a URL da API no frontend

### Erro 404:
- Verifique se o build foi feito corretamente
- Confirme o diretório de publish no Netlify

### Erro de conexão:
- Verifique as variáveis de ambiente
- Confirme se o backend está online

## 📱 Acesso Mobile

Após o deploy, você poderá acessar o site de qualquer dispositivo:
- **Desktop**: Navegador normal
- **Mobile**: Adicione à tela inicial (PWA)
- **Tablet**: Interface responsiva

## 🔄 Atualizações Futuras

Para atualizar o site:
1. Faça as alterações no código
2. Commit e push para GitHub
3. O Netlify fará deploy automático
4. O Render fará deploy automático do backend

---

**🎉 Parabéns! Seu RotineLife está online!**
