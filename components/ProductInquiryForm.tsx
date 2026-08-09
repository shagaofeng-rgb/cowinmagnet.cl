"use client";

import { useState } from "react";
import { Locale } from "@/data/site";

type Props = {
  locale: Locale;
  productName: string;
  model?: string | null;
};

type Values = {
  name: string;
  company: string;
  country: string;
  email: string;
  whatsapp: string;
  industry: string;
  material: string;
  contaminant: string;
  geometry: string;
  flow: string;
  particle: string;
  space: string;
  power: string;
  environment: string;
  message: string;
  consent: boolean;
};

const emptyValues: Values = { name: "", company: "", country: "", email: "", whatsapp: "", industry: "", material: "", contaminant: "", geometry: "", flow: "", particle: "", space: "", power: "", environment: "", message: "", consent: false };

const spanish = {
  contact: "Paso 1 de 2 · Contacto", application: "Paso 2 de 2 · Datos de aplicación", title: "Datos para una selección técnica", name: "Nombre", company: "Empresa", country: "País", email: "Correo", whatsapp: "WhatsApp", product: "Producto / modelo", industry: "Industria", material: "Material", contaminant: "Tipo de hierro trampa o mineral objetivo", geometry: "Ancho de cinta o diámetro de tubería", flow: "Capacidad o velocidad", particle: "Capa de material o granulometría", space: "Altura de instalación o espacio disponible", power: "Alimentación eléctrica", environment: "Entorno de operación", message: "Mensaje", next: "Continuar", back: "Volver", send: "Solicitar cotización", sending: "Enviando...", success: "Revisaremos sus datos y responderemos por email o WhatsApp.", failed: "No se pudo enviar la solicitud. Revise los datos e intente nuevamente.", contactRequired: "Complete su nombre, país y al menos un canal de contacto.", consent: "Acepto que COWIN use estos datos para responder esta consulta.", select: "Seleccionar", optional: "Opcional", messageHint: "Describa brevemente el punto de proceso y su objetivo."
};

const english = { ...spanish, contact: "Step 1 of 2 · Contact", application: "Step 2 of 2 · Application data", title: "Technical selection details", name: "Name", company: "Company", country: "Country", email: "Email", whatsapp: "WhatsApp", product: "Product / model", industry: "Industry", material: "Material", contaminant: "Tramp metal or target mineral", geometry: "Belt width or pipe diameter", flow: "Capacity or speed", particle: "Material depth or particle size", space: "Installation height or available space", power: "Electrical supply", environment: "Operating environment", message: "Message", next: "Continue", back: "Back", send: "Request a quote", sending: "Sending...", success: "We will review your data and reply by email or WhatsApp.", failed: "The request could not be sent. Please review the information and try again.", contactRequired: "Complete your name, country and at least one contact method.", consent: "I agree that COWIN may use these details to respond to this inquiry.", select: "Select", optional: "Optional", messageHint: "Briefly describe the process point and your objective." };

const portuguese = { ...spanish, contact: "Etapa 1 de 2 · Contato", application: "Etapa 2 de 2 · Dados de aplicação", title: "Dados para seleção técnica", name: "Nome", company: "Empresa", country: "País", email: "E-mail", whatsapp: "WhatsApp", product: "Produto / modelo", industry: "Indústria", material: "Material", contaminant: "Metal tramp ou mineral alvo", geometry: "Largura da correia ou diâmetro da tubulação", flow: "Capacidade ou velocidade", particle: "Camada de material ou granulometria", space: "Altura de instalação ou espaço disponível", power: "Alimentação elétrica", environment: "Ambiente de operação", message: "Mensagem", next: "Continuar", back: "Voltar", send: "Solicitar cotação", sending: "Enviando...", success: "Revisaremos seus dados e responderemos por e-mail ou WhatsApp.", failed: "Não foi possível enviar a solicitação. Revise os dados e tente novamente.", contactRequired: "Complete seu nome, país e ao menos um canal de contato.", consent: "Aceito que a COWIN use estes dados para responder a esta consulta.", select: "Selecionar", optional: "Opcional", messageHint: "Descreva brevemente o ponto de processo e seu objetivo." };

export function ProductInquiryForm({ locale, productName, model }: Props) {
  const copy = locale === "pt-br" ? portuguese : locale === "en" ? english : spanish;
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<Values>(emptyValues);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const productValue = model ? `${productName} (${model})` : productName;
  const language = locale === "pt-br" ? "Portuguese" : locale === "en" ? "English" : "Spanish";
  const setValue = (field: keyof Values, value: string | boolean) => setValues((current) => ({ ...current, [field]: value }));
  const contactIsReady = values.name.trim() && values.country && (values.email.trim() || values.whatsapp.trim());

  function continueToApplication() {
    if (!contactIsReady) {
      setStatus(copy.contactRequired);
      return;
    }
    setStatus("");
    setStep(2);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      continueToApplication();
      return;
    }
    if (!values.message.trim() || !values.consent) {
      setStatus(copy.failed);
      return;
    }
    const query = new URLSearchParams(window.location.search);
    const sourceMetadata = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].map((key) => query.get(key) ? `${key}=${query.get(key)}` : "").filter(Boolean).join("; ");
    const projectDescription = [
      values.message,
      `${copy.contaminant}: ${values.contaminant || "No informado"}`,
      `${copy.geometry}: ${values.geometry || "No informado"}`,
      `${copy.flow}: ${values.flow || "No informado"}`,
      `${copy.particle}: ${values.particle || "No informado"}`,
      `${copy.space}: ${values.space || "No informado"}`,
      `${copy.power}: ${values.power || "No informado"}`,
      `${copy.environment}: ${values.environment || "No informado"}`,
      `sourceUrl: ${window.location.href}`,
      sourceMetadata ? `UTM: ${sourceMetadata}` : ""
    ].filter(Boolean).join("\n");
    const payload = {
      name: values.name, company: values.company, country: values.country, region: "", email: values.email, whatsapp: values.whatsapp, language,
      product: productValue, model: model || "", industry: values.industry, material: values.material,
      beltWidth: values.geometry, capacity: values.flow, suspensionHeight: values.space, installation: "", cleaning: "", voltage: values.power,
      projectDescription, sourcePage: window.location.pathname, sourceUrl: window.location.href, utm: sourceMetadata, website: ""
    };
    try {
      setLoading(true);
      setStatus("");
      const response = await fetch("/api/inquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(result?.error || copy.failed);
      setStatus(copy.success);
      setValues(emptyValues);
      setStep(1);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : copy.failed);
    } finally {
      setLoading(false);
    }
  }

  return <form className="pd-inquiry-form" onSubmit={submit}>
    <div className="pd-form-heading"><p>{step === 1 ? copy.contact : copy.application}</p><span>{copy.title}</span></div>
    {step === 1 ? <div className="pd-inquiry-grid">
      <label>{copy.name}<input value={values.name} onChange={(event) => setValue("name", event.target.value)} autoComplete="name" required /></label>
      <label>{copy.company}<input value={values.company} onChange={(event) => setValue("company", event.target.value)} autoComplete="organization" /></label>
      <label>{copy.country}<select value={values.country} onChange={(event) => setValue("country", event.target.value)} required><option value="">{copy.select}</option><option>Chile</option><option>Perú</option><option>Argentina</option><option>Bolivia</option><option>Brasil</option><option>Colombia</option><option>Otro país de Latinoamérica</option></select></label>
      <label>{copy.email}<input value={values.email} onChange={(event) => setValue("email", event.target.value)} type="email" autoComplete="email" /></label>
      <label className="pd-inquiry-wide">{copy.whatsapp}<input value={values.whatsapp} onChange={(event) => setValue("whatsapp", event.target.value)} autoComplete="tel" placeholder="+56..." /></label>
    </div> : <div className="pd-inquiry-grid">
      <label className="pd-inquiry-wide">{copy.product}<input value={productValue} readOnly aria-readonly="true" /></label>
      <label>{copy.industry} <small>{copy.optional}</small><input value={values.industry} onChange={(event) => setValue("industry", event.target.value)} placeholder="Minería, reciclaje, cemento..." /></label>
      <label>{copy.material}<input value={values.material} onChange={(event) => setValue("material", event.target.value)} placeholder="Cobre, áridos, pulpa, plástico..." /></label>
      <label>{copy.contaminant} <small>{copy.optional}</small><input value={values.contaminant} onChange={(event) => setValue("contaminant", event.target.value)} /></label>
      <label>{copy.geometry}<input value={values.geometry} onChange={(event) => setValue("geometry", event.target.value)} placeholder="mm" /></label>
      <label>{copy.flow}<input value={values.flow} onChange={(event) => setValue("flow", event.target.value)} placeholder="m/s o t/h" /></label>
      <label>{copy.particle} <small>{copy.optional}</small><input value={values.particle} onChange={(event) => setValue("particle", event.target.value)} placeholder="mm" /></label>
      <label>{copy.space}<input value={values.space} onChange={(event) => setValue("space", event.target.value)} placeholder="mm" /></label>
      <label>{copy.power} <small>{copy.optional}</small><input value={values.power} onChange={(event) => setValue("power", event.target.value)} placeholder="V / Hz" /></label>
      <label>{copy.environment}<input value={values.environment} onChange={(event) => setValue("environment", event.target.value)} placeholder="Polvo, humedad, altitud..." /></label>
      <label className="pd-inquiry-wide">{copy.message}<textarea value={values.message} onChange={(event) => setValue("message", event.target.value)} rows={4} required placeholder={copy.messageHint} /></label>
    </div>}
    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
    {step === 2 ? <label className="pd-inquiry-consent"><input type="checkbox" checked={values.consent} onChange={(event) => setValue("consent", event.target.checked)} required /> <span>{copy.consent}</span></label> : null}
    <div className="pd-form-actions">{step === 2 ? <button className="pd-button pd-button-secondary" type="button" onClick={() => { setStatus(""); setStep(1); }}>{copy.back}</button> : null}<button className="pd-button pd-button-primary" type={step === 1 ? "button" : "submit"} onClick={step === 1 ? continueToApplication : undefined} disabled={loading}>{loading ? copy.sending : step === 1 ? copy.next : copy.send}</button></div>
    <p className="pd-form-status" role="status" aria-live="polite">{status}</p>
  </form>;
}
