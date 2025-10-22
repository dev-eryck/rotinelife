# 🚀 Deploy do Backend no Render

## **Passo a Passo para Deploy do Backend:**

### **1. Acesse o Render:**
- Vá para: https://render.com
- Faça login com sua conta GitHub

### **2. Criar Novo Serviço:**
- Clique em "New +" → "Web Service"
- Conecte seu repositório GitHub: `dev-eryck/rotinelife`

### **3. Configurações do Serviço:**
- **Name**: `rotinelife-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### **4. Variáveis de Ambiente:**
Adicione estas variáveis no Render:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/rotinelife?retryWrites=true&w=majority
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRE=7d
```

### **5. MongoDB Atlas (Opcional):**
- Crie uma conta gratuita em: https://www.mongodb.com/cloud/atlas
- Crie um cluster gratuito
- Copie a string de conexão
- Cole na variável `MONGODB_URI`

### **6. Deploy:**
- Clique em "Create Web Service"
- Aguarde o deploy (2-3 minutos)
- Copie a URL gerada (ex: `https://rotinelife-backend.onrender.com`)

### **7. Atualizar Frontend:**
Após o deploy, atualize o arquivo `frontend/public/env.js`:

```javascript
window.REACT_APP_API_URL = 'https://SUA_URL_DO_RENDER.com';
```

### **8. Fazer Commit:**
```bash
git add .
git commit -m "Update backend URL for production"
git push origin main
```

## **✅ Resultado:**
- Backend funcionando no Render
- CORS configurado corretamente
- Frontend conectando com backend em produção
- Login funcionando perfeitamente!

## **🔧 Troubleshooting:**
- Se der erro de CORS, verifique se a URL do backend está correta
- Se der erro de MongoDB, verifique se a string de conexão está correta
- Se der erro de JWT, verifique se o JWT_SECRET está configurado
