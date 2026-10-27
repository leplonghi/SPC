import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldAlert,
  Building2,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { SITE_CONTACT, DEPARTMENTS } from '../data/siteContact';

const ContatoPage: React.FC = () => {
  usePageTitle('Contato');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Geral / Triagem');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Monta o link mailto com o conteúdo preenchido
    const mailBody = `DEPARTAMENTO: ${department}
SOLICITANTE: ${name}
E-MAIL: ${email}
TELEFONE: ${phone || 'Não informado'}
ASSUNTO: ${subject}

MENSAGEM:
${message}

Data: ${new Date().toLocaleDateString('pt-BR')}`;

    window.location.href = `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(
      `[Contato SPC - ${department}] ${subject}`
    )}&body=${encodeURIComponent(mailBody)}`;

    setSent(true);
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
            <span className="px-3 py-1 rounded-full bg-white/10 text-[#E9B44C] text-xs font-bold uppercase tracking-widest inline-block border border-white/20">
              Canais Oficiais
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Fale com a SPC Maranhão
            </h1>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              Atendimento presencial, canais de correspondência eletrônica e orientações diretas com os setores técnicos de patrimônio cultural do Estado.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* COLUNA ESQUERDA: FORMULÁRIO DE CONTATO (7 COLUNAS) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-terracotta">
                Mensagem Eletrônica
              </span>
              <h2 className="text-2xl font-black text-brand-navy mt-1">
                Envie sua Solicitação ou Dúvida
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Preencha os campos para encaminhar sua demanda ao setor técnico responsável da SPC.
              </p>
            </div>

            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
                <h3 className="font-bold text-emerald-900 text-lg">Mensagem Encaminhada!</h3>
                <p className="text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Sua mensagem foi estruturada e aberta no seu gerenciador de e-mail institucional. Caso não tenha aberto automaticamente, escreva diretamente para{' '}
                  <strong className="underline">{SITE_CONTACT.email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-800"
                >
                  Enviar Outra Mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Seu Nome Completo *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silveira"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      E-mail para Retorno *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="exemplo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Telefone / WhatsApp
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="(98) 98000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-dept" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Setor Destinatário *
                    </label>
                    <select
                      id="contact-dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    >
                      <option value="Geral / Triagem">Triagem Geral da SPC</option>
                      <option value="DPHAP - Proteção do Patrimônio e Obras">DPHAP (Tombamento e Obras)</option>
                      <option value="DPI - Patrimônio Imaterial">DPI (Salvaguarda Imaterial)</option>
                      <option value="DPE - Projetos Especiais">DPE (Projetos e Obras Estaduais)</option>
                      <option value="Jurídico / Decretos">Jurídico e Decretos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Assunto Resumido *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    placeholder="Ex: Dúvida sobre autorização de reforma na Rua da Estrela"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mensagem Detalhada *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    placeholder="Escreva sua dúvida, solicitação ou informe o endereço do imóvel objeto da consulta."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  <Send size={16} />
                  <span>Encaminhar Mensagem</span>
                </button>
              </form>
            )}
          </div>

          {/* COLUNA DIREITA: DADOS INSTITUCIONAIS (5 COLUNAS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card da Sede */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-navy text-white flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-brand-navy text-base">Sede Oficial</h3>
                  <p className="text-xs text-slate-500">Superintendência do Patrimônio Cultural</p>
                </div>
              </div>

              <address className="not-italic text-sm text-slate-700 leading-relaxed">
                <strong>{SITE_CONTACT.buildingName}</strong><br />
                {SITE_CONTACT.addressLine}<br />
                {SITE_CONTACT.city} - MA
              </address>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={SITE_CONTACT.mapSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-navy hover:text-brand-terracotta underline flex items-center gap-1.5"
                >
                  <span>Abrir localização no Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Horário de Atendimento */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-terracotta text-white flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-black text-brand-navy text-base">Horário de Funcionamento</h3>
                  <p className="text-xs text-slate-500">Atendimento ao Cidadão</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                De <strong>Segunda a Sexta-feira</strong>, das <strong>08h00 às 18h00</strong>.<br />
                Protocolo presencial de requerimentos, certidões e consultas técnicas.
              </p>
            </div>

            {/* Contatos por E-mail */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-black text-brand-navy text-base">Endereços de E-mail</h3>
                  <p className="text-xs text-slate-500">Correspondência Oficial</p>
                </div>
              </div>

              <div className="space-y-2 text-xs md:text-sm">
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider">Geral da SPC:</span>
                  <a href={`mailto:${SITE_CONTACT.email}`} className="font-bold text-brand-navy hover:underline">
                    {SITE_CONTACT.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider">Fiscalização e Denúncias:</span>
                  <a href={`mailto:${SITE_CONTACT.denunciaEmail}`} className="font-bold text-brand-navy hover:underline">
                    {SITE_CONTACT.denunciaEmail}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider">Ouvidoria da SECMA:</span>
                  <a href={`mailto:${SITE_CONTACT.ouvidoriaEmail}`} className="font-bold text-brand-navy hover:underline">
                    {SITE_CONTACT.ouvidoriaEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Canal de Denúncias Card */}
            <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-3">
              <ShieldAlert size={22} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-950 space-y-1">
                <h4 className="font-black text-red-900">Comunicação de Dano ou Obra Irregular</h4>
                <p>
                  Para relatar demolição não autorizada, danos ou alterações em fachadas tombadas, acesse o{' '}
                  <Link to="/denuncia" className="font-bold underline text-red-700">
                    formulário de denúncia
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContatoPage;
