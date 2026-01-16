# Converse em 21 Dias

Um Micro SaaS elegante para uma jornada de autoconhecimento e mudança de comportamento em 21 dias.

## 🎯 Funcionalidades

- ✅ **Dashboard com 21 Cards Diários**: Um novo card é liberado a cada 24h às 00h
- ✅ **Autenticação por Token**: Acesso simples via URL (`?token=abc123`)
- ✅ **Fluxo de Conclusão Inteligente**: Pergunta sobre suposições com ramificações
- ✅ **Aba de Aprendizados**: Histórico cronológico de tudo que foi aprendido
- ✅ **Checkpoints**: Perguntas estruturadas nos dias 8, 15 e 21
- ✅ **Reforços Visuais**: Barra de progresso e mensagens motivacionais
- ✅ **Consentimento de Dados**: Modal com política de privacidade
- ✅ **Design Elegante**: Interface moderna e responsiva

## 🚀 Tecnologias

- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express + tRPC 11
- **Banco de Dados**: Supabase (MySQL/TiDB)
- **Hospedagem**: Vercel
- **Testes**: Vitest

## 📦 Instalação Local

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm db:push

# Rodar em desenvolvimento
pnpm dev

# Rodar testes
pnpm test

# Build para produção
pnpm build
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
DATABASE_URL=mysql://user:password@host:port/database?sslmode=require
VITE_FRONTEND_FORGE_API_URL=https://seu-supabase.supabase.co
VITE_FRONTEND_FORGE_API_KEY=sua-chave-anon
JWT_SECRET=seu-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=seu-app-id
OWNER_OPEN_ID=seu-owner-id
OWNER_NAME=Seu Nome
```

## 🧪 Criar Sessão de Teste

```bash
node scripts/create-test-session.mjs
```

Isso vai criar um usuário de teste com token e exibir a URL de acesso.

## 📊 Estrutura do Banco de Dados

- **users**: Usuários do sistema
- **sessions**: Sessões com tokens de acesso
- **dayProgress**: Progresso dos dias (concluído/não concluído)
- **learnings**: Aprendizados registrados por dia
- **checkpoints**: Respostas dos checkpoints (dias 8, 15, 21)
- **consents**: Consentimento para uso de dados

## 🎨 Design

- Paleta de cores elegante (azul e índigo)
- Gradientes suaves
- Animações fluidas
- Totalmente responsivo (mobile-first)
- Acessibilidade garantida

## 📈 Monetização

### MVP Gratuito (Fase 1)
- Jornada de 21 dias 100% grátis
- Objetivo: Validar ideia e ganhar usuários

### Versão Paga (Fase 2)
- Plano Premium: Múltiplas jornadas, comunidade privada
- Jornadas Temáticas: Versões especializadas
- Programa de Afiliados: 30% de comissão

## 🚀 Deploy no Vercel

1. Push seu código para GitHub
2. Vá em https://vercel.com/new
3. Importe o repositório
4. Adicione as variáveis de ambiente
5. Deploy!

## 📝 Scripts Disponíveis

- `pnpm dev`: Rodar em desenvolvimento
- `pnpm build`: Build para produção
- `pnpm start`: Rodar produção localmente
- `pnpm test`: Rodar testes
- `pnpm db:push`: Aplicar migrations
- `pnpm format`: Formatar código
- `pnpm check`: Verificar tipos TypeScript

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato através do formulário de suporte na plataforma.

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para transformar vidas em 21 dias**
