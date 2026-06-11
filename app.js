(() => {
  const notice = document.createElement("div");
  notice.className = "legacy-next-notice";
  notice.innerHTML = [
    "<strong>Next.js preview activo</strong>",
    "<span>Esta maqueta estatica queda solo como archivo historico. Use la version local Next.js en <a href=\"/es-cl/\">/es-cl/</a>.</span>"
  ].join("");
  document.addEventListener("DOMContentLoaded", () => {
    document.body.prepend(notice);
  });
})();
