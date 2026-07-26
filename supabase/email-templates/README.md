# E-mails do Supabase

## Confirmação de cadastro

- Assunto: `Confirme seu acesso ao Forjar`
- Modelo: `confirm-signup.html`
- Redirecionamento esperado: `https://forjar-treino-personalizado.vercel.app/login?confirmed=1`

O modelo usa `{{ .ConfirmationURL }}`, variável oficial do Supabase que contém o link único de
confirmação do usuário.
