"use client";

import { useRef, useState } from "react";
import { Locale, t, uiText } from "@/data/site";
import { submitInquiry, type InquiryAttempt } from "@/lib/clientInquiry";

export function QuoteForm({ locale = "es-cl", initialProduct = "", model = "" }: { locale?: Locale; initialProduct?: string; model?: string }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const pending = useRef(false);
  const attempt = useRef<InquiryAttempt | null>(null);
  const copy = uiText[locale] ?? uiText["es-cl"];
  const region = new Intl.DisplayNames([locale], { type: "region" });
  const countries = [["CL", "Chile"], ["PE", "Peru"], ["BR", "Brazil"], ["AR", "Argentina"], ["BO", "Bolivia"],
    ["CO", "Colombia"], ["EC", "Ecuador"], ["MX", "Mexico"], ["US", "United States"], ["CA", "Canada"]];

  return (
    <form
      className="quote-form panel"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending.current) return;
        const form = event.currentTarget;
        if (!form.checkValidity()) {
          setStatus(copy.quoteForm.reviewRequired);
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        if (!String(formData.get("email") || "").trim() && !String(formData.get("whatsapp") || "").trim()) {
          setStatus(t(locale, "Indique un correo o teléfono de contacto.", "Informe um e-mail ou telefone.", "Enter a contact email or phone number."));
          return;
        }
        pending.current = true;
        setLoading(true);
        setStatus(copy.quoteForm.sending);
        const payload = {
          name: String(formData.get("name") || ""),
          company: String(formData.get("company") || ""),
          country: String(formData.get("country") || ""),
          region: String(formData.get("region") || ""),
          email: String(formData.get("email") || ""),
          whatsapp: String(formData.get("whatsapp") || ""),
          language: String(formData.get("language") || ""),
          product: String(formData.get("product") || ""),
          model: model && formData.get("product") === initialProduct ? model : "",
          industry: String(formData.get("industry") || ""),
          material: String(formData.get("material") || ""),
          maxSize: String(formData.get("maxSize") || ""),
          capacity: String(formData.get("capacity") || ""),
          beltWidth: String(formData.get("beltWidth") || ""),
          beltSpeed: String(formData.get("beltSpeed") || ""),
          layerThickness: String(formData.get("layerThickness") || ""),
          suspensionHeight: String(formData.get("suspensionHeight") || ""),
          installation: String(formData.get("installation") || ""),
          cleaning: String(formData.get("cleaning") || ""),
          altitude: String(formData.get("altitude") || ""),
          temperature: String(formData.get("temperature") || ""),
          voltage: String(formData.get("voltage") || ""),
          frequency: String(formData.get("frequency") || ""),
          phases: String(formData.get("phases") || ""),
          projectDescription: String(formData.get("projectDescription") || ""),
          sourcePage: window.location.pathname,
          website: String(formData.get("website") || "")
        };

        try {
          const result = await submitInquiry(payload, attempt);
          if (!result.ok) {
            setStatus(result.limited ? t(locale, "Espere unos minutos antes de intentarlo de nuevo.", "Aguarde alguns minutos antes de tentar novamente.", "Please wait a few minutes before trying again.") : copy.quoteForm.failed);
            return;
          }
          setStatus(result.id ? copy.quoteForm.success.replace(/[.!]$/, "") + ". " + t(locale, "Referencia", "Referência", "Reference") + " " + result.id : copy.quoteForm.success);
          form.reset();
        } catch {
          setStatus(copy.quoteForm.connectError);
        } finally {
          pending.current = false;
          setLoading(false);
        }
      }}
    >
      <label>{copy.quoteForm.name}<input name="name" autoComplete="name" maxLength={140} required /></label>
      <label>{copy.quoteForm.country}<select name="country" autoComplete="country-name" required>
        <option value="">{copy.quoteForm.select}</option>{countries.map(([code, country]) => <option value={country} key={code}>{region.of(code)}</option>)}
        <option value="Other">{t(locale, "Otro país", "Outro país", "Other country")}</option>
      </select></label>
      <label>{copy.quoteForm.email}<input type="email" name="email" autoComplete="email" maxLength={254} placeholder="name@company.com" /></label>
      <label>{copy.quoteForm.phone}<input type="tel" name="whatsapp" autoComplete="tel" maxLength={24} placeholder="+56..." /></label>
      <label>{copy.quoteForm.product}<input name="product" maxLength={240} defaultValue={initialProduct} placeholder={copy.quoteForm.productPlaceholder} required /></label>
      <label>{copy.quoteForm.material}<input name="material" placeholder={copy.quoteForm.materialPlaceholder} /></label>
      <label className="full">{copy.quoteForm.message}<textarea name="projectDescription" rows={4} maxLength={4000} placeholder={copy.quoteForm.messagePlaceholder} required /></label>
      <details className="optional-fields full">
        <summary>{copy.quoteForm.optional}</summary>
        <div className="optional-grid">
          <label>{copy.quoteForm.company}<input name="company" autoComplete="organization" /></label>
          <label>{copy.quoteForm.region}<input name="region" /></label>
          <label>{copy.quoteForm.industry}<input name="industry" /></label>
          <label>{copy.quoteForm.capacity}<input name="capacity" placeholder="t/h" /></label>
          <label>{copy.quoteForm.beltWidth}<input name="beltWidth" placeholder="mm" /></label>
          <label>{copy.quoteForm.suspensionHeight}<input name="suspensionHeight" placeholder="mm" /></label>
          <label>{copy.quoteForm.installation}<select name="installation"><option value="">{copy.quoteForm.select}</option><option value="Cross-belt">{t(locale, "Transversal a la correa", "Transversal à correia", "Cross-belt")}</option><option value="Inline">{t(locale, "En línea", "Em linha", "Inline")}</option><option value="Above chute">{t(locale, "Sobre el chute", "Sobre a calha", "Above the chute")}</option><option value="To confirm">{t(locale, "Por confirmar", "A confirmar", "To confirm")}</option></select></label>
          <label>{copy.quoteForm.cleaning}<select name="cleaning"><option value="">{copy.quoteForm.select}</option><option>Manual</option><option value="Self-cleaning">{t(locale, "Autolimpiante", "Autolimpante", "Self-cleaning")}</option><option value="To confirm">{t(locale, "Por confirmar", "A confirmar", "To confirm")}</option></select></label>
          <label>{copy.quoteForm.voltage}<input name="voltage" placeholder="V" /></label>
          <label>{copy.quoteForm.language}<select name="language" defaultValue={locale === "pt-br" ? "Portuguese" : locale === "en" ? "English" : "Spanish"}><option value="Spanish">Español</option><option value="Portuguese">Português</option><option value="English">English</option></select></label>
        </div>
      </details>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
      <label className="consent full"><input type="checkbox" required /> {copy.quoteForm.consent}</label>
      <details className="optional-fields full">
        <summary>{t(locale, "Cómo usamos sus datos", "Como usamos seus dados", "How we use your information")}</summary>
        <p>{t(locale, "El equipo de Cowinmagnet usa sus datos de contacto y del proyecto para responder y dar seguimiento a su solicitud. Para consultar o corregir sus datos, escriba a", "A equipe Cowinmagnet usa os dados de contato e do projeto para responder e acompanhar sua solicitação. Para consultar ou corrigir seus dados, escreva para", "Cowinmagnet uses your contact and project details to respond and follow up on this enquiry. To ask about or correct your details, contact")} <a href="mailto:info@cowinmagnet.com">info@cowinmagnet.com</a>.</p>
      </details>
      <button className="btn" type="submit" disabled={loading}>{loading ? copy.quoteForm.submitting : copy.quoteForm.submit}</button>
      <p className="form-status" role="status">{status}</p>
    </form>
  );
}
