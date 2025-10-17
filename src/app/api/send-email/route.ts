
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { type User } from '@/lib/data-types';

const ADMIN_PASSWORD = process.env.ADMIN_AUTH_PASSWORD || "iamgestor";
const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:9002/login';

const appBenefits = `
    <ul style="padding-left: 20px;">
        <li><strong>Dashboard Analítico:</strong> Visão completa com Receita, Lucro, ROI e mais.</li>
        <li><strong>Gráficos Interativos:</strong> Análise de tendência de lucro e funil de conversão.</li>
        <li><strong>Gerenciamento de Posts:</strong> Cadastro detalhado de cada campanha.</li>
        <li><strong>Cadastro de Entidades:</strong> Gerencie seus Influenciadores e Produtos.</li>
        <li><strong>Filtragem Avançada:</strong> Filtre os dados por período, influenciador ou produto.</li>
    </ul>
`;

function getWelcomeEmailHtml(customerName: string, customerEmail: string, password?: string): string {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Bem-vindo ao LCI HUB!</h2>
            <p>Olá, ${customerName}!</p>
            <p>Seu acesso à plataforma está liberado!</p>
            <h3>Suas credenciais de acesso:</h3>
            <ul>
                <li><strong>Email:</strong> ${customerEmail}</li>
                <li><strong>Senha:</strong> ${password || 'sua senha cadastrada'}</li>
            </ul>
            <p>Você pode acessar a plataforma através do link abaixo:</p>
            <a href="${LOGIN_URL}" style="background-color: #facc15; color: #1f2937; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Acessar Plataforma</a>
            <p style="margin-top: 20px;">Explore alguns dos benefícios que você tem acesso:</p>
            ${appBenefits}
            <p style="margin-top: 20px; font-size: 0.9em; color: #555;">Recomendamos que você altere sua senha no primeiro acesso, caso uma senha padrão tenha sido fornecida.</p>
        </div>
    `;
}

function getRenewalEmailHtml(customerName: string): string {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Pagamento Confirmado!</h2>
            <p>Olá, ${customerName}!</p>
            <p>Sua assinatura foi renovada com sucesso. Obrigado por continuar conosco!</p>
            <h3>Continue aproveitando todos os benefícios:</h3>
            ${appBenefits}
            <p>Acesse a plataforma a qualquer momento para gerenciar suas campanhas:</p>
            <a href="${LOGIN_URL}" style="background-color: #facc15; color: #1f2937; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Acessar Plataforma</a>
        </div>
    `;
}

async function sendEmail(mailOptions: nodemailer.SendMailOptions): Promise<boolean> {
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

    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso para:', mailOptions.to);
        return true;
    } catch (error) {
        console.error(`Falha ao enviar e-mail para ${mailOptions.to}:`, error);
        return false;
    }
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { adminPassword, user, emailType, subject, message } = body as {
            adminPassword?: string;
            user: User;
            emailType: 'welcome' | 'renewal' | 'custom';
            subject?: string;
            message?: string;
        };

        // Authenticate admin
        if (adminPassword !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        if (!user || !user.email || !user.displayName) {
            return NextResponse.json({ error: "Dados do usuário ausentes" }, { status: 400 });
        }

        let mailOptions: nodemailer.SendMailOptions;

        switch (emailType) {
            case 'welcome':
                mailOptions = {
                    from: `"LCI HUB" <${GMAIL_EMAIL}>`,
                    to: user.email,
                    subject: 'Bem-vindo ao LCI HUB - Suas credenciais de acesso',
                    html: getWelcomeEmailHtml(user.displayName, user.email, user.password),
                };
                break;

            case 'renewal':
                mailOptions = {
                    from: `"LCI HUB" <${GMAIL_EMAIL}>`,
                    to: user.email,
                    subject: 'Sua assinatura foi renovada!',
                    html: getRenewalEmailHtml(user.displayName),
                };
                break;
            
            case 'custom':
                if (!subject || !message) {
                    return NextResponse.json({ error: "Assunto e mensagem são obrigatórios para e-mail personalizado." }, { status: 400 });
                }
                mailOptions = {
                    from: `"LCI HUB" <${GMAIL_EMAIL}>`,
                    to: user.email,
                    subject: subject,
                    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${message}</div>`,
                };
                break;
            
            default:
                return NextResponse.json({ error: "Tipo de e-mail inválido" }, { status: 400 });
        }
        
        const success = await sendEmail(mailOptions);

        if (success) {
            return NextResponse.json({ message: "E-mail enviado com sucesso" }, { status: 200 });
        } else {
            return NextResponse.json({ error: "Falha ao enviar e-mail" }, { status: 500 });
        }

    } catch (error) {
        console.error("Erro ao processar a solicitação de envio de e-mail:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Ocorreu um erro desconhecido" }, { status: 500 });
    }
}

    