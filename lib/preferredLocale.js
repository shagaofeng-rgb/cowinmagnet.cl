const supported = new Set(["es-cl", "es", "pt-br", "en"]);
const crawler = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp/i;

export function preferredLocale({ saved = "", userAgent = "", languages = "", country = "" } = {}) {
  if (crawler.test(userAgent)) return "es-cl";
  const choice = saved.toLowerCase();
  if (supported.has(choice)) return choice;

  const accepted = languages.slice(0, 2048).split(",").map((value, index) => {
    const [tag, ...parameters] = value.toLowerCase().split(";").map((item) => item.trim());
    const quality = parameters.find((item) => item.startsWith("q="));
    const q = quality ? Number(quality.slice(2)) : 1;
    const [base] = tag.split("-");
    return { locale: base === "es" ? "es-cl" : base === "pt" ? "pt-br" : base === "en" ? "en" : "", q, index };
  }).filter(({ locale, q }) => locale && q > 0 && q <= 1);
  accepted.sort((a, b) => b.q - a.q || a.index - b.index);
  return accepted[0]?.locale || (country === "BR" ? "pt-br" : "es-cl");
}
