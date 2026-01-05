import { HeritageAsset, Waypoint, Connection } from '../types_patrimonio';

export interface TouristRoute {
    id: string;
    title: string;
    description: string;
    category: 'Religioso' | 'Institucional' | 'Cultural' | 'Emblemático';
    duration: string;
    difficulty: 'Fácil' | 'Médio' | 'Difícil';
    imageUrl: string;
    stops: string[]; // IDs of HeritageAssets
}

export const ADDITIONAL_SITES: HeritageAsset[] = [
    {
        id: 'site_carmo',
        titulo: 'Igreja e Convento do Carmo',
        categoria: 'Religioso',
        cidade: 'São Luís',
        endereco_original: 'Largo do Carmo',
        lat: -2.5280,
        lng: -44.3055,
        geocode_confidence: 1,
        geocode_precision: 'rooftop',
        status: 'ok',
        type: 'point',
        graphNode: 'site_carmo',
        conservation_status: 'Regular',
        tipologia: 'Religioso',
        descricao: 'Templo histórico da ordem carmelita, palco de importantes eventos históricos da cidade.',
        ano_construcao: '1627',
        estilo_arquitetonico: 'Barroco',
        imagens_historicas: ['https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Igreja_do_Carmo_S%C3%A3o_Lu%C3%ADs.jpg/800px-Igreja_do_Carmo_S%C3%A3o_Lu%C3%ADs.jpg']
    },
    {
        id: 'site_merces',
        titulo: 'Convento das Mercês',
        categoria: 'Institucional',
        cidade: 'São Luís',
        endereco_original: 'Rua da Palma',
        lat: -2.5260,
        lng: -44.3025,
        geocode_confidence: 1,
        geocode_precision: 'rooftop',
        status: 'ok',
        type: 'point',
        graphNode: 'site_merces',
        conservation_status: 'Regular',
        tipologia: 'Civil',
        descricao: 'Antigo convento que abriga a Fundação da Memória Republicana Brasileira.',
        ano_construcao: '1654',
        estilo_arquitetonico: 'Colonial',
        imagens_historicas: ['https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Convento_das_Merc%C3%AAs_-_S%C3%A3o_Lu%C3%ADs_-_MA.jpg/800px-Convento_das_Merc%C3%AAs_-_S%C3%A3o_Lu%C3%ADs_-_MA.jpg']
    },
    {
        id: 'site_tulhas',
        titulo: 'Mercado das Tulhas',
        categoria: 'Cultural',
        cidade: 'São Luís',
        endereco_original: 'Rua da Estrela',
        lat: -2.5288,
        lng: -44.3058,
        geocode_confidence: 1,
        geocode_precision: 'rooftop',
        status: 'ok',
        type: 'point',
        graphNode: 'site_tulhas',
        conservation_status: 'Regular',
        tipologia: 'Civil',
        descricao: 'Mercado tradicional em formato octogonal, famoso pelos produtos regionais.',
        ano_construcao: 'Séc. XIX',
        estilo_arquitetonico: 'Colonial',
        imagens_historicas: ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Feira_da_Praia_Grande_-_S%C3%A3o_Lu%C3%ADs_-_MA_-_Brasil.jpg/800px-Feira_da_Praia_Grande_-_S%C3%A3o_Lu%C3%ADs_-_MA_-_Brasil.jpg']
    },
    {
        id: 'site_reggae',
        titulo: 'Museu do Reggae',
        categoria: 'Cultural',
        cidade: 'São Luís',
        endereco_original: 'Rua da Estrela',
        lat: -2.5292,
        lng: -44.3055,
        geocode_confidence: 1,
        geocode_precision: 'rooftop',
        status: 'ok',
        type: 'point',
        graphNode: 'site_reggae',
        conservation_status: 'Regular',
        tipologia: 'Civil',
        descricao: 'Primeiro museu do gênero fora da Jamaica, celebrando a cultura do reggae no Maranhão.',
        ano_construcao: '2018',
        estilo_arquitetonico: 'Colonial (Adaptado)',
        imagens_historicas: ['https://hojemaranhao.com.br/wp-content/uploads/2021/08/Museu-do-Reggae-Maranhao.jpg']
    },
    {
        id: 'site_nhozinho',
        titulo: 'Casa de Nhozinho',
        categoria: 'Cultural',
        cidade: 'São Luís',
        endereco_original: 'Rua Portugal',
        lat: -2.5295,
        lng: -44.3065,
        geocode_confidence: 1,
        geocode_precision: 'rooftop',
        status: 'ok',
        type: 'point',
        graphNode: 'site_nhozinho',
        conservation_status: 'Regular',
        tipologia: 'Civil',
        descricao: 'Museu dedicado ao artesanato maranhense e ao mestre Nhozinho.',
        estilo_arquitetonico: 'Colonial Azulejado',
        imagens_historicas: ['https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Casa_de_Nhozinho_01.jpg/800px-Casa_de_Nhozinho_01.jpg']
    }
];

export const TOURIST_ROUTES: TouristRoute[] = [
    {
        id: 'rota_religiosa',
        title: 'Caminho da Fé',
        description: 'Uma jornada espiritual pelas igrejas seculares de São Luís, explorando a arte sacra e a devoção.',
        category: 'Religioso',
        duration: '45 min',
        difficulty: 'Fácil',
        imageUrl: 'https://images.unsplash.com/photo-1548625313-040e921b700a?auto=format&fit=crop&q=80&w=800',
        stops: ['site_se', 'site_carmo', 'site_merces']
    },
    {
        id: 'rota_poder',
        title: 'Circuito do Poder',
        description: 'Visite as sedes históricas do governo e justiça, onde decisões moldaram o Maranhão.',
        category: 'Institucional',
        duration: '30 min',
        difficulty: 'Fácil',
        imageUrl: 'https://images.unsplash.com/photo-1565060169373-c6c747d7c624?auto=format&fit=crop&q=80&w=800',
        stops: ['site_palacio', 'site_se', 'site_merces']
    },
    {
        id: 'rota_cultura',
        title: 'Ecos da Cultura',
        description: 'Mergulhe na alma ludovicense: do Tambor de Crioula ao Reggae, passando pelo artesanato.',
        category: 'Cultural',
        duration: '1h 20min',
        difficulty: 'Médio',
        imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=800',
        stops: ['site_tulhas', 'site_reggae', 'site_nhozinho', 'site_teatro']
    },
    {
        id: 'rota_emblematica',
        title: 'São Luís Emblemática',
        description: 'Os cartões-postais indispensáveis: azulejos, ladeiras e vistas deslumbrantes.',
        category: 'Emblemático',
        duration: '1h',
        difficulty: 'Médio',
        imageUrl: 'https://viagemeturismo.abril.com.br/wp-content/uploads/2016/10/rev-166-sao-luis-do-maranhao.jpeg?quality=70&strip=info&w=1024',
        stops: ['site_palacio', 'site_nhozinho', 'site_tulhas', 'site_carmo']
    }
];

// Expanded routing data to support new points
export const EXTENDED_WAYPOINTS: Waypoint[] = [
    { id: 'site_carmo', coords: [-2.5280, -44.3055] },
    { id: 'site_merces', coords: [-2.5260, -44.3025] },
    { id: 'site_tulhas', coords: [-2.5288, -44.3058] },
    { id: 'site_reggae', coords: [-2.5292, -44.3055] },
    { id: 'site_nhozinho', coords: [-2.5295, -44.3065] },
    { id: 'node_praca_joao_lisboa', coords: [-2.5282, -44.3050] },
    { id: 'node_reviver', coords: [-2.5298, -44.3060] }
];

export const EXTENDED_CONNECTIONS: Connection[] = [
    { from: 'site_se', to: 'site_nhozinho' },
    { from: 'site_nhozinho', to: 'site_tulhas' },
    { from: 'site_tulhas', to: 'site_reggae' },
    { from: 'site_reggae', to: 'site_teatro' },
    { from: 'site_se', to: 'site_carmo' },
    { from: 'site_carmo', to: 'node_praca_joao_lisboa' },
    { from: 'node_praca_joao_lisboa', to: 'site_merces' },
    { from: 'site_palacio', to: 'site_nhozinho' }
];
