import React from 'react';
import { Link } from 'react-router-dom';
import { InfoPage, H2 } from '../components/ui/InfoPage';

const TermosPage: React.FC = () => (
  <InfoPage
    title="Termos de Uso"
    eyebrow="Informações sobre o uso do portal"
    intro="O portal da SPC existe para informar. Os atos oficiais continuam valendo nas suas fontes originais."
  >
    <section>
      <H2>O que este portal é</H2>
      <p>
        Um canal de informação da Superintendência do Patrimônio Cultural do Maranhão. Reúne orientações, legislação e contatos para facilitar o acesso público.
      </p>
    </section>

    <section>
      <H2>Textos oficiais prevalecem</H2>
      <p>
        As cópias e resumos publicados aqui não substituem o Diário Oficial nem o texto original dos atos. Para confirmar vigência, alterações e aplicação de uma norma, consulte a fonte oficial indicada em cada documento da{' '}
        <Link className="font-bold text-brand-blue-dark underline" to="/legislacao">biblioteca de legislação</Link>. O mesmo vale para a consulta de{' '}
        <Link className="font-bold text-brand-blue-dark underline" to="/bens-tombados">bens tombados</Link>: ela é uma relação de apoio e não substitui a certidão emitida pela SPC.
      </p>
    </section>

    <section>
      <H2>Orientações não são autorização</H2>
      <p>
        As orientações sobre serviços explicam como pedir autorização, certidão ou registro. A autorização só existe quando emitida pela SPC no processo próprio.
      </p>
    </section>

    <section>
      <H2>Links externos</H2>
      <p>A SPC não controla o conteúdo de sites externos e não responde por ele.</p>
    </section>

    <section>
      <H2>Área restrita</H2>
      <p>É de uso exclusivo de servidores autorizados. O acesso é pessoal e intransferível.</p>
    </section>
  </InfoPage>
);

export default TermosPage;
