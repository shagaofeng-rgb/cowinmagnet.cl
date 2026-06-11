"use client";

import { useState } from "react";
import { Locale, uiText } from "@/data/site";

export function QuoteForm({ locale = "es-cl" }: { locale?: Locale }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const copy = uiText[locale] ?? uiText["es-cl"];

  return (
    <form
      className="quote-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) {
          setStatus(copy.quoteForm.reviewRequired);
          form.reportValidity();
          return;
        }

        setLoading(true);
        setStatus(copy.quoteForm.sending);
        const formData = new FormData(form);
        const payload = {
          name: String(formData.get("name") || ""),
          company: String(formData.get("company") || ""),
          country: String(formData.get("country") || ""),
          region: String(formData.get("region") || ""),
          email: String(formData.get("email") || ""),
          whatsapp: String(formData.get("whatsapp") || ""),
          language: String(formData.get("language") || ""),
          product: String(formData.get("product") || ""),
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
          attachmentNames: Array.from(formData.getAll("attachments")).map((file) => file instanceof File ? file.name : String(file)).filter(Boolean),
          projectDescription: String(formData.get("projectDescription") || ""),
          sourcePage: window.location.pathname
        };

        try {
          const response = await fetch("/api/inquiry", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          if (!response.ok || !result.success) {
            setStatus(result.error || copy.quoteForm.failed);
            return;
          }
          setStatus(`${copy.quoteForm.success}: ${result.data.id}`);
          form.reset();
        } catch {
          setStatus(copy.quoteForm.connectError);
        } finally {
          setLoading(false);
        }
      }}
    >
      <label>{copy.quoteForm.name}<input name="name" autoComplete="name" required /></label>
      <label>{copy.quoteForm.country}<select name="country" required><option value="">{copy.quoteForm.select}</option><option>Chile</option><option>Peru</option><option>Brazil</option><option>Argentina</option><option>Bolivia</option><option>Colombia</option><option>Ecuador</option><option>Other LATAM</option></select></label>
      <label>{copy.quoteForm.phone}<input name="whatsapp" autoComplete="tel" placeholder="+56..." /></label>
      <label>{copy.quoteForm.email}<input type="email" name="email" autoComplete="email" placeholder="name@company.com" /></label>
      <label>{copy.quoteForm.product}<input name="product" placeholder={copy.quoteForm.productPlaceholder} required /></label>
      <label>{copy.quoteForm.material}<input name="material" placeholder={copy.quoteForm.materialPlaceholder} /></label>
      <label className="full">{copy.quoteForm.message}<textarea name="projectDescription" rows={4} placeholder={copy.quoteForm.messagePlaceholder} required /></label>
      <details className="optional-fields full">
        <summary>{copy.quoteForm.optional}</summary>
        <div className="optional-grid">
          <label>{copy.quoteForm.company}<input name="company" autoComplete="organization" /></label>
          <label>{copy.quoteForm.region}<input name="region" /></label>
          <label>{copy.quoteForm.industry}<input name="industry" /></label>
          <label>{copy.quoteForm.capacity}<input name="capacity" placeholder="t/h" /></label>
          <label>{copy.quoteForm.beltWidth}<input name="beltWidth" placeholder="mm" /></label>
          <label>{copy.quoteForm.suspensionHeight}<input name="suspensionHeight" placeholder="mm" /></label>
          <label>{copy.quoteForm.installation}<select name="installation"><option value="">{copy.quoteForm.select}</option><option>Cross-belt</option><option>Inline</option><option>Above chute</option><option>To confirm</option></select></label>
          <label>{copy.quoteForm.cleaning}<select name="cleaning"><option value="">{copy.quoteForm.select}</option><option>Manual</option><option>Automatic</option><option>Self-cleaning</option><option>To confirm</option></select></label>
          <label>{copy.quoteForm.voltage}<input name="voltage" placeholder="V" /></label>
          <label>{copy.quoteForm.language}<select name="language"><option>Spanish</option><option>Portuguese</option><option>English</option></select></label>
          <label className="full">{copy.quoteForm.attachments}<input name="attachments" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" /></label>
        </div>
      </details>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
      <label className="consent full"><input type="checkbox" required /> {copy.quoteForm.consent}</label>
      <button className="button primary" type="submit" disabled={loading}>{loading ? copy.quoteForm.submitting : copy.quoteForm.submit}</button>
      <p className="form-status" role="status">{status}</p>
    </form>
  );
}
