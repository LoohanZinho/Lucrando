
# LCI - Lucrando com Influenciadores

## 🚀 Sobre o Projeto

O **LCI** é um dashboard analítico completo, projetado para ajudar usuários a gerenciar e otimizar campanhas de marketing de influência. A plataforma permite o cadastro de influenciadores, produtos e sócios, além do registro detalhado de cada postagem (campanha), incluindo métricas de investimento, receita, engajamento e vendas.

Com uma visão clara do desempenho através de gráficos e KPIs (Indicadores Chave de Performance), os usuários podem tomar decisões mais inteligentes, maximizar o lucro e entender o retorno sobre cada investimento (ROI) de forma simples e visual.

## ✨ Funcionalidades Principais

- **Dashboard Analítico:** Visão geral da performance com métricas como Receita, Lucro, ROI, ROAS, CPA e Ticket Médio.
- **Gráficos Interativos:** Análise de tendência de lucro e funil de conversão (Views > Cliques > Visitas > Vendas).
- **Gerenciamento de Posts:** Cadastro detalhado de cada campanha, com métricas financeiras e de engajamento.
- **Cadastro de Entidades:** Gerencie facilmente seus Influenciadores, Produtos e Sócios.
- **Cálculo de Comissão:** Suporte para divisão de lucros com sócios, com base em porcentagem ou valor fixo.
- **Filtragem Avançada:** Filtre os dados do dashboard por período, influenciador, produto ou postagem específica.
- **Design Responsivo:** Experiência otimizada para desktop e dispositivos móveis.
- **Autenticação Segura:** Sistema de login e criação de conta com Firebase Auth.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna e robusta, focada em performance e experiência do desenvolvedor:

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [ShadCN/UI](https://ui.shadcn.com/)
- **Backend e Banco de Dados:** [Firebase](https://firebase.google.com/) (Firestore e Authentication)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Validação de Formulários:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Hospedagem:** [Netlify](https://www.netlify.com/)

## 🏁 Como Começar

Para executar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
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
5.  No seu projeto, renomeie o arquivo `.env.example` para `.env.local`.
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

7.  No Firebase Console, vá para a seção **Authentication** e ative o provedor de **Email/Senha**.

### 4. Rode o Projeto

Agora você pode iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver o aplicativo funcionando.

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento com Next.js e Turbopack.
- `npm run build`: Compila o aplicativo para produção.
- `npm run start`: Inicia um servidor de produção após o build.
- `npm run lint`: Executa o linter para verificar a qualidade do código.

