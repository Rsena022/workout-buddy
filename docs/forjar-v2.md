# Forjar v2 — contas, acesso e acompanhamento

## Objetivo

Transformar o gerador atual em uma plataforma de treino com conta, histórico e progressão, mantendo o acesso condicionado à situação real da compra na Cakto.

## Fluxo de acesso

1. A Cakto confirma a compra e envia `purchase_approved` ao endpoint `/api/webhooks/cakto`.
2. O servidor valida o segredo, registra o evento de modo idempotente e cria um direito de acesso para o e-mail da compra.
3. O cliente recebe o link de acesso configurado na Cakto e entra com o mesmo e-mail utilizado no checkout.
4. Ao criar a conta, um gatilho associa automaticamente compras anteriores daquele e-mail.
5. Todas as leituras e gravações privadas usam o usuário autenticado e Row Level Security.
6. Eventos `refund` e `chargeback` revogam o direito de acesso. A conta continua existindo, mas as áreas pagas ficam bloqueadas.

## Limites de segurança

- A chave secreta do Supabase e o segredo da Cakto existem somente no servidor.
- A interface pode redirecionar usuários sem acesso, mas a proteção real é aplicada no banco e nos endpoints.
- O webhook precisa ser idempotente para que reenvios não dupliquem compras nem revogações.
- O corpo original de cada webhook é armazenado para auditoria, sem ser exposto ao navegador.

## Modelo funcional

- `profiles`: perfil e respostas que realmente influenciam o treino.
- `entitlements`: compra e situação do acesso (`active`, `refunded`, `chargeback`, `revoked`).
- `workout_plans`: versões dos planos gerados.
- `workout_sessions`: início, conclusão e observações de cada treino.
- `workout_set_logs`: carga, repetições e esforço de cada série.
- `support_feedback`: dificuldade, satisfação e pedidos de ajuda.
- `webhook_events`: auditoria e idempotência da integração.

## Evolução do treino

Cada exercício passa a ter faixa de repetições, RIR alvo, aquecimento, cadência, orientação técnica e uma regra de progressão. Ao concluir uma sessão, o sistema compara as séries realizadas com a meta e sugere manter ou aumentar a carga na próxima sessão.

## Migração

No primeiro login, dados válidos do `localStorage` podem ser importados uma única vez para a conta. O navegador deixa de ser a fonte principal, mas continua servindo como cache para funcionamento resiliente.

