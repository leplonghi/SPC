
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
        department: 'DPHAP',
        date: '1997-12-04',
        format: 'PDF',
        size: '45.2 MB',
        tags: ['UNESCO', 'Tombamento', 'Histórico', 'São Luís'],
        downloadUrl: '#'
    },
    {
        title: 'Inventário do Patrimônio Imaterial - Bumba Meu Boi',
        description: 'Relatório completo do inventário realizado para o registro do Complexo Cultural do Bumba Meu Boi como patrimônio cultural do Brasil.',
        category: 'dossie',
        department: 'DPI',
        date: '2011-08-30',
        format: 'PDF',
        size: '12.8 MB',
        tags: ['Bumba Meu Boi', 'Imaterial', 'Salvaguarda', 'Cultura Pop'],
        downloadUrl: '#'
    },
    {
        title: 'Guia de Conservação de Fachadas Históricas',
        description: 'Manual técnico destinado a proprietários e arquitetos com as melhores práticas para conservação e restauro de fachadas em áreas tombadas.',
        category: 'publicacao',
        department: 'DPHAP',
        date: '2023-05-15',
        format: 'PDF',
        size: '8.4 MB',
        tags: ['Arquitetura', 'Conservação', 'Manual', 'Técnico'],
        downloadUrl: '#'
    }
];
