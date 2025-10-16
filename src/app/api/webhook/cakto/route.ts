
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, updateDoc, addDoc, Timestamp, doc } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { add } from 'date-fns';
import nodemailer from 'nodemailer';

const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET;
const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:9002/login';

const appBenefits = `
    <ul style="padding-left: 20px;">
        <li><strong>Dashboard Analítico:</strong> Visão completa com Receita, Lucro, ROI e mais.</li>
        <li><strong>Gráficos Interativos:</strong> Análise de tendência de lucro e funil de conversão.</li>
        <li><strong>Gerenciamento de Posts:</strong> Cadastro detalhado de cada campanha.</li>
        <li><strong>Cadastro de Entidades:</strong> Gerencie seus Influenciadores e Produtos.</li>
        <li>
<strong>Filtragem Avançada:</strong> Filtre os dados por período, influenciador ou produto.</li>
    </ul>
`;


async function sendWelcomeEmail(customerName: string, customerEmail: string, password: string): Promise<boolean> {
    if (!GMAIL_EMAIL || !GMAIL_APP_PASSWORD) {
        console.error("As credenciais do Gmail não estão configuradas nas variáveis de ambiente.");
        return false;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_EMAIL,
            pass: GMAIL_APP_PASSWORD,
        },
    });

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Bem-vindo ao LCI HUB!</h2>
            <p>Olá, ${customerName}!</p>
            <p>Seu pagamento foi confirmado e seu acesso à plataforma foi liberado!</p>
            <h3>Suas credenciais de acesso:</h3>
            <ul>
                <li><strong>Email:</strong> ${customerEmail}</li>
                <li><strong>Senha:</strong> ${password}</li>
            </ul>
            <p>Você pode acessar a plataforma através do link abaixo:</p>
            <a href="${LOGIN_URL}" style="background-color: #facc15; color: #1f2937; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Acessar Plataforma</a>
            <p style="margin-top: 20px;">Explore alguns dos benefícios que você tem acesso:</p>
            ${appBenefits}
            <p style="margin-top: 20px; font-size: 0.9em; color: #555;">Recomendamos que você altere sua senha no primeiro acesso.</p>
        </div>
    `;

    const mailOptions = {
        from: `"LCI HUB" <${GMAIL_EMAIL}>`,
        to: customerEmail,
        subject: 'Bem-vindo ao LCI HUB - Suas credenciais de acesso',
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de boas-vindas enviado com sucesso para:', customerEmail);
        return true;
    } catch (error) {
        console.error(`Falha ao enviar email de boas-vindas para ${customerEmail}:`, error);
        return false;
    }
}

async function sendRenewalEmail(customerName: string, customerEmail: string): Promise<boolean> {
    if (!GMAIL_EMAIL || !GMAIL_APP_PASSWORD) {
        console.error("As credenciais do Gmail não estão configuradas.");
        return false;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_EMAIL,
            pass: GMAIL_APP_PASSWORD,
        },
    });

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Pagamento Confirmado!</h2>
            <p>Olá, ${customerName}!</p>
            <p>Recebemos o seu pagamento e sua assinatura foi renovada com sucesso. Obrigado por continuar conosco!</p>
            <h3>Continue aproveitando todos os benefícios:</h3>
            ${appBenefits}
            <p>Acesse a plataforma a qualquer momento para gerenciar suas campanhas:</p>
            <a href="${LOGIN_URL}" style="background-color: #facc15; color: #1f2937; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Acessar Plataforma</a>
        </div>
    `;

    const mailOptions = {
        from: `"LCI HUB" <${GMAIL_EMAIL}>`,
        to: customerEmail,
        subject: 'Recebemos o seu pagamento!',
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de renovação enviado com sucesso para:', customerEmail);
        return true;
    } catch (error) {
        console.error(`Falha ao enviar email de renovação para ${customerEmail}:`, error);
        return false;
    }
}


export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("Payload do webhook recebido:", payload);


    if (!CAKTO_WEBHOOK_SECRET) {
      console.error("O segredo do webhook (CAKTO_WEBHOOK_SECRET) não está configurado nas variáveis de ambiente.");
      return NextResponse.json({ error: "O segredo do webhook não está configurado." }, { status: 500 });
    }
    
    if (payload.secret !== CAKTO_WEBHOOK_SECRET) {
      console.warn("Segredo do webhook não corresponde.");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (payload.event !== 'charge_paid') {
      return NextResponse.json({ message: `Evento ${payload.event} recebido, mas não processado.` }, { status: 200 });
    }
    
    const { data } = payload;
    const customerEmail = data?.customer?.email;
    const customerName = data?.customer?.name;
    const paidAt = data?.paidAt;

    if (!customerEmail || !paidAt || !customerName) {
      return NextResponse.json({ error: "Nome, email do cliente ou data de pagamento ausentes" }, { status: 400 });
    }

    const usersCol = collection(db, 'users');
    const q = query(usersCol, where("email", "==", customerEmail));
    const querySnapshot = await getDocs(q);

    const paidAtDate = new Date(paidAt);
    
    if (querySnapshot.empty) {
      // User does not exist, create a new one
      const defaultPassword = "123456";
      const subscriptionExpiresAt = add(paidAtDate, { days: 30 });
      const newUserDoc = {
        displayName: customerName,
        email: customerEmail,
        password: defaultPassword,
        photoURL: '',
        paidAt: Timestamp.fromDate(paidAtDate),
        subscriptionExpiresAt: Timestamp.fromDate(subscriptionExpiresAt),
      };
      await addDoc(usersCol, newUserDoc);
      console.log('Usuário criado com sucesso:', customerName);
      
      console.log('Enviando email de boas-vindas para o usuário:', customerName, customerEmail);
      await sendWelcomeEmail(customerName, customerEmail, defaultPassword);

    } else {
      // User exists, update subscription
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userRef = doc(db, 'users', userDoc.id);

      let newExpirationDate;
      const currentExpiration = userData.subscriptionExpiresAt ? (userData.subscriptionExpiresAt as Timestamp).toDate() : null;

      // If current subscription is still active, add 30 days to it. Otherwise, add 30 days from now.
      if (currentExpiration && currentExpiration > new Date()) {
        newExpirationDate = add(currentExpiration, { days: 30 });
      } else {
        newExpirationDate = add(paidAtDate, { days: 30 });
      }

      await updateDoc(userRef, {
        paidAt: Timestamp.fromDate(paidAtDate),
        subscriptionExpiresAt: Timestamp.fromDate(newExpirationDate),
      });
      console.log(`Assinatura atualizada para o usuário existente: ${customerEmail}. Nova data de expiração: ${newExpirationDate}`);
      
      console.log('Enviando email de renovação para o usuário:', customerName, customerEmail);
      await sendRenewalEmail(customerName, customerEmail);
    }

    return NextResponse.json({ message: "Webhook processado com sucesso" }, { status: 200 });

  } catch (error) {
    console.error("Erro ao processar o webhook:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Ocorreu um erro desconhecido" }, { status: 500 });
  }
}
