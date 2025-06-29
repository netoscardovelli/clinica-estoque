# clinica-estoque

Este projeto é uma aplicação React para gestão de estoque de uma clínica.

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Defina as variáveis de ambiente em um arquivo `.env.local` na raiz:
   ```
   REACT_APP_SUPABASE_URL=<sua_url>
   REACT_APP_SUPABASE_KEY=<sua_chave>
   ```

3. Execute em modo desenvolvimento:
   ```bash
   npm start
   ```

## Relatórios

As funções de relatório estão em `src/reports/` e podem ser importadas para gerar informações sobre aplicações, estoque e pacientes.
