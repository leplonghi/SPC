
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const acervoSeed = [
    {
        title: 'Anúncio Veritas - Rua Histórica',
        description: 'Fotografia colorizada de uma rua histórica com um grande anúncio do distribuidor Veritas. Observa-se a arquitetura colonial e o cotidiano urbano.',
        category: 'fotografia',
        tags: ['Histórico', 'Arquitetura', 'Publicidade', 'Rua'],
        imageUrl: '/imagens/veritas_ads.jpg',
        date: 'Século XX',
        location: 'Centro Histórico, São Luís'
    },
    {
        title: 'Cotidiano e Bondes',
        description: 'Registro do centro comercial com trilhos de bonde e pessoas em trajes de época. Destaque para o edifício "Ferro de Engomar".',
        category: 'fotografia',
        tags: ['Histórico', 'Transporte', 'Pessoas', 'Rua'],
        imageUrl: '/imagens/rua_dos_bondes.jpg',
        date: 'c. 1920',
        location: 'Rua Grande(?), São Luís'
    },
    {
        title: 'Avenida Pedro II - Vista Panorâmica',
        description: 'Vista ampla da Avenida Pedro II com destaque para a fonte luminosa e edifícios institucionais ao fundo. Carros de época estacionados.',
        category: 'fotografia',
        tags: ['Histórico', 'Praça', 'Urbanismo', 'Vista Aérea'],
        imageUrl: '/imagens/avenida_pedro_ii.jpg',
        date: 'c. 1950',
        location: 'Avenida Pedro II, São Luís'
    },
    {
        title: 'Praça Pedro II - Atualidade',
        description: 'Vista contemporânea da Praça Pedro II a partir de um dos casarões históricos. Contraste entre a preservação e a vida urbana moderna.',
        category: 'fotografia',
        tags: ['Moderno', 'Praça', 'Arquitetura', 'Preservação'],
        imageUrl: '/imagens/vista_praca_pedro_ii.jpg',
        date: '2024',
        location: 'Praça Pedro II, São Luís'
    },
    {
        title: 'Planta da Cidade de S. Luiz (Maranhão)',
        description: 'Mapa histórico detalhado da cidade de São Luís, mostrando o traçado urbano e pontos de interesse da época.',
        category: 'mapa',
        tags: ['Histórico', 'Cartografia', 'Urbanismo', 'Mapas'],
        imageUrl: '/imagens/mapa_sao_luiz.jpg',
        date: 'Século XIX',
        location: 'São Luís'
    },
    {
        title: 'Mapa Justo Jansen - 1912',
        description: 'Cartografia original elaborada por Justo Jansen em 1912, fundamental para o estudo do crescimento urbano de São Luís.',
        category: 'mapa',
        tags: ['Histórico', 'Cartografia', 'Justo Jansen', '1912'],
        imageUrl: '/imagens/1912 - justo jansen - mapa.jpg',
        date: '1912',
        location: 'São Luís'
    },
    {
        title: 'Pianta della Cittá di S. Luigi - 1698',
        description: 'Planta histórica italiana da cidade de São Luís datada de 1698, um dos registros cartográficos mais antigos do período colonial.',
        category: 'mapa',
        tags: ['Histórico', 'Colonial', 'Cartografia', 'Italiano'],
        imageUrl: '/imagens/Pianta della cittá di S. Luigi metropoli del Maragnone.jpg',
        date: '1698',
        location: 'São Luís'
    }
];

export const repositorioSeed = [
    {
        title: 'Dossiê de Tombamento - Centro Histórico de São Luís',
        description: 'Documentação técnica detalhada que fundamentou o tombamento do Centro Histórico de São Luís como Patrimônio Mundial pela UNESCO.',
        category: 'dossie',
        subcategory: 'patrimonio_material',
        department: 'DPHAP',
        date: '1997-12-04',
        format: 'PDF',
        size: '45.2 MB',
        tags: ['UNESCO', 'Tombamento', 'Histórico', 'São Luís'],
        downloadUrl: 'https://drive.google.com/file/d/1lV0f1s3vD5E/view?usp=sharing',
        executiveSummary: 'Este dossiê detalha os critérios de valor universal excepcional e integridade arquitetônica adotados pela UNESCO para declarar o Centro Histórico de São Luís como Patrimônio Mundial em 1997. Descreve a evolução urbana de matriz luso-brasileira e a originalidade de suas fachadas de azulejo.',
        highlights: [
            'Descrição histórica completa das técnicas construtivas luso-brasileiras.',
            'Inventário e zoneamento técnico de proteção da malha urbana histórica.',
            'Diretrizes metodológicas para conservação da azulejaria de fachadas e sobrados.'
        ],
        pageCount: 354,
        language: 'Português',
        year: 1997
    },
    {
        title: 'Inventário do Patrimônio Imaterial - Bumba Meu Boi',
        description: 'Relatório completo do inventário realizado para o registro do Complexo Cultural do Bumba Meu Boi como patrimônio cultural do Brasil.',
        category: 'dossie',
        subcategory: 'patrimonio_imaterial',
        department: 'DPI',
        date: '2011-08-30',
        format: 'PDF',
        size: '12.8 MB',
        tags: ['Bumba Meu Boi', 'Imaterial', 'Salvaguarda', 'Cultura Pop'],
        downloadUrl: 'https://drive.google.com/file/d/2mX0g2s4wE6F/view?usp=sharing',
        executiveSummary: 'Inventário descritivo abrangente realizado pelo IPHAN e DPI que documenta o Bumba Meu Boi do Maranhão em suas múltiplas dimensões celebrativas. Consolida registros etnográficos, sotaques instrumentais, indumentárias, ritos e a salvaguarda de detentores locais da tradição.',
        highlights: [
            'Classificação e análise detalhada dos principais sotaques do Boi.',
            'Mapeamento cartográfico e geográfico das principais festividades no estado.',
            'Plano integrado de salvaguarda e fomento aos grupos detentores de matriz cultural.'
        ],
        pageCount: 182,
        language: 'Português',
        year: 2011
    },
    {
        title: 'Guia de Conservação de Fachadas Históricas',
        description: 'Manual técnico destinado a proprietários e arquitetos com as melhores práticas para conservação e restauro de fachadas em áreas tombadas.',
        category: 'publicacao',
        subcategory: 'manuais_diretrizes',
        department: 'DPHAP',
        date: '2023-05-15',
        format: 'PDF',
        size: '8.4 MB',
        tags: ['Arquitetura', 'Conservação', 'Manual', 'Técnico'],
        downloadUrl: 'https://drive.google.com/file/d/3nY0h3t5xF7G/view?usp=sharing',
        executiveSummary: 'Manual prático contendo instruções e diretrizes técnicas para conservação, pintura e restauração física de casarões coloniais históricos. Destinado a proprietários, mestres de obras e arquitetos com foco na preservação estrutural e harmonia estética.',
        highlights: [
            'Guia passo a passo para preparação e aplicação de tintas à base de cal.',
            'Diagnóstico de patologias comuns em argamassas históricas e azulejos de fachada.',
            'Protocolo de intervenções permitidas nas áreas de amortecimento e tombamento.'
        ],
        pageCount: 88,
        language: 'Português',
        year: 2023
    }
];
