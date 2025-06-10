# ContaPago

Este repositório contém um protótipo simplificado do sistema **ContaPago**, um SaaS de gestão de boletos e contas a pagar.

A estrutura está dividida em dois diretórios principais:

- `backend/` – API em Node.js/Express escrita em TypeScript.
- `frontend/` – Aplicação web em Next.js com Material UI para os dashboards.

O objetivo é demonstrar a arquitetura básica, agora com uma API simples de cadastro de boletos e um painel web para visualização, edição e gráficos.

## Como rodar

1. Instale as dependências em `backend` e `frontend` com `npm install`.
2. Na pasta `backend`, execute `npm run dev` para iniciar a API em `localhost:3001`.
3. Na pasta `frontend`, execute `npm run dev` para iniciar a interface web em `localhost:3000`.

Você poderá cadastrar, listar, editar e remover boletos diretamente pelo painel. Os dados são salvos em `backend/data/boletos.json`.
Há também uma rota `GET /api/resumo` que retorna quantos boletos estão pendentes ou pagos e o total por mês.

Este projeto continua sendo um exemplo simples e pode ser expandido conforme a necessidade.
