"use client";

import { useState } from "react";

export function QuoteForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="quote-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) {
          setStatus("Revise los campos obligatorios.");
          form.reportValidity();
          return;
        }

        setLoading(true);
        setStatus("Enviando solicitud...");
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
            setStatus(result.error || "No se pudo enviar la solicitud.");
            return;
          }
          setStatus(`Solicitud guardada: ${result.data.id}`);
          form.reset();
        } catch {
          setStatus("No se pudo conectar con el servidor.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <label>Nombre<input name="name" autoComplete="name" required /></label>
      <label>Pais<select name="country" required><option value="">Seleccionar</option><option>Chile</option><option>Peru</option><option>Brazil</option><option>Argentina</option><option>Bolivia</option><option>Colombia</option><option>Ecuador</option><option>Other LATAM</option></select></label>
      <label>WhatsApp o telefono<input name="whatsapp" autoComplete="tel" placeholder="+56..." /></label>
      <label>Correo<input type="email" name="email" autoComplete="email" placeholder="name@company.com" /></label>
      <label>Producto o necesidad<input name="product" placeholder="Separador magnetico, detector, reciclaje..." required /></label>
      <label>Material o industria<input name="material" placeholder="Cobre, hierro, aridos, reciclaje..." /></label>
      <label className="full">Mensaje breve<textarea name="projectDescription" rows={4} placeholder="Cuente en 2-3 lineas que quiere separar, proteger o cotizar." required /></label>
      <details className="optional-fields full">
        <summary>Agregar datos tecnicos opcionales</summary>
        <div className="optional-grid">
          <label>Empresa<input name="company" autoComplete="organization" /></label>
          <label>Ciudad o region<input name="region" /></label>
          <label>Industria<input name="industry" /></label>
          <label>Capacidad<input name="capacity" placeholder="t/h" /></label>
          <label>Ancho de cinta<input name="beltWidth" placeholder="mm" /></label>
          <label>Altura de instalacion<input name="suspensionHeight" placeholder="mm" /></label>
          <label>Instalacion<select name="installation"><option value="">Seleccionar</option><option>Transversal</option><option>En linea</option><option>Sobre chute</option><option>Por confirmar</option></select></label>
          <label>Limpieza<select name="cleaning"><option value="">Seleccionar</option><option>Manual</option><option>Automatica</option><option>Autolimpiante</option><option>Por confirmar</option></select></label>
          <label>Voltaje<input name="voltage" placeholder="V" /></label>
          <label>Idioma preferido<select name="language"><option>Spanish</option><option>Portuguese</option><option>English</option></select></label>
          <label className="full">Archivos adjuntos<input name="attachments" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" /></label>
        </div>
      </details>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
      <label className="consent full"><input type="checkbox" required /> Acepto que Cowinmagnet use estos datos para responder mi consulta.</label>
      <button className="button primary" type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar solicitud"}</button>
      <p className="form-status" role="status">{status}</p>
    </form>
  );
}
