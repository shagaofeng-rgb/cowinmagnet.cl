function siteHeader() {
  return `
    <header class="site-header">
      <a class="brand" href="index.html" aria-label="Cowinmagnet LATAM inicio">
        <img src="assets/logo.jpg" alt="Cowinmagnet">
        <span>LATAM</span>
      </a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav id="site-nav" class="site-nav" aria-label="Navegacion principal">
        <div class="nav-item has-mega" data-mega="productos">
          <button class="nav-trigger" type="button" aria-expanded="false">Productos</button>
          <div class="mega-menu" role="region" aria-label="Productos">
            <div class="mega-feature"><span class="eyebrow">Product Center</span><h3>Separacion magnetica para mineria y manejo de materiales</h3><p>Explore series permanentes, electromagneticas y componentes antes de enviar datos de seleccion.</p><a class="mega-cta" href="productos.html">Ver productos</a></div>
            <div class="mega-columns">
              <div><h4>Categorias</h4><button type="button" data-footer-filter="permanent">Permanent Magnet Series</button><button type="button" data-footer-filter="electro">Electromagnetic Series</button><button type="button" data-footer-filter="components">Rollers, Bars & Components</button><button type="button" data-footer-filter="application">Industry Applications</button></div>
              <div><h4>Productos destacados</h4><button type="button" data-product="mineria">Separador para Mineria</button><button type="button" data-product="overband">Separador Overband</button><button type="button" data-product="electromagnetico">Separador Electromagnetico</button><button type="button" data-product="polea">Polea Magnetica</button></div>
            </div>
          </div>
        </div>
        <div class="nav-item has-mega" data-mega="aplicaciones">
          <button class="nav-trigger" type="button" aria-expanded="false">Aplicaciones</button>
          <div class="mega-menu mega-compact" role="region" aria-label="Aplicaciones">
            <div class="mega-feature"><span class="eyebrow">Industry Solutions</span><h3>Aplicaciones por material, proceso y riesgo</h3><p>Abra una capa de aplicacion para revisar datos tecnicos necesarios antes de cotizar.</p><a class="mega-cta" href="aplicaciones.html">Ver aplicaciones</a></div>
            <div class="mega-card-grid"><button type="button" data-application="cobre"><strong>Cobre</strong><span>Chile, Peru y proyectos regionales.</span></button><button type="button" data-application="trituracion"><strong>Plantas trituradoras</strong><span>Proteccion antes de chancadores.</span></button><button type="button" data-application="cemento"><strong>Cemento y agregados</strong><span>Caliza, clinker, arena y grava.</span></button><button type="button" data-application="transportadores"><strong>Transportadores</strong><span>Overband, suspendidos y poleas.</span></button></div>
          </div>
        </div>
        <div class="nav-item has-mega" data-mega="mercados">
          <button class="nav-trigger" type="button" aria-expanded="false">Mercados</button>
          <div class="mega-menu mega-market" role="region" aria-label="Mercados">
            <div class="mega-feature"><span class="eyebrow">LATAM Markets</span><h3>Chile y Peru como mercados principales</h3><p>Contenido regional sin declarar oficinas, stock ni casos locales no verificados.</p><a class="mega-cta" href="mercados.html">Ver mercados</a></div>
            <div class="mega-chip-grid"><button type="button" data-market="chile">Chile</button><button type="button" data-market="peru">Peru</button><button type="button" data-market="bolivia">Bolivia</button><button type="button" data-market="ecuador">Ecuador</button><button type="button" data-market="colombia">Colombia</button><button type="button" data-market="latam">America Latina</button></div>
          </div>
        </div>
        <a href="soluciones.html">Soluciones</a>
        <a href="recursos.html">Recursos</a>
        <a href="nosotros.html">Nosotros</a>
        <a class="quote-link" href="cotizacion.html">Cotizacion</a>
      </nav>
    </header>
  `;
}

function siteFooter() {
  return `
    <footer class="footer" id="footer">
      <div class="footer-cta"><div><span class="eyebrow">Quote Support</span><h2>Necesita ayuda para seleccionar equipos magneticos?</h2><p>Envie ancho de cinta, material, altura de instalacion y nivel de contaminacion ferrosa para una revision inicial.</p></div><a class="button primary" href="cotizacion.html">Solicitar cotizacion</a></div>
      <div class="footer-grid">
        <div class="footer-brand"><a class="footer-brand-mark" href="index.html" aria-label="Cowinmagnet LATAM home"><img src="assets/logo.jpg" alt="Cowinmagnet"><span>COWIN MAGNET LATAM</span></a><p>Equipos de separacion magnetica para compradores B2B en mineria, cemento, agregados, reciclaje y manejo de materiales.</p><div class="footer-badges"><span>OEM/ODM</span><span>Global B2B</span><span>Service First</span></div></div>
        <div class="footer-column"><h3>Navigation</h3><ul><li><a href="index.html">Inicio</a></li><li><a href="productos.html">Productos</a></li><li><a href="aplicaciones.html">Aplicaciones</a></li><li><a href="mercados.html">Mercados</a></li><li><a href="nosotros.html">Nosotros</a></li><li><a href="cotizacion.html">Contacto</a></li></ul></div>
        <div class="footer-column"><h3>Products</h3><ul><li><button type="button" data-footer-filter="permanent">Permanent Magnet Series</button></li><li><button type="button" data-footer-filter="electro">Electromagnetic Series</button></li><li><button type="button" data-footer-filter="components">Magnetic Rollers & Bars</button></li><li><button type="button" data-footer-filter="application">Industry Applications</button></li></ul></div>
        <div class="footer-contact-card"><h3>Contacts</h3><p class="footer-contact-line">Quzhou Qiying Import & Export Co., Ltd.</p><a class="footer-contact-line" href="tel:+8615665135205">+86 156 6513 5205</a><a class="footer-contact-line" href="mailto:davidsha@cowinmagnet.com">davidsha@cowinmagnet.com</a><div class="footer-chat"><span>Chat now</span><a href="https://wa.me/8615665135205" target="_blank" rel="noopener noreferrer nofollow">WhatsApp</a></div></div>
        <div class="footer-connect"><h3>Connect</h3><div class="footer-qr"><div class="qr-placeholder">WA</div><span>WhatsApp QR placeholder</span></div><div class="footer-social-buttons" aria-label="Social links"><a href="https://wa.me/8615665135205" target="_blank" rel="noopener noreferrer nofollow">WhatsApp</a><a href="https://www.facebook.com/cwmagnet" target="_blank" rel="noopener noreferrer nofollow">Facebook</a><a href="https://www.tiktok.com/@cowinmagnet" target="_blank" rel="noopener noreferrer nofollow">TikTok</a></div></div>
      </div>
      <div class="footer-bottom"><span>2026 Quzhou Qiying Import & Export Co., Ltd.</span><span>SITE_ID=cowinmagnet_latam | Local noindex | <a href="robots.txt">Robots</a> | <a href="sitemap.xml">Sitemap</a> | <a href="docs/audit-report.md">Audit report</a></span></div>
    </footer>
    <a href="https://wa.me/8615665135205" class="whatsapp-float" target="_blank" rel="noopener noreferrer nofollow" aria-label="Contact Cowinmagnet on WhatsApp">WA</a>
  `;
}

document.querySelector('[data-shell="header"]')?.insertAdjacentHTML('afterbegin', siteHeader());
document.querySelector('[data-shell="footer"]')?.insertAdjacentHTML('afterbegin', siteFooter());
