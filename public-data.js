export const SITE = Object.freeze({
  name: 'CGF Goiás',
  fullName: 'Comando de Gestão e Finanças — PMGO',
  url: 'https://portal-cgf-pmgo.vercel.app',
  officialPmgo: 'https://goias.gov.br/policiamilitar/',
  articulacao: 'https://siscop.pm.go.gov.br/index.php?class=articulacaoDashboard',
  faleConosco: 'https://goias.gov.br/policiamilitar/fale-conosco-pmgo/',
  acessoInformacao: 'https://goias.gov.br/policiamilitar/acesso-a-informacao/',
  portarias: 'https://goias.gov.br/policiamilitar/portarias-pmgo/',
  sourceLabel: 'Regimento Interno do CGF — Portaria nº 18.207/2024',
  contactsVerifiedAt: '19/08/2026'
});

const commonSource = {
  label: 'Regimento Interno do CGF — Portaria nº 18.207/2024',
  url: SITE.portarias,
  note: 'Competências resumidas apenas para orientação pública; procedimentos internos e informações reservadas não são reproduzidos.'
};

const contactSource = {
  label: 'Articulação PMGO',
  url: SITE.articulacao,
  verifiedAt: SITE.contactsVerifiedAt,
  note: 'Confirme o contato no canal oficial antes de encaminhar informação sensível ou documento.'
};

export const SECTIONS = Object.freeze([
  {
    slug: 'cgf-1', id: 'CGF/1', title: 'Controle de Processos e Inativação',
    summary: 'Orientação geral sobre processos administrativos de inativação e temas funcionais correlatos.',
    publicTopics: ['reserva remunerada', 'reforma', 'licenciamento', 'averbação de tempo de serviço', 'abono de permanência', 'históricos e certidões funcionais'],
    keywords: ['reserva', 'inativacao', 'inativação', 'reforma', 'licenciamento', 'averbacao', 'averbação', 'tempo de servico', 'tempo de serviço', 'abono permanencia', 'abono de permanência', 'historico funcional', 'histórico funcional', 'certidao', 'certidão'],
    training: ['quero saber sobre reserva remunerada', 'como tratar averbação de tempo de serviço', 'dúvida sobre reforma', 'abono de permanência', 'preciso de histórico funcional'],
    contact: { sei: '09849', phone: '(62) 99837-786', email: null, source: contactSource },
    source: commonSource
  },
  {
    slug: 'cgf-2', id: 'CGF/2', title: 'Justiça e Notificações',
    summary: 'Orientação sobre tramitação administrativa de atos de desligamento, reinclusão, reintegração e assuntos de justiça/notificações.',
    publicTopics: ['cancelamento ou anulação de punição', 'exclusão e licenciamento', 'demissão', 'reinclusão', 'reintegração', 'notificações administrativas'],
    keywords: ['justica', 'justiça', 'notificacao', 'notificação', 'judicial', 'punicao', 'punição', 'cancelamento', 'anulacao', 'anulação', 'exclusao', 'exclusão', 'licenciamento', 'demissao', 'demissão', 'reinclusao', 'reinclusão', 'reintegracao', 'reintegração'],
    training: ['recebi uma notificação administrativa', 'dúvida sobre reintegração', 'processo de reinclusão', 'cancelamento de punição', 'assunto de justiça administrativa'],
    contact: { sei: '09996', phone: '(62) 99920-372', email: 'crh2pmgo@gmail.com', source: contactSource },
    source: commonSource
  },
  {
    slug: 'cgf-3', id: 'CGF/3', title: 'Recrutamento e Seleção de Pessoal',
    summary: 'Recrutamento, seleção, cursos e concursos de interesse da PMGO, conforme editais e publicações vigentes.',
    publicTopics: ['cursos e concursos', 'processos seletivos internos', 'pré-inscrições de cursos', 'editais', 'retorno de militares da reserva ao serviço ativo'],
    keywords: ['concurso', 'selecao', 'seleção', 'recrutamento', 'curso', 'estagio', 'estágio', 'edital', 'prova', 'inscricao', 'inscrição', 'eac', 'eas', 'choa', 'chom', 'tap'],
    training: ['inscrição em curso', 'edital de concurso', 'processo seletivo', 'EAC', 'EAS', 'curso de capacitação', 'retorno da reserva ao serviço ativo'],
    contact: {
      sei: '09348', phone: '(62) 99953-1211', email: 'pmgrh3@gmail.com',
      source: {
        label: 'PMGO — Editais EAS/EAC 8ª Turma/2026',
        url: 'https://goias.gov.br/policiamilitar/editais-eas-eac-8a-turma-2026/',
        verifiedAt: '15/07/2026',
        note: 'Telefone confirmado em publicação oficial recente; caixa SEI e e-mail permanecem referenciados na Articulação PMGO.'
      }
    },
    source: commonSource
  },
  {
    slug: 'cgf-4', id: 'CGF/4', title: 'Administração de Pessoal',
    summary: 'Orientação sobre administração do efetivo ativo e atos funcionais de pessoal.',
    publicTopics: ['agregação e reversão', 'ajuda de custo', 'licença especial', 'licença por interesse particular', 'controle de efetivo', 'atos de administração de pessoal'],
    keywords: ['administracao de pessoal', 'administração de pessoal', 'agregacao', 'agregação', 'reversao', 'reversão', 'ajuda de custo', 'licenca', 'licença', 'efetivo', 'lotacao', 'lotação', 'almanaque', 'afastamento'],
    training: ['dúvida sobre agregação', 'reversão ao serviço', 'licença por interesse particular', 'ajuda de custo', 'situação de efetivo', 'administração de pessoal'],
    contact: { sei: '09997', phone: '(62) 99969-713', email: null, source: contactSource },
    source: commonSource
  },
  {
    slug: 'cgf-5', id: 'CGF/5', title: 'Identificação de Pessoal',
    summary: 'Identificação funcional e orientação documental relacionada à inclusão e identificação de pessoal.',
    publicTopics: ['identidade funcional', 'emissão e atualização de identificação', 'documentos de candidatos aprovados', 'identificação de dependentes', 'inclusão de voluntários aprovados'],
    keywords: ['identidade', 'identificacao', 'identificação', 'carteira funcional', 'candidato aprovado', 'concurso aprovado', 'documentos', 'inclusao', 'inclusão', 'dependente'],
    training: ['preciso renovar identidade funcional', 'emissão de carteira funcional', 'sou candidato aprovado e preciso entregar documentos', 'identidade de dependente', 'identificação funcional'],
    contact: { sei: '10609', phone: '(62) 99628-212', email: 'pmgip11@gmail.com', source: contactSource },
    source: commonSource
  },
  {
    slug: 'cgf-6', id: 'CGF/6', title: 'Veteranos, Inativos e Pensionistas',
    summary: 'Orientação administrativa para veteranos, inativos e pensionistas em matérias funcionais públicas.',
    publicTopics: ['revisão de proventos', 'isenção de imposto de renda', 'dependentes', 'documentos funcionais', 'processos administrativos de veteranos', 'reforma por idade ou incapacidade'],
    keywords: ['veterano', 'veteranos', 'inativo', 'inativos', 'pensionista', 'pensionistas', 'proventos', 'dependente', 'imposto de renda', 'isencao', 'isenção', 'revisao', 'revisão', 'reforma'],
    training: ['sou veterano e preciso de orientação', 'revisão de proventos', 'isenção de imposto de renda', 'documento funcional de inativo', 'assunto de pensionista'],
    contact: { sei: '09998', phone: '(62) 99806-601', email: null, source: contactSource },
    source: commonSource
  },
  {
    slug: 'cgf-7', id: 'CGF/7', title: 'Recadastramento de Pessoal Ativo',
    summary: 'Orientação geral sobre cadastramento e recadastramento anual do pessoal ativo.',
    publicTopics: ['recadastramento anual', 'cadastramento', 'orientação em caso de bloqueio cadastral', 'atualização cadastral'],
    keywords: ['recadastramento', 'cadastramento', 'aniversario', 'aniversário', 'bloqueio', 'desbloqueio', 'atualizacao cadastral', 'atualização cadastral'],
    training: ['como fazer recadastramento', 'meu recadastramento anual', 'bloqueio por cadastro', 'atualização cadastral no mês do aniversário'],
    contact: { sei: '16315', phone: '(62) 99631-436', email: 'ras.cgf.2016@gmail.com', source: contactSource },
    source: commonSource
  },
  {
    slug: 'cgf-8', id: 'CGF/8', title: 'Arquivo-Geral',
    summary: 'Orientação sobre localização, preservação e acesso formal a documentos do acervo histórico e funcional.',
    publicTopics: ['boletins gerais antigos', 'fichas funcionais antigas', 'processos arquivados', 'localização de documentos', 'cópias e desarquivamento conforme regras de acesso'],
    keywords: ['arquivo', 'boletim', 'boletim geral', 'ficha funcional', 'documento antigo', 'acervo', 'certidao', 'certidão', 'copia', 'cópia', 'desarquivar', 'desarquivamento'],
    training: ['preciso localizar boletim antigo', 'quero cópia de documento arquivado', 'ficha funcional antiga', 'desarquivamento', 'acervo histórico'],
    contact: { sei: '10607', phone: '(62) 99615-246', email: null, source: contactSource },
    source: commonSource
  },
  {
    slug: 'cgf-9', id: 'CGF/9', title: 'Orçamentária e Financeira',
    summary: 'Orientação pública sobre matérias orçamentárias, financeiras, contábeis e de folha, sem consulta de casos individuais.',
    publicTopics: ['administração financeira e contábil', 'pagamentos administrativos', 'folha de pagamento', 'pensão alimentícia', 'vantagens e descontos', 'fornecedores e execução orçamentária'],
    keywords: ['financeiro', 'financeira', 'orcamento', 'orçamento', 'contabilidade', 'pagamento', 'fornecedor', 'empenho', 'despesa', 'folha', 'pensao alimenticia', 'pensão alimentícia', 'desconto', 'vantagem', 'ferias', 'férias', 'diaria', 'diária', 'auxilio funeral', 'auxílio funeral'],
    training: ['dúvida sobre folha de pagamento', 'pensão alimentícia', 'pagamento de fornecedor', 'assunto orçamentário', 'vantagem ou desconto em folha', 'férias e acerto financeiro'],
    contact: { sei: '09508', phone: '(62) 32011-405 · (62) 9991-1390', email: null, source: contactSource },
    source: commonSource
  }
]);

export const FAQS = Object.freeze([
  { q: 'O portal consulta o andamento do meu processo SEI?', a: 'Não. O portal não acessa o SEI nem consulta processos individuais. Use o canal oficial da seção responsável sem informar dados pessoais no orientador.' },
  { q: 'Posso informar CPF, RG, matrícula ou número de processo?', a: 'Não. O orientador bloqueia padrões de dados pessoais e processuais. Descreva apenas o assunto geral.' },
  { q: 'O orientador toma decisões ou altera folha de pagamento?', a: 'Não. Ele apenas classifica o assunto e sugere a seção mais provável. Nenhum ato administrativo é executado pelo portal.' },
  { q: 'Como confirmar se um telefone ou caixa SEI continua atual?', a: 'Use o link da Articulação PMGO exibido no portal. Os contatos publicados aqui mostram a fonte e a data da última verificação.' },
  { q: 'O site substitui o atendimento oficial da PMGO?', a: 'Não. Este portal é de orientação pública e sempre direciona para os canais oficiais da Polícia Militar do Estado de Goiás.' },
  { q: 'O portal armazena o texto digitado no orientador?', a: 'A implementação não possui banco de dados de conversas e não grava o texto informado. As respostas do orientador são processadas apenas para classificar o tema.' },
  { q: 'Onde encontro editais, comunicados e notícias?', a: 'A seção Atualizações consulta o portal oficial da PMGO por um backend próprio, com cache e fallback para o canal oficial.' },
  { q: 'Como solicitar acesso a informação pública?', a: 'Utilize o canal oficial de Acesso à Informação da PMGO. Documentos pessoais, restritos ou sigilosos não são recebidos por este portal.' }
]);

export function getSection(slugOrId) {
  const value = String(slugOrId || '').toLowerCase();
  return SECTIONS.find((section) => section.slug === value || section.id.toLowerCase() === value) || null;
}
