"use client";

import { useMemo, useState } from "react";
import { Locale } from "@/data/site";

type Props = {
  locale: Locale;
  productName: string;
  model?: string | null;
};

const spanish = {
  title: "Datos para una selección técnica",
  name: "Nombre",
  country: "País",
  email: "Correo",
  whatsapp: "WhatsApp o teléfono",
  product: "Producto / modelo",
  industry: "Industria",
  material: "Material",
  contaminant: "Contaminación o mineral objetivo",
  geometry: "Ancho de cinta o diámetro de tubería",
  flow: "Velocidad de cinta o caudal",
  particle: "Capa de material o granulometría",
  space: "Altura de suspensión o espacio de instalación",
  power: "Alimentación eléctrica",
  environment: "Ambiente de operación",
  message: "Mensaje",
  send: "Enviar solicitud",
  sending: "Enviando...",
  success: "Solicitud recibida. Un especialista revisará los datos del proyecto.",
  failed: "No se pudo enviar la solicitud. Revise los datos e intente nuevamente.",
  consent: "Acepto que COWIN use estos datos para responder esta consulta.",
  select: "Seleccionar"
};

const english = {
  ...spanish,
  title: "Technical selection details", name: "Name", country: "Country", email: "Email", whatsapp: "WhatsApp or phone", product: "Product / model", industry: "Industry", material: "Material", contaminant: "Contamination or target mineral", geometry: "Belt width or pipe diameter", flow: "Belt speed or flow rate", particle: "Material depth or particle size", space: "Suspension height or installation space", power: "Electrical supply", environment: "Operating environment", message: "Message", send: "Send request", sending: "Sending...", success: "Request received. A specialist will review the project data.", failed: "The request could not be sent. Please review the information and try again.", consent: "I agree that COWIN may use these details to respond to this inquiry.", select: "Select"
};

const portuguese = {
  ...spanish,
  title: "Dados para seleção técnica", name: "Nome", country: "País", email: "E-mail", whatsapp: "WhatsApp ou telefone", product: "Produto / modelo", industry: "Indústria", material: "Material", contaminant: "Contaminação ou mineral alvo", geometry: "Largura da correia ou diâmetro da tubulação", flow: "Velocidade da correia ou vazão", particle: "Camada de material ou granulometria", space: "Altura de suspensão ou espaço de instalação", power: "Alimentação elétrica", environment: "Ambiente de operação", message: "Mensagem", send: "Enviar solicitação", sending: "Enviando...", success: "Solicitação recebida. Um especialista revisará os dados do projeto.", failed: "Não foi possível enviar a solicitação. Revise os dados e tente novamente.", consent: "Aceito que a COWIN use estes dados para responder a esta consulta.", select: "Selecionar"
};

export function ProductInquiryForm({ locale, productName, model }: Props) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const copy = locale === "pt-br" ? portuguese : locale === "en" ? english : spanish;
  const productValue = model ? `${productName} (${model})` : productName;
  const language = locale === "pt-br" ? "Portuguese" : locale === "en" ? "English" : "Spanish";
  const sourceMetadata = useMemo(() => {
    if (typeof window === "undefined") return "";
    const query = new URLSearchParams(window.location.search);
    return ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]
      .map((key) => query.get(key) ? `${key}=${query.get(key)}` : "")
      .filter(Boolean)
      .join("; ");
  }, []);

  return <form className="product-inquiry-form" onSubmit={async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const formData = new FormData(form);
    const fields = Object.fromEntries(formData.entries());
    const projectDescription = [
      String(fields.message || ""),
      `${copy.contaminant}: ${String(fields.contaminant || "No informado")}`,
      `${copy.geometry}: ${String(fields.geometry || "No informado")}`,
      `${copy.flow}: ${String(fields.flow || "No informado")}`,
      `${copy.particle}: ${String(fields.particle || "No informado")}`,
      `${copy.space}: ${String(fields.space || "No informado")}`,
      `${copy.power}: ${String(fields.power || "No informado")}`,
      `${copy.environment}: ${String(fields.environment || "No informado")}`,
      `sourceUrl: ${window.location.href}`,
      sourceMetadata ? `UTM: ${sourceMetadata}` : ""
    ].filter(Boolean).join("\n");
    const payload = {
      name: String(fields.name || ""), company: "", country: String(fields.country || ""), region: "",
      email: String(fields.email || ""), whatsapp: String(fields.whatsapp || ""), language,
      product: productValue, model: model || "", industry: String(fields.industry || ""), material: String(fields.material || ""),
      beltWidth: String(fields.geometry || ""), capacity: String(fields.flow || ""), suspensionHeight: String(fields.space || ""),
      installation: "", cleaning: "", voltage: String(fields.power || ""), projectDescription,
      sourcePage: window.location.pathname, sourceUrl: window.location.href, utm: sourceMetadata,
      website: String(fields.website || "")
    };
    try {
      setLoading(true);
      setStatus("");
      const response = await fetch("/api/inquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(result?.error || copy.failed);
      setStatus(copy.success);
      form.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : copy.failed);
    } finally {
      setLoading(false);
    }
  }}>
    <p className="product-form-title">{copy.title}</p>
    <div className="product-inquiry-grid">
      <label>{copy.name}<input name="name" autoComplete="name" required /></label>
      <label>{copy.country}<select name="country" required><option value="">{copy.select}</option><option>Chile</option><option>Perú</option><option>Argentina</option><option>Bolivia</option><option>Brasil</option><option>Colombia</option><option>Otro país de Latinoamérica</option></select></label>
      <label>{copy.email}<input name="email" type="email" autoComplete="email" /></label>
      <label>{copy.whatsapp}<input name="whatsapp" autoComplete="tel" placeholder="+56..." /></label>
      <label className="product-inquiry-wide">{copy.product}<input value={productValue} readOnly aria-readonly="true" /></label>
      <label>{copy.industry}<input name="industry" placeholder="Minería, reciclaje, cemento..." /></label>
      <label>{copy.material}<input name="material" placeholder="Cobre, áridos, pulpa, plástico..." /></label>
      <label>{copy.contaminant}<input name="contaminant" /></label>
      <label>{copy.geometry}<input name="geometry" placeholder="mm" /></label>
      <label>{copy.flow}<input name="flow" placeholder="m/s o t/h" /></label>
      <label>{copy.particle}<input name="particle" placeholder="mm" /></label>
      <label>{copy.space}<input name="space" placeholder="mm" /></label>
      <label>{copy.power}<input name="power" placeholder="V / Hz" /></label>
      <label>{copy.environment}<input name="environment" placeholder="Polvo, humedad, altitud..." /></label>
      <label className="product-inquiry-wide">{copy.message}<textarea name="message" rows={4} required placeholder="Describa brevemente el punto de proceso y su objetivo." /></label>
    </div>
    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
    <label className="product-inquiry-consent"><input type="checkbox" required /> {copy.consent}</label>
    <button className="button primary" type="submit" disabled={loading}>{loading ? copy.sending : copy.send}</button>
    <p className="form-status" role="status">{status}</p>
  </form>;
}
