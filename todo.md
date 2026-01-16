# Converse em 21 Dias - TODO

## Fase 1: Arquitetura e Banco de Dados
- [x] Definir schema do Supabase (users, sessions, days, learnings, checkpoints)
- [x] Criar migrations e tabelas
- [x] Implementar autenticação por token na URL

## Fase 2: Backend (API tRPC)
- [x] Criar procedures para autenticação por token
- [x] Implementar lógica de liberação de cards (baseada em data_atual - data_inicio)
- [x] Criar procedures para obter cards do dia
- [x] Implementar procedures para registrar conclusão de dia
- [x] Criar procedures para aprendizados
- [x] Implementar checkpoints (dias 8, 15, 21)
- [x] Criar procedures para consentimento de dados

## Fase 3: Frontend - Estrutura Base
- [x] Criar layout principal elegante
- [x] Implementar sistema de roteamento com token
- [x] Criar componente de dashboard
- [x] Implementar navegação entre abas (Dashboard / Aprendizados)

## Fase 4: Frontend - Dashboard e Cards
- [x] Criar componente de card diário
- [x] Implementar barra de progresso
- [x] Criar lógica de exibição de cards (desbloqueado/bloqueado)
- [x] Implementar fluxo de conclusão: pergunta "A suposição ocorreu?"
- [x] Criar fluxo SIM: aviso + opção de repetir
- [x] Criar fluxo NÃO: aprendizado pré-pronto + campo opcional + concluir
- [x] Implementar mensagens motivacionais (dias 3-5)

## Fase 5: Frontend - Aba de Aprendizados
- [x] Criar componente de lista de aprendizados
- [x] Implementar exibição cronológica
- [x] Adicionar apenas leitura sem edição

## Fase 6: Frontend - Checkpoints
- [x] Implementar checkpoint dia 8
- [x] Implementar checkpoint dia 15
- [x] Implementar checkpoint dia 21
- [x] Criar formulário com perguntas de checkpoint

## Fase 7: Frontend - Consentimento e Política
- [x] Criar modal/seção de consentimento
- [x] Implementar link para política de privacidade
- [x] Adicionar mensagem clara sobre uso de dados

## Fase 8: Estilo e UX
- [x] Definir paleta de cores elegante
- [x] Aplicar design system consistente
- [x] Implementar animações suaves
- [x] Otimizar responsividade mobile
- [x] Adicionar ícones e visual polish

## Fase 9: Testes e Deploy
- [x] Testes unitários (vitest)
- [x] Testes de integração
- [ ] Configurar Vercel deployment
- [ ] Testar com Supabase free tier
- [x] Validar lógica de liberação de cards
- [ ] Testar fluxo completo de usuário

## Dados dos 21 Dias
- [x] Estrutura de dados dos 21 dias fornecida no documento
