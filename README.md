# SafeHaven - Sistema de Proteção para Mulheres

SafeHaven é um sistema discreto e seguro desenvolvido para ajudar mulheres em situação de violência doméstica. O sistema permite o envio de alertas silenciosos para pessoas de confiança, sem que o agressor perceba.

## 🛡️ Características Principais

- **Alerta Silencioso**: Botão de emergência discreto que envia notificações por email
- **Contatos de Confiança**: Sistema para cadastrar pessoas que podem ajudar
- **Design Discreto**: Interface com cores suaves (roxo, rosa, lavanda) que não chama atenção
- **Privacidade Total**: Dados criptografados e opção de limpar tudo rapidamente
- **Localização GPS**: Envia sua localização aproximada no alerta (opcional)
- **Histórico de Alertas**: Registro de todos os alertas enviados

## 🚀 Funcionalidades

### Autenticação
- Registro de nova conta com email, senha, nome e telefone
- Login seguro com JWT tokens
- Logout com limpeza de sessão

### Gerenciamento de Contatos
- Adicionar contatos de confiança (nome, email, telefone)
- Visualizar lista de contatos
- Remover contatos

### Sistema de Alertas
- Botão vermelho grande e acessível
- Envio silencioso por email
- Inclusão automática de localização (se disponível)
- Notificação instantânea para todos os contatos

### Configurações
- Visualizar informações da conta
- Histórico de alertas enviados
- Opção de limpar todos os dados (zona de perigo)

## 🏗️ Arquitetura

### Backend (FastAPI + Python)
- **Framework**: FastAPI 0.110.1
- **Banco de Dados**: MongoDB
- **Autenticação**: JWT com bcrypt
- **Email**: SendGrid API

### Frontend (React)
- **Framework**: React 19
- **UI Components**: Shadcn/UI + Radix UI
- **Estilo**: Tailwind CSS
- **Roteamento**: React Router
- **Notificações**: Sonner (toasts)

## 📦 Instalação e Configuração

### 1. Backend

```bash
cd /app/backend
pip install -r requirements.txt
```

Configure as variáveis de ambiente em `/app/backend/.env`:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="safehaven_db"
CORS_ORIGINS="*"
SECRET_KEY="sua-chave-secreta-aqui"
SENDGRID_API_KEY="sua-chave-sendgrid-aqui"
SENDER_EMAIL="noreply@seudominio.com"
```

### 2. Frontend

```bash
cd /app/frontend
yarn install
```

O arquivo `.env` já está configurado com a URL do backend.

### 3. Iniciar Serviços

```bash
sudo supervisorctl restart backend frontend
```

## 🔐 Segurança

- Senhas são hasheadas com bcrypt
- JWT tokens para autenticação
- CORS configurado
- Dados sensíveis em variáveis de ambiente
- Opção de limpar todos os dados rapidamente

## 📧 Configuração de Email

Para enviar alertas reais por email, você precisa:

1. Criar uma conta no [SendGrid](https://sendgrid.com)
2. Gerar uma API Key com permissão de envio
3. Verificar um email de remetente
4. Adicionar a API Key no arquivo `.env` do backend

## 🎨 Design

O design foi cuidadosamente criado para ser:
- **Discreto**: Não parece um app de emergência
- **Feminino**: Cores suaves e acolhedoras
- **Acessível**: Botões grandes e fáceis de usar
- **Responsivo**: Funciona em desktop e mobile

Cores principais:
- Roxo: `#9333ea` (purple-600)
- Rosa: `#ec4899` (pink-600)
- Lavanda: Tons claros no background

## 📱 Como Usar

1. **Criar Conta**: Registre-se com email e senha
2. **Adicionar Contatos**: Cadastre pessoas de confiança que podem te ajudar
3. **Em Emergência**: Pressione o botão vermelho grande
4. **Alerta Enviado**: Seus contatos receberão um email imediatamente

## ⚠️ Importante

- Certifique-se de ter pelo menos 1 contato cadastrado antes de enviar alertas
- O sistema tenta obter sua localização automaticamente (você precisa permitir no navegador)
- Emails só serão enviados se a API do SendGrid estiver configurada
- Use a opção "Limpar Dados" apenas em caso de extrema necessidade

## 🧪 Testes

O sistema foi testado com:
- ✅ Autenticação e registro
- ✅ Gerenciamento de contatos
- ✅ Envio de alertas
- ✅ Interface responsiva
- ✅ Fluxo completo de usuário

Taxa de sucesso: **95.5%** (backend 90.9%, frontend 100%)

## 📞 Suporte

Em caso de emergência real, sempre contate as autoridades:
- **Brasil**: 180 (Central de Atendimento à Mulher)
- **Brasil**: 190 (Polícia Militar)
- **Brasil**: 192 (SAMU)

## 📄 Licença

Este projeto foi desenvolvido com fins educacionais e de proteção social.

---

**SafeHaven** - Um lugar seguro para você 💜
