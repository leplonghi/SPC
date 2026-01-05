
import { HeritageAsset, HeritageArea, InfractionRule, Waypoint, Connection } from '../types_patrimonio';

export const HERITAGE_SITES: HeritageAsset[] = [
    {
        id: 'site_se',
        titulo: 'Igreja da Sé',
        categoria: 'Religioso',
        cidade: 'São Luís',
        endereco_original: 'Av. Dom Pedro II, Centro',
        lat: -2.5276,
        lng: -44.3068,
        geocode_confidence: 1,
        geocode_precision: 'rooftop',
        status: 'ok',
        type: 'point',
        graphNode: 'site_se',
        conservation_status: 'Regular',
        tipologia: 'Religioso',
        descricao: 'A Catedral de São Luís é um dos marcos mais importantes do Centro Histórico, apresentando um magnífico retábulo em talha dourada.',
        propriedade: 'institucional',
        uso_atual: 'Templo Religioso',
        ano_construcao: '1762',
        estilo_arquitetonico: 'Neoclássico / Barroco',
        imagens_historicas: [
            'https://images.unsplash.com/photo-1548625313-040e921b700a?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1590603740183-980e7f83a2d3?auto=format&fit=crop&q=80&w=400'
        ],
        inventory: {
            decreto: 'Dec 1.050/1938',
            data_tombamento: '1938-11-20',
            livro_tombo: 'Histórico',
            inscricao: '001-H'
        }
    },
    {
        id: 'site_palacio',
        titulo: 'Palácio dos Leões',
        categoria: 'Civil',
        cidade: 'São Luís',
        endereco_original: 'Av. Dom Pedro II, Centro',
        lat: -2.5290,
        lng: -44.3071,
        geocode_confidence: 1,
        geocode_precision: 'rooftop',
        status: 'ok',
        type: 'point',
        graphNode: 'site_palacio',
        conservation_status: 'Regular',
        tipologia: 'Civil',
        inventory: {
            decreto: 'Dec 1.050/1938',
            data_tombamento: '1938-11-20',
            livro_tombo: 'Histórico',
            inscricao: '002-H'
        }
    },
    {
        id: 'site_teatro',
        titulo: 'Teatro Arthur Azevedo',
        categoria: 'Cultural',
        cidade: 'São Luís',
        endereco_original: 'Rua do Sol, Centro',
        lat: -2.5315,
        lng: -44.3031,
        geocode_confidence: 1,
        geocode_precision: 'rooftop',
        status: 'ok',
        type: 'point',
        graphNode: 'site_teatro',
        conservation_status: 'Regular',
        tipologia: 'Civil',
        inventory: {
            decreto: 'Dec 2.450/1942',
            data_tombamento: '1942-05-15',
            livro_tombo: 'Artes',
            inscricao: '045-A'
        }
    },
    {
        id: 'site_alerta',
        titulo: 'Casarão Rua da Estrela',
        categoria: 'Residencial',
        cidade: 'São Luís',
        endereco_original: 'Rua da Estrela, 142',
        lat: -2.5285,
        lng: -44.3045,
        geocode_confidence: 1,
        geocode_precision: 'rooftop',
        status: 'ok',
        type: 'point',
        graphNode: 'site_alerta',
        conservation_status: 'Alerta',
        tipologia: 'Civil',
        inventory: {
            decreto: 'Dec 1.050/1938',
            data_tombamento: '1938-11-20',
            livro_tombo: 'Histórico',
            inscricao: '142-H'
        }
    }
];

export const INITIAL_ZONES: HeritageArea[] = [
    {
        id: 'zone-federal',
        titulo: 'Polo Central IPHAN',
        cidade: 'São Luís',
        tipo_area: 'federal',
        status: 'ok',
        type: 'area',
        geojson: {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [-44.3080, -2.5270],
                    [-44.3050, -2.5270],
                    [-44.3050, -2.5300],
                    [-44.3080, -2.5300],
                    [-44.3080, -2.5270]
                ]]
            }
        }
    },
    {
        id: 'zone-municipal',
        titulo: 'Área de Proteção Municipal',
        cidade: 'São Luís',
        tipo_area: 'municipal',
        status: 'ok',
        type: 'area',
        geojson: {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [-44.3040, -2.5300],
                    [-44.3020, -2.5300],
                    [-44.3020, -2.5330],
                    [-44.3040, -2.5330],
                    [-44.3040, -2.5300]
                ]]
            }
        }
    }
];

export const INFRACTION_RULES: InfractionRule[] = [
    { tipo: 'Pintura Irregular', min_ufr: 100, max_ufr: 500, categoria: 'Leve' },
    { tipo: 'Alteração de Fachada', min_ufr: 500, max_ufr: 2000, categoria: 'Grave' },
    { tipo: 'Demolição Parcial', min_ufr: 5000, max_ufr: 20000, categoria: 'Gravíssima' },
    { tipo: 'Publicidade Não Autorizada', min_ufr: 200, max_ufr: 800, categoria: 'Média' }
];

export const WAYPOINTS: Waypoint[] = [
    { id: 'site_se', coords: [-2.5276, -44.3068] },
    { id: 'site_palacio', coords: [-2.5290, -44.3071] },
    { id: 'site_teatro', coords: [-2.5315, -44.3031] },
    { id: 'node_center', coords: [-2.5295, -44.3050] }
];

export const CONNECTIONS: Connection[] = [
    { from: 'site_se', to: 'site_palacio' },
    { from: 'site_palacio', to: 'node_center' },
    { from: 'node_center', to: 'site_teatro' }
];
