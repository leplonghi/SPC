import React from 'react';
import { InfoPage, H2 } from '../components/ui/InfoPage';
import { SITE_CONTACT } from '../data/siteContact';

const PrivacidadePage: React.FC = () => (
  <InfoPage
    title="Política de Privacidade"
    eyebrow="LGPD"
    intro="Este portal informa; ele não pede cadastro nem coleta dados de quem apenas consulta as páginas públicas."
  >
    <section>
      <H2>O que o portal público coleta</H2>
      <p>
        Para consultar as páginas públicas (início, serviços, legislação, contato), você não precisa informar nenhum dado pessoal. O portal não tem formulário de inscrição nem de cadastro aberto ao público.
      </p>
      <p className="mt-2">
        Para fins estatísticos e de melhoria contínua do serviço público, o portal contabiliza de forma anônima o número de visitas, páginas consultadas, tempo de permanência, tipo de dispositivo e localização aproximada (cidade, estado e país), sem armazenar o endereço de IP bruto nem identificar individualmente o cidadão.
      </p>
    </section>

    <section>
      <H2>Área restrita</H2>
      <p>
        A área restrita é usada por servidores autorizados. Para entrar, o sistema usa o e-mail e a senha do servidor, processados pelo serviço de autenticação Firebase Authentication, da Google. Esses dados servem apenas para controlar o acesso.
      </p>
    </section>

    <section>
      <H2>Quando você escreve para a SPC</H2>
      <p>
        Se você enviar e-mail ou protocolar um pedido, a SPC usa as informações que você fornecer (nome, contato, descrição) apenas para analisar e responder a solicitação, conforme a Lei 12.527/2011 e a Lei 13.709/2018 (LGPD).
      </p>
    </section>

    <section>
      <H2>Links e serviços de terceiros</H2>
      <p>
        Algumas páginas levam a sites externos (órgãos federais, Diário Oficial, SEI). Esses sites têm suas próprias políticas. As fontes de letra do portal são carregadas do Google Fonts, o que pode expor seu endereço de IP à Google. O recurso de tradução em Libras (VLibras) é fornecido pelo Governo Federal e carregado de vlibras.gov.br quando a página abre.
      </p>
    </section>

    <section>
      <H2>Seus direitos e contato</H2>
      <p>
        Você pode pedir informação sobre dados que a SPC tenha a seu respeito, correção ou exclusão, nos termos da LGPD. Escreva para{' '}
        <a className="font-bold text-brand-blue-dark underline break-all" href={`mailto:${SITE_CONTACT.email}?subject=LGPD`}>
          {SITE_CONTACT.email}
        </a>
        .
      </p>
      <p className="mt-3 text-sm text-slate-500">Atualizada em 10/10/2026.</p>
    </section>
  </InfoPage>
);

export default PrivacidadePage;
