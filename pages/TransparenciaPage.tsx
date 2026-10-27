import React from 'react';
import { Link } from 'react-router-dom';
import { InfoPage, H2 } from '../components/ui/InfoPage';
import { SITE_CONTACT } from '../data/siteContact';

const TransparenciaPage: React.FC = () => (
  <InfoPage
    title="Transparência e acesso à informação"
    eyebrow="Acesso à Informação"
    intro="Qualquer pessoa pode pedir informações públicas à SPC, sem precisar explicar o motivo. A Lei 12.527/2011 garante esse direito."
  >
    <section>
      <H2>Como pedir uma informação</H2>
      <p>
        Envie o pedido para{' '}
        <a className="font-bold text-brand-blue-dark underline break-all" href={`mailto:${SITE_CONTACT.email}?subject=Pedido%20de%20acesso%20%C3%A0%20informa%C3%A7%C3%A3o`}>
          {SITE_CONTACT.email}
        </a>{' '}
        ou protocole na sede ({SITE_CONTACT.addressLine}, {SITE_CONTACT.city}). Informe seu nome, um contato para resposta e descreva com clareza o que você procura.
      </p>
      <p className="mt-3">
        A lei prevê resposta em até 20 dias, que podem ser prorrogados por mais 10 dias com justificativa. Se o pedido for negado, você pode recorrer.
      </p>
      <p className="mt-3">
        Elogios, sugestões, reclamações e pedidos que não foram respondidos também podem ser levados à Ouvidoria da SECMA, órgão ao qual a SPC é vinculada:{' '}
        <a className="font-bold text-brand-blue-dark underline break-all" href={`mailto:${SITE_CONTACT.ouvidoriaEmail}`}>
          {SITE_CONTACT.ouvidoriaEmail}
        </a>.
      </p>
    </section>

    <section>
      <H2>O que já está público neste site</H2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link className="font-bold text-brand-blue-dark underline" to="/legislacao">Biblioteca de legislação</Link>: leis, decretos de tombamento, portarias e diretrizes, com a fonte de cada documento.
        </li>
        <li>
          <Link className="font-bold text-brand-blue-dark underline" to="/servicos">Serviços</Link>: orientações sobre autorização de intervenção, certidões e registro de patrimônio imaterial.
        </li>
      </ul>
    </section>

    <section>
      <H2>Dados pessoais</H2>
      <p>
        Veja como este site trata dados pessoais na{' '}
        <Link className="font-bold text-brand-blue-dark underline" to="/privacidade">Política de Privacidade</Link>.
      </p>
    </section>
  </InfoPage>
);

export default TransparenciaPage;
