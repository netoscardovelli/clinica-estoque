# clinica-estoque

Sistema de controle de estoque para clínica médica desenvolvido em React com integração ao Supabase.

## Funcionalidades

- Dashboard com estatísticas em tempo real
- Gestão completa de produtos (CRUD)
- Alertas automáticos
- Filtros e busca avançados
- Interface responsiva
- Integração com Supabase

## Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd clinica-estoque

# Instalar dependências
npm install
```

Crie um arquivo `.env` a partir de `.env.example` preenchendo `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_KEY`.

Para implantar no Vercel, defina essas mesmas variáveis de ambiente no painel do projeto. Opcionalmente, utilize o arquivo `vercel.json` já incluso para configurar a pasta de saída `build/`.

```bash
# Iniciar a aplicação
npm start
```

## Build de produção

Para gerar uma versão otimizada do projeto, execute:

```bash
npm run build
```

## Licença

Distribuído sob a licença [MIT](LICENSE).
