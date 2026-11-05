import { t, type Locale } from "@/data/site";

export function technicalResources(locale: Locale) {
  return [
    {
      title: t(locale, "Cuestionario de selección para cinta transportadora", "Questionário de seleção para correia transportadora", "Conveyor equipment selection questionnaire"),
      summary: t(locale, "Datos de material, cinta y capacidad.", "Dados de material, correia e capacidade.", "Material, conveyor and capacity data."),
      href: "/downloads/selection-questionnaire.txt",
      format: "TXT"
    },
    {
      title: t(locale, "Checklist de instalación y mantenimiento", "Checklist de instalação e manutenção", "Installation and maintenance checklist"),
      summary: t(locale, "Puntos de revisión antes de la puesta en marcha.", "Pontos de verificação antes da partida.", "Checks to complete before commissioning."),
      href: "/downloads/installation-maintenance-checklist.txt",
      format: "TXT"
    },
    {
      title: t(locale, "Campos técnicos para cotización", "Dados técnicos para cotação", "Technical fields for quotation"),
      summary: t(locale, "Plantilla con datos de proyecto para la consulta.", "Modelo de dados do projeto para a consulta.", "Project data template for your enquiry."),
      href: "/downloads/quotation-data-fields.csv",
      format: "CSV"
    }
  ];
}
