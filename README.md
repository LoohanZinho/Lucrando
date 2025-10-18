
# LCI HUB - Lucrando com Influenciadores

<p align="center">
  <img src="https://i.imgur.com/bgXDxQU.png" alt="LCI HUB Logo" width="120">
</p>

<p align="center">
  <strong>Transforme dados de marketing de influência em lucro real.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Firebase-11.x-orange?style=for-the-badge&logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-blue?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
</p>

---

## 🚀 Sobre o Projeto

O **LCI HUB** é um dashboard analítico completo, projetado para ajudar agências e gestores a gerenciar e otimizar campanhas de marketing de influência. A plataforma centraliza o cadastro de influenciadores e produtos, além do registro detalhado de cada postagem (campanha), incluindo métricas de investimento, receita, engajamento e vendas.

Com uma visão clara do desempenho através de gráficos e KPIs (Indicadores Chave de Performance), os usuários podem tomar decisões mais inteligentes, maximizar o lucro e entender o retorno sobre cada investimento (ROI) de forma simples e visual.

## ✨ Funcionalidades Principais

-   **Dashboard Analítico:** Visão geral da performance com métricas essenciais como Receita, Despesas, Lucro e ROI.
-   **KPIs Avançados:** Análise de ROAS (Retorno sobre Investimento em Ads), Taxa de Conversão e Ticket Médio.
-   **Gráficos Interativos:**
    -   **Tendência de Lucro:** Acompanhe a evolução do lucro ao longo do tempo.
    -   **Funil de Conversão:** Visualize a jornada do usuário desde as `Views` até as `Vendas`.
-   **Gerenciamento de Posts:** Cadastro detalhado de cada campanha, vinculando influenciadores, produtos e todas as métricas financeiras e de engajamento.
-   **Calendário de Conteúdo:** Visualize todas as publicações em um calendário interativo com resumos diários de performance.
-   **Gerenciamento de Entidades:** Cadastre e gerencie facilmente seus `Influenciadores` e `Produtos`.
-   **Filtragem Avançada:** Filtre os dados do dashboard por período (hoje, últimos 7 dias, mês, customizado, etc.), influenciador, produto ou postagem específica.
-   **Autenticação Segura:** Sistema de login e gerenciamento de perfil para cada usuário.
-   **Painel de Administração:** Área restrita para gerenciamento de usuários e configurações da aplicação.
-   **Design Responsivo & PWA:** Experiência otimizada para desktop e dispositivos móveis, com a possibilidade de instalar o app na tela inicial.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna e robusta, focada em performance e experiência do desenvolvedor:

-   **Framework:** [Next.js](https://nextjs.org/) (com App Router)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **Backend e Banco de Dados:** [Firebase](https://firebase.google.com/) (Firestore e Authentication)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI:** [ShadCN/UI](https://ui.shadcn.com/)
-   **Gráficos:** [Recharts](https://recharts.org/)
-   **Validação de Formulários:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **Progressive Web App (PWA):** [@ducanh2912/next-pwa](https://github.com/DuCanh2912/next-pwa)

## 🏁 Como Começar

Para executar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/lci-hub.git
cd lci-hub
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Firebase

Para que o aplicativo se conecte ao Firebase, você precisa de um projeto Firebase e das suas chaves de configuração.

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
2.  Dentro do seu projeto, vá para **Configurações do Projeto** (ícone de engrenagem).
3.  Na aba **Geral**, desça até "Seus apps" e crie um novo **Aplicativo da Web** (ícone `</>`).
4.  Copie o objeto `firebaseConfig` que será exibido.
5.  No seu projeto, crie um arquivo chamado `.env.local` na raiz do projeto.
6.  Preencha o arquivo `.env.local` com as chaves que você copiou do Firebase:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id
    ```

7.  A lógica de autenticação e banco de dados deste projeto é customizada e não utiliza os provedores padrão do Firebase Auth. A gestão de usuários é feita através da coleção `users` no Firestore. Para mais detalhes, consulte o arquivo `src/contexts/auth-context.tsx`.

### 4. Rode o Projeto

Agora você pode iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver o aplicativo funcionando.

## 📜 Scripts Disponíveis

-   `npm run dev`: Inicia o servidor de desenvolvimento.
-   `npm run build`: Compila o aplicativo para produção.
-   `npm run start`: Inicia um servidor de produção após o build.
-   `npm run lint`: Executa o linter para verificar a qualidade do código.
-   `npm run typecheck`: Realiza a verificação de tipos com TypeScript.
