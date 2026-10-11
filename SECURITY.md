# Segurança

## O que o projeto já faz
- **Senhas**: hash com bcrypt (custo 12); mínimo de 8 e máximo de 72 caracteres.
- **Login**: mensagem genérica ("e-mail ou senha inválidos") e tempo de resposta igual com ou sem conta (evita enumerar usuários); limite de 10 tentativas / 15 min por IP.
- **Tokens**: access token JWT curto (15 min, HS256 fixado na verificação) + refresh token opaco, guardado só como hash SHA-256 no banco, com rotação e revogação.
- **API**: Helmet (cabeçalhos de segurança), CORS restrito a `CORS_ORIGIN`, limite de 100 KB no body, rate limit geral, erros internos nunca vazam detalhes ao cliente.
- **Dados**: toda consulta é filtrada pelo `userId` do token; campos de entrada passam por whitelist (`pickFields`) e validação; Prisma usa consultas parametrizadas (sem SQL concatenado).
- **Configuração**: o servidor recusa subir sem `DATABASE_URL`/`JWT_SECRET` e, em produção, com segredo fraco ou sem `CORS_ORIGIN`.
- **Segredos**: `.env` fora do Git (`.gitignore`); só os `*.env.example`, sem valores reais, são versionados. Banco local escuta só em `127.0.0.1`.

## Limitações conhecidas (pra evoluir)
- Os tokens ficam em `localStorage` (padrão simples de SPA, exposto se houver XSS). O React escapa todo texto e o projeto não usa `dangerouslySetInnerHTML`; o passo seguinte seria cookie `HttpOnly` para o refresh token.
- Sem verificação de e-mail nem recuperação de senha.
- Sem HTTPS local; em produção, terminar TLS no CloudFront/ALB.

## Checklist antes de publicar no GitHub
1. `git status` e confirme que **nenhum** `.env` aparece.
2. Se algum segredo (senha, chave da Anthropic, chave AWS) já foi commitado alguma vez: **revogue/troque o segredo** - apagar o arquivo depois não remove do histórico.
3. Ative no repositório: Settings → Code security → Secret scanning + Push protection, Dependabot alerts.
4. Proteja a branch `main` (exigir PR e CI verde) quando o GitHub Actions existir.
5. Rode `npm audit` em `backend` e `frontend` de vez em quando.

## Reportar uma vulnerabilidade
Abra uma issue privada (Security → Report a vulnerability) no repositório.
