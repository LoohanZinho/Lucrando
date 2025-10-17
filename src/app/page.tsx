
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, BarChart3, Target, TrendingUp, Filter, Users, Package } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const features = [
  {
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    title: 'Dashboard Analítico',
    description: 'Visão completa com Receita, Lucro, ROI, e outras métricas chave para decisões inteligentes.',
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    title: 'Gráficos Interativos',
    description: 'Analise a tendência de lucro e o funil de conversão (Views > Cliques > Vendas) de forma visual.',
  },
  {
    icon: <Target className="h-6 w-6 text-primary" />,
    title: 'Gerenciamento de Posts',
    description: 'Cadastre cada campanha com detalhes de investimento, receita, e métricas de engajamento.',
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: 'Cadastro de Entidades',
    description: 'Gerencie facilmente seus Influenciadores e Produtos em um só lugar.',
  },
    {
    icon: <Filter className="h-6 w-6 text-primary" />,
    title: 'Filtragem Avançada',
    description: 'Filtre os dados do dashboard por período, influenciador, produto ou postagem específica.',
  },
    {
    icon: <Package className="h-6 w-6 text-primary" />,
    title: 'Acesso Simplificado',
    description: 'Plataforma PWA, instale em seu celular e computador como um aplicativo nativo.',
  },
];

const plans = [
  {
    name: 'Plano Mensal',
    price: '97,00',
    period: 'mês',
    features: [
      'Acesso a todas as funcionalidades',
      'Dashboard analítico completo',
      'Gerenciamento ilimitado',
      'Suporte via e-mail',
    ],
    cta: 'Assinar Agora',
  },
  {
    name: 'Plano Trimestral',
    price: '197,00',
    period: 'trimestre',
    features: [
      'Tudo do plano Mensal',
      'Desconto de 32%',
      'Prioridade no suporte',
      'Acesso a novas funcionalidades',
    ],
    cta: 'Assinar Agora',
    recommended: true,
  },
  {
    name: 'Plano Anual',
    price: '797,00',
    period: 'ano',
    features: [
      'Tudo do plano Trimestral',
      'Desconto de 31%',
      '2 meses grátis',
      'Consultoria inicial de 30 min',
    ],
    cta: 'Assinar Agora',
  },
];

const faqs = [
  {
    question: 'Como funciona o acesso após o pagamento?',
    answer: 'Após a confirmação do pagamento, você receberá um e-mail com suas credenciais de acesso (login e senha) e o link para a plataforma. O acesso é imediato!',
  },
  {
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. Você continuará com acesso à plataforma até o final do período já pago.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos as principais formas de pagamento, incluindo cartão de crédito, PIX e boleto bancário, através de nossa plataforma de pagamento segura.',
  },
  {
    question: 'Os meus dados estão seguros?',
    answer: 'Sim. A segurança dos seus dados é nossa prioridade. Utilizamos as melhores práticas e tecnologias de segurança para garantir que suas informações estejam sempre protegidas.',
  },
];

export default function SalesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="https://i.imgur.com/bgXDxQU.png" alt="LCI Logo" width={32} height={32} />
            <span className="text-xl font-bold text-primary">LCI HUB</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="#pricing">Assinar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 text-center md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Transforme Dados de Influencers em <span className="text-primary">Lucro Real</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                O LCI HUB é o dashboard analítico que centraliza suas campanhas de marketing de influência, permitindo que você tome decisões mais inteligentes e maximize seu ROI.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="#pricing">
                    Ver Planos <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/50 py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tudo que você precisa para lucrar com influencers</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Deixe as planilhas no passado. Tenha uma visão clara e profissional de suas campanhas.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-start gap-4 rounded-lg bg-background p-6 shadow-sm">
                  {feature.icon}
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Planos flexíveis para o seu sucesso</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Escolha o plano que melhor se adapta ao seu momento e comece a otimizar seus resultados hoje mesmo.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.name} className={`flex flex-col ${plan.recommended ? 'border-primary border-2 shadow-xl' : ''}`}>
                  {plan.recommended && (
                    <div className="bg-primary px-4 py-1 text-center text-sm font-semibold text-primary-foreground">
                      MAIS POPULAR
                    </div>
                  )}
                  <CardHeader className="items-center text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tighter">R$ {plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="lg" variant={plan.recommended ? 'default' : 'outline'}>
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-muted/50 py-20 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Perguntas Frequentes</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Ainda tem dúvidas? Aqui estão as respostas para as perguntas mais comuns.
                </p>
                </div>
                <div className="mt-12 mx-auto max-w-3xl">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
          <div className="flex items-center gap-2">
             <Image src="https://i.imgur.com/bgXDxQU.png" alt="LCI Logo" width={24} height={24} />
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} LCI HUB. Todos os direitos reservados.</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="mailto:lucrandolcihub@gmail.com" className="hover:text-primary">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
