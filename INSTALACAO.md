# 📥 Guia de Instalação - SafeHaven

## Requisitos do Sistema

- **Python**: 3.11 ou superior
- **Node.js**: 18 ou superior
- **MongoDB**: 6.0 ou superior
- **Yarn**: 1.22 ou superior

---

## 🚀 Instalação Passo a Passo

### 1. Baixar o Projeto

Extraia o arquivo `safehaven_complete.zip` em uma pasta de sua escolha.

```bash
unzip safehaven_complete.zip
cd safehaven_complete
```

### 2. Configurar MongoDB

Instale o MongoDB na sua máquina:

**Windows:**
- Baixe de: https://www.mongodb.com/try/download/community
- Instale e inicie o serviço MongoDB

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Mac
brew install mongodb-community
brew services start mongodb-community
```

### 3. Configurar Backend

```bash
cd backend

# Criar ambiente virtual Python
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

**Configurar arquivo .env:**

Edite o arquivo `backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="safehaven_db"
CORS_ORIGINS="http://localhost:3000"
SECRET_KEY="troque-por-uma-chave-segura-aleatoria"
SENDGRID_API_KEY="sua-chave-sendgrid-aqui"
SENDER_EMAIL="noreply@seudominio.com"
```

**Iniciar o Backend:**

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

O backend estará rodando em: `http://localhost:8001`

### 4. Configurar Frontend

Abra um novo terminal:

```bash
cd frontend

# Instalar dependências
yarn install
```

**Configurar arquivo .env:**

Edite o arquivo `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

**Iniciar o Frontend:**

```bash
yarn start
```

O frontend estará rodando em: `http://localhost:3000`

---

## 📧 Configurar Envio de Emails (Opcional)

Para que os alertas sejam enviados por email:

1. Crie uma conta em: https://sendgrid.com
2. Gere uma API Key com permissão de envio
3. Verifique um email de remetente
4. Adicione a API Key no arquivo `backend/.env`

**Sem SendGrid:** Os alertas ainda funcionam, mas não enviam emails. Os contatos verão os alertas no painel web.

---

## 🧪 Testar o Sistema

### Criar Conta de Usuária:
1. Acesse: `http://localhost:3000`
2. Clique em "Criar Conta"
3. Preencha os dados e crie a conta

### Adicionar Contato de Confiança:
1. No dashboard, vá para "Contatos"
2. Clique em "Adicionar Contato"
3. Preencha nome, email e **senha de acesso**
4. Salve o contato

### Enviar Alerta:
1. Clique no botão vermelho "Enviar Alerta de Emergência"
2. O alerta será registrado no sistema

### Acessar Painel de Contato:
1. Faça logout da conta da usuária
2. Acesse: `http://localhost:3000/contact-login`
3. Entre com email e senha do contato
4. Veja o painel de alertas com sirene

---

## 🛠️ Comandos Úteis

### Backend:
```bash
# Parar o servidor: Ctrl+C

# Verificar logs:
# Os logs aparecem no terminal onde você iniciou o backend

# Limpar banco de dados:
# Acesse MongoDB Compass ou CLI e delete a database
```

### Frontend:
```bash
# Parar o servidor: Ctrl+C

# Build para produção:
yarn build

# Limpar cache:
rm -rf node_modules
yarn install
```

### MongoDB:
```bash
# Ver databases:
mongo
show dbs

# Usar database:
use safehaven_db

# Ver coleções:
show collections

# Ver usuários:
db.users.find()

# Limpar tudo:
db.dropDatabase()
```

---

## 📂 Estrutura do Projeto

```
safehaven_complete/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── requirements.txt   # Dependências Python
│   └── .env              # Configurações
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login usuárias/contatos
│   │   │   ├── Dashboard.jsx       # Dashboard usuárias
│   │   │   └── ContactDashboard.jsx # Painel de contatos
│   │   ├── components/
│   │   │   ├── ui/                 # Componentes Shadcn
│   │   │   └── SafeHavenLogo.jsx  # Logo customizado
│   │   ├── App.js                  # Rotas principais
│   │   ├── App.css                 # Estilos globais
│   │   └── index.css              # Tailwind
│   ├── public/
│   │   ├── siren.mp3              # Som de alerta
│   │   ├── favicon.svg            # Ícone do site
│   │   └── index.html             # HTML principal
│   ├── package.json               # Dependências Node
│   └── .env                       # Configurações
│
└── README.md                      # Documentação
```

---

## ⚠️ Solução de Problemas

### Backend não inicia:
- Verifique se o MongoDB está rodando
- Verifique se a porta 8001 está livre
- Ative o ambiente virtual Python

### Frontend não inicia:
- Execute `yarn install` novamente
- Limpe o cache: `rm -rf node_modules && yarn install`
- Verifique se a porta 3000 está livre

### Alertas não aparecem no painel de contatos:
- Certifique-se de que o backend está rodando
- Verifique o console do navegador para erros
- Confirme que a URL do backend está correta no `.env`

### MongoDB não conecta:
- Verifique se o serviço MongoDB está rodando
- Confirme a URL no arquivo `backend/.env`
- Tente: `mongodb://127.0.0.1:27017` se localhost não funcionar

---

## 🌐 Deployment em Produção

### Backend (Recomendações):
- Use Heroku, Railway, Render ou DigitalOcean
- Configure variáveis de ambiente no serviço
- Use MongoDB Atlas para database cloud
- Configure CORS com domínio específico

### Frontend (Recomendações):
- Use Vercel, Netlify ou Cloudflare Pages
- Build: `yarn build`
- Configure variável de ambiente `REACT_APP_BACKEND_URL` com URL do backend em produção

### Segurança em Produção:
1. Mude `SECRET_KEY` para valor aleatório forte
2. Configure `CORS_ORIGINS` para seu domínio específico
3. Use HTTPS (SSL/TLS)
4. Configure SendGrid para emails reais
5. Use MongoDB com autenticação

---

## 📞 Contatos de Emergência

**Em caso de emergência real:**
- Brasil: 180 (Central de Atendimento à Mulher)
- Brasil: 190 (Polícia Militar)
- Brasil: 192 (SAMU)

---

## 📝 Notas Importantes

- Este sistema foi desenvolvido para ajudar mulheres em situação de risco
- Use com responsabilidade e sempre informe autoridades em situações reais
- Mantenha suas senhas seguras
- Faça backups regulares do banco de dados
- Atualize as dependências regularmente para segurança

---

**SafeHaven** - Sistema de Proteção 🛡️💜

Versão: 1.0
Data: Dezembro 2024
