"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileBarChart2,
  Search,
  Settings,
  Shield,
  Star,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Step {
  title: string;
  body: string;
}

interface Faq {
  q: string;
  a: string;
}

interface Topic {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  steps: Step[];
  faqs: Faq[];
}

const topics: Topic[] = [
  {
    id: "relatorios",
    icon: FileBarChart2,
    title: "Relatórios",
    summary: "Encontre e visualize seus relatórios do Power BI",
    steps: [
      {
        title: "Abra Minhas contas",
        body: 'No menu lateral, encontre a seção "Minhas contas". Cada conta representa um ambiente do Power BI ao qual você tem acesso.',
      },
      {
        title: "Expanda uma conta",
        body: "Clique no nome da conta para ver os workspaces disponíveis. O sistema lembra quais contas você deixou abertas e mantém o estado entre navegações.",
      },
      {
        title: "Escolha um workspace",
        body: "Selecione o workspace desejado. Os workspaces agrupam relatórios por projeto, equipe ou tema.",
      },
      {
        title: "Abra um relatório",
        body: "Clique no relatório para abri-lo. O Power BI carrega o dashboard diretamente no navegador, com todas as suas interações habituais — filtros, drill-down e exportação por visual.",
      },
    ],
    faqs: [
      {
        q: "Por que alguns relatórios não aparecem para mim?",
        a: "O acesso a cada relatório é controlado por grupos de permissão. Se um relatório não aparece, peça ao gestor da sua conta para incluir você no grupo correto.",
      },
      {
        q: "O relatório abriu em branco ou com erro. O que fazer?",
        a: "Em geral, o token do Power BI expirou. Recarregue a página — o sistema gera um novo token automaticamente. Se o problema continuar, faça logout e entre novamente.",
      },
      {
        q: "Posso baixar o relatório completo?",
        a: "Não pelo painel. O download é feito visual por visual, usando a opção de exportação dentro do próprio relatório do Power BI.",
      },
    ],
  },
  {
    id: "favoritos",
    icon: Star,
    title: "Favoritos",
    summary: "Marque os relatórios que você mais usa",
    steps: [
      {
        title: "Abra o relatório desejado",
        body: "Navegue até o relatório que você acessa com frequência.",
      },
      {
        title: "Marque como favorito",
        body: "Clique no ícone de estrela ao lado do título. A estrela preenchida indica que o relatório está nos seus favoritos.",
      },
      {
        title: "Acesso rápido pelo Início",
        body: 'Os favoritos aparecem na tela "Início" para acesso direto, sem precisar navegar pelas contas e workspaces.',
      },
    ],
    faqs: [
      {
        q: "Outros usuários veem os meus favoritos?",
        a: "Não. Favoritos são individuais — cada usuário tem sua própria lista.",
      },
      {
        q: "O que acontece se eu perder acesso a um relatório favorito?",
        a: "Ele deixa de aparecer na lista automaticamente. Quando o acesso for restaurado, o favorito volta a aparecer.",
      },
    ],
  },
  {
    id: "notificacoes",
    icon: Bell,
    title: "Notificações",
    summary: "Receba alertas e comunicados em tempo real",
    steps: [
      {
        title: "Veja o sino no topo do menu",
        body: "O ícone de sino mostra um indicador quando há notificações novas. As mensagens chegam em tempo real, sem precisar atualizar a página.",
      },
      {
        title: "Abra a lista",
        body: "Clique no sino para ver as notificações recentes — atualizações de relatórios, comunicados internos e alertas do sistema.",
      },
      {
        title: "Comunicados em massa",
        body: 'Gestores podem enviar comunicados para todos os usuários usando o botão "Megafone" ao lado do sino.',
      },
    ],
    faqs: [
      {
        q: "Não estou recebendo notificações. O que verificar?",
        a: "Verifique se a aba do navegador continua aberta — a conexão em tempo real é mantida enquanto a página estiver ativa. Se travou, recarregue.",
      },
      {
        q: "Posso silenciar notificações?",
        a: "Hoje não há silenciamento por tipo. Apenas comunicados em massa enviados por gestores chegam a todos os usuários.",
      },
    ],
  },
  {
    id: "configuracoes",
    icon: Settings,
    title: "Conta e configurações",
    summary: "Atualize seu perfil, senha e veja suas permissões",
    steps: [
      {
        title: "Acesse Configurações",
        body: 'No menu lateral, clique em "Configurações" para abrir as opções da sua conta.',
      },
      {
        title: "Perfil",
        body: "Em Perfil, atualize seu nome e altere sua senha. Use uma senha forte — letras, números e caracteres especiais.",
      },
      {
        title: "Permissões",
        body: "A seção Permissões mostra a quais grupos você pertence e quais relatórios o seu perfil libera. Útil para entender por que um relatório está ou não disponível.",
      },
    ],
    faqs: [
      {
        q: "Esqueci minha senha. Como recupero?",
        a: 'Na tela de login, use a opção "Esqueci minha senha". Você receberá um e-mail com instruções para criar uma nova senha.',
      },
      {
        q: "Por quanto tempo a sessão fica ativa?",
        a: "A sessão dura o tempo de validade do token de acesso. Quando expira, o sistema redireciona para o login. Um aviso aparece 5 minutos antes da expiração para você salvar o que estiver fazendo.",
      },
      {
        q: "Posso usar a busca rápida?",
        a: "Sim. Pressione ⌘K (Mac) ou Ctrl+K (Windows/Linux) em qualquer tela para abrir a busca global e pular direto para relatórios, contas ou configurações.",
      },
    ],
  },
  {
    id: "administracao",
    icon: Shield,
    title: "Administração",
    summary: "Recursos para gestores e administradores",
    steps: [
      {
        title: "Contas (Power BI)",
        body: "Cadastre e mantenha as contas do Power BI integradas via Azure AD. Cada conta corresponde a um tenant — uma organização ou ambiente.",
      },
      {
        title: "Grupos e usuários",
        body: "Crie grupos de permissão, vincule relatórios a grupos e adicione usuários aos grupos certos. O acesso aos relatórios é todo controlado por aqui.",
      },
      {
        title: "Filtros e mapas",
        body: "Configure filtros row-level por relatório para limitar quais linhas cada grupo enxerga. Faça upload de mapas geográficos personalizados para visuais do tipo mapa.",
      },
      {
        title: "Relatórios customizados",
        body: "Sobrescreva metadados de relatórios — título, descrição, ícone — sem alterar o original no Power BI.",
      },
      {
        title: "Auditoria de logins",
        body: "Acompanhe o histórico de logins por usuário em Login Log para auditoria e segurança.",
      },
    ],
    faqs: [
      {
        q: "Adicionei um relatório novo no Power BI. Como faço ele aparecer aqui?",
        a: "Na lista de relatórios, use a opção de sincronização. O sistema busca os relatórios atualizados do Power BI e os cadastra automaticamente.",
      },
      {
        q: "Como dou acesso a um usuário a um relatório novo?",
        a: "Inclua o relatório no grupo de permissão correto e adicione o usuário a esse grupo. O acesso é refletido imediatamente — sem precisar reentrar.",
      },
      {
        q: "Quem pode ver Administração?",
        a: "Apenas usuários com perfil de gestor ou administrador. Usuários comuns não veem essas opções no menu.",
      },
    ],
  },
];

function StepItem({ number, title, body }: { number: number; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {number}
      </div>
      <div className="pt-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground">{a}</p>}
    </div>
  );
}

function TopicSection({ topic, visible }: { topic: Topic; visible: boolean }) {
  if (!visible) return null;
  const Icon = topic.icon;

  return (
    <section id={topic.id} className="scroll-mt-4">
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-5 py-4">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-base font-semibold text-foreground">{topic.title}</h2>
          <p className="text-sm text-muted-foreground">{topic.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Passo a passo
          </p>
          <div className="space-y-4">
            {topic.steps.map((step, i) => (
              <StepItem key={i} number={i + 1} title={step.title} body={step.body} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Perguntas frequentes
          </p>
          <div>
            {topic.faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AjudaPage() {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const isVisible = (topic: Topic) => {
    if (!query) return true;
    const haystack = [
      topic.title,
      topic.summary,
      ...topic.steps.map((s) => `${s.title} ${s.body}`),
      ...topic.faqs.map((f) => `${f.q} ${f.a}`),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  };

  const visibleTopics = topics.filter(isVisible);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Central de Ajuda</h1>
        <p className="text-sm text-muted-foreground">
          Guias e respostas para usar o painel de Business Intelligence com facilidade.
        </p>
      </header>

      <div className="mb-8 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por dúvida ou funcionalidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          aria-label="Buscar na ajuda"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Limpar
          </button>
        )}
      </div>

      {!query && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <a
                key={topic.id}
                href={`#${topic.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-medium text-foreground">{topic.title}</span>
              </a>
            );
          })}
        </div>
      )}

      {visibleTopics.length > 0 ? (
        <div className="space-y-10">
          {topics.map((topic) => (
            <TopicSection key={topic.id} topic={topic} visible={isVisible(topic)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum resultado para <span className="font-medium text-foreground">&ldquo;{search}&rdquo;</span>.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-sm text-primary hover:underline"
          >
            Ver todos os tópicos
          </button>
        </div>
      )}

      <div className="mt-12 flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">Ainda com dúvidas?</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Use a busca rápida com <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px]">⌘K</kbd>{" "}
            para encontrar relatórios, contas ou configurações em qualquer tela. Se a dúvida for sobre dados do
            relatório, fale com o gestor da sua conta.
          </p>
        </div>
      </div>

    </div>
  );
}
