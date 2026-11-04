import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Camera,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { SITE_CONTACT } from '../data/siteContact';

const DenunciaPage: React.FC = () => {
  usePageTitle('Denúncias');
  const [city, setCity] = useState('São Luís');
  const [address, setAddress] = useState('');
  const [damageType, setDamageType] = useState('Obra ou reforma sem autorização');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const getReportBody = () => `RELATÓRIO DE COMUNICAÇÃO DE DANO / IRREGULARIDADE PATRIMONIAL
PARA: DEPARTAMENTO DE PROTEÇÃO DO PATRIMÔNIO (DPHAP / SPC MARANHÃO)

1. TIPO DE IRREGULARIDADE:
${damageType}

2. LOCALIZAÇÃO DO BEM:
- Município: ${city}
- Endereço / Referência: ${address}

3. DESCRIÇÃO DOS FATOS:
${description}

4. DADOS DO COMUNICANTE:
${
  isAnonymous
    ? 'Comunicação anônima.'
    : `Nome: ${reporterName || 'Não informado'}\nContato (E-mail/Telefone): ${reporterContact || 'Não informado'}`
}

Data da Comunicação: ${new Date().toLocaleDateString('pt-BR')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    window.location.href = `mailto:${SITE_CONTACT.denunciaEmail}?subject=${encodeURIComponent(
      `[DENÚNCIA PATRIMÔNIO] ${damageType} - ${city}`
    )}&body=${encodeURIComponent(getReportBody())}`;

    setSubmitted(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getReportBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800">
      {/* HERO INSTITUCIONAL */}
      <section className="bg-brand-navy text-white py-14 border-b border-brand-sand/20 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
          style={{ backgroundImage: "url('/imagens/CH 01.jpg')" }}
        />
        <div className="relative max-w-[1240px] mx-auto px-6">
          <div className="max-w-3xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-red-600/30 text-white text-xs font-bold uppercase tracking-widest inline-block border border-red-500/40">
              Fiscalização e Salvaguarda
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Denunciar Dano ou Obra Irregular
            </h1>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              Ajude a proteger os centros históricos, casarios, monumentos e bens culturais do Maranhão. Envie informações sobre intervenções não autorizadas, demolições ou abandono de imóveis protegidos.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* FORMULÁRIO OPERACIONAL DE DENÚNCIA */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600">
                Canal de Fiscalização
              </span>
              <h2 className="text-2xl font-black text-brand-navy mt-1">
                Formulário de Comunicação
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                As informações são direcionadas à fiscalização do DPHAP. A apuração pode ser acompanhada mediante fornecimento de contato.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
                <h3 className="font-bold text-emerald-900 text-lg">Denúncia Estruturada com Sucesso!</h3>
                <p className="text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Os dados foram formatados e direcionados ao e-mail oficial do setor de fiscalização:{' '}
                  <strong>{SITE_CONTACT.denunciaEmail}</strong>. Lembre-se de <strong>anexar fotos ou vídeos</strong> comprobatórios na janela de e-mail antes de enviar.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left">
                  <strong>📎 Próximo passo:</strong> Confirme que a janela do seu e-mail se abriu e clique em <em>Enviar</em> para concluir. Anexe fotos do local para agilizar a fiscalização.
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-300 bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copied ? 'Texto Copiado!' : 'Copiar Texto da Denúncia'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-800"
                  >
                    Registrar Nova Comunicação
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="denuncia-city" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Município da Ocorrência *
                    </label>
                    <input
                      id="denuncia-city"
                      type="text"
                      required
                      placeholder="Ex: São Luís"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label htmlFor="denuncia-type" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Tipo de Ocorrência *
                    </label>
                    <select
                      id="denuncia-type"
                      value={damageType}
                      onChange={(e) => setDamageType(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    >
                      <option value="Obra ou reforma sem autorização da SPC">Obra ou reforma sem autorização</option>
                      <option value="Risco de demolição ou demolição em andamento">Risco de demolição / Demolição em curso</option>
                      <option value="Descaracterização de fachada ou azulejaria">Descaracterização de fachada / Azulejos</option>
                      <option value="Pintura inadequada ou descaracterizadora">Pintura inadequada de fachada</option>
                      <option value="Colocação irregular de placas ou engenhos publicitários">Placa ou engenho publicitário irregular</option>
                      <option value="Abandono, desabamento ou risco iminente de colapso">Abandono / Risco de desabamento</option>
                      <option value="Outro dano ao patrimônio cultural">Outro dano</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="denuncia-address" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Endereço Completo do Imóvel ou Local *
                  </label>
                  <input
                    id="denuncia-address"
                    type="text"
                    required
                    placeholder="Logradouro, número, bairro e referências que ajudem a equipe a localizar"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                </div>

                <div>
                  <label htmlFor="denuncia-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    O que está acontecendo? (Descreva com o máximo de detalhes) *
                  </label>
                  <textarea
                    id="denuncia-desc"
                    rows={4}
                    required
                    placeholder="Descreva a situação, desde quando ocorre e se há pessoas ou máquinas trabalhando no local no momento."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy leading-relaxed"
                  />
                </div>

                {/* Opção Anônima */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="anonymous-check"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-navy focus:ring-brand-navy"
                    />
                    <label htmlFor="anonymous-check" className="text-xs font-bold text-slate-700">
                      Desejo enviar esta comunicação de forma anônima
                    </label>
                  </div>

                  {!isAnonymous && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label htmlFor="rep-name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Seu Nome (Opcional)
                        </label>
                        <input
                          id="rep-name"
                          type="text"
                          placeholder="Seu nome"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label htmlFor="rep-contact" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Seu E-mail ou Telefone (Para Retorno)
                        </label>
                        <input
                          id="rep-contact"
                          type="text"
                          placeholder="E-mail ou telefone"
                          value={reporterContact}
                          onChange={(e) => setReporterContact(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <Camera size={16} className="text-amber-700 mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Dica importante:</strong> Fotografias atuais da fachada ou da obra ajudam a fiscalização a agir muito mais rápido. Você poderá anexá-las ao seu e-mail na etapa seguinte.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  <Send size={16} />
                  <span>Enviar Denúncia à Fiscalização</span>
                </button>
              </form>
            )}
          </div>

          {/* COLUNA DIREITA: INFORMAÇÕES DE FISCALIZAÇÃO */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-brand-navy text-lg flex items-center gap-2">
                <ShieldAlert size={20} className="text-red-600" />
                Como a SPC Atua
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ao receber uma denúncia, o Departamento de Proteção do Patrimônio (DPHAP) checa o status de tombamento do imóvel e pode despachar agentes de fiscalização para vistoria no local.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
                <p>
                  <strong>Medidas Administrativas Possíveis:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Notificação para paralisação imediata da obra</li>
                  <li>Auto de infração e aplicação de penalidades legais</li>
                  <li>Determinação de reconstituição das características originais</li>
                  <li>Comunicação ao Ministério Público Estadual</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-black text-brand-navy text-base">Atendimento Presencial na Sede</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você também pode apresentar uma representação física diretamente no setor de protocolo:
              </p>
              <address className="not-italic text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                <strong>{SITE_CONTACT.buildingName}</strong><br />
                {SITE_CONTACT.addressLine}<br />
                {SITE_CONTACT.city} - MA<br />
                Horário: 08:00 às 18:00 (Segunda a Sexta)
              </address>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-black text-brand-navy text-sm">Ainda não sabe se o bem é protegido?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você pode pesquisar na relação oficial antes de enviar:
              </p>
              <Link
                to="/bens-tombados"
                className="text-xs font-bold text-brand-navy hover:text-brand-terracotta underline flex items-center gap-1 pt-1"
              >
                <span>Consultar Relação de Bens Tombados</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DenunciaPage;
