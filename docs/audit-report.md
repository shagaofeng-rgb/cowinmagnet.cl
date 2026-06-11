# Cowinmagnet LATAM Local Audit Report

## Estado

Sitio local generado para revision previa a produccion. No se compro dominio, no se abrio servidor externo, no se desplego produccion y no se modifico cowinmagnet.com.

## Resumen tecnico

- Tipo actual: static HTML/CSS/JS para preview local y Next.js App Router como fuente de despliegue.
- SITE_ID: `cowinmagnet_latam`.
- Idioma por defecto Next.js: `es-cl`.
- Soporte previsto Next.js: `es-cl,es,pt-br,en`.
- Moneda por defecto: `USD`.
- Referencia: `CLP,PEN`.
- Backend timezone previsto: `UTC`.
- Frontend timezone previsto: `America/Santiago` y `America/Lima`.
- Robots local: `noindex,nofollow` y `Disallow: /`.

## Alcance implementado

- Home regional en espanol latinoamericano.
- Estructura de productos con 18 paginas/entradas previstas.
- Mercados independientes: Chile, Peru, Bolivia, Ecuador, Colombia y America Latina.
- Glosario tecnico inicial.
- Formulario local de inquiry con validacion de navegador y registro localStorage no sensible.
- Sitemap y robots locales.
- Declaraciones anti-ficcion: sin fabrica, oficina, bodega, stock, equipo local, clientes o proyectos no verificados.
- Imagenes industriales generadas para maqueta local, marcadas como ilustrativas.
- Interacciones locales: detalle por producto, mercado y aplicacion; tabs por capa; envio de detalle a cotizacion; revision local en localStorage.
- Footer inspirado en el sitio global: quote CTA, marca, navigation, products, contacts, connect y acceso flotante a WhatsApp.
- Mega menu superior: panel centrado con efecto glass, columnas de productos, tarjetas de aplicaciones, mercados LATAM, soporte hover/click/ESC y version movil desplegable.
- Paginas dedicadas creadas: `productos.html`, `aplicaciones.html`, `mercados.html`, `soluciones.html`, `recursos.html`, `nosotros.html`, `cotizacion.html`. La navegacion principal ya no depende de saltos a secciones del home.
- Fuente Next.js creada en `app/[locale]`: home, productos, categorias, producto detalle, industrias, soluciones, mercados, regiones de Chile, soporte tecnico, downloads, about, blog, contacto, cotizacion y search.
- La fuente Next.js usa rutas reales y enlaces internos con Next `Link`; no depende de anchors del home para la navegacion principal.
- Catalogo Next.js sincronizado con la pagina publica principal `https://www.cowinmagnet.com/en/products`: 5 categorias y 88 nombres de producto. Los parametros tecnicos quedan como campos a confirmar antes de produccion.
- Backend actualizado segun el patron del sitio principal Cowinmagnet: `lib/cmsStore.js`, `lib/adminAuth.js`, `lib/adminAccountStore.js`, API routes bajo `app/api/admin/*`, login protegido por cookie httpOnly y almacenamiento PostgreSQL via `DATABASE_URL` con fallback local `.data`.
- Inquiry frontend conectado a `app/api/inquiry/route.js`; las solicitudes se guardan en base de datos cuando existe `DATABASE_URL` o en `.data/enquiries.json` durante preview local.
- Admin de LATAM ampliado para igualar la estructura funcional del sitio principal: datos generales, analitica, SEO, productos, noticias, auditoria de enlaces, visitantes, paginas, recorridos, inquiries y ajustes. Las rutas nuevas son `/admin/analytics`, `/admin/search-console`, `/admin/news`, `/admin/link-audit`, `/admin/visitors`, `/admin/pages` y `/admin/journeys`.
- Analytics local conectado por `lib/analyticsStore.js`, `/api/analytics/track`, `/api/admin/analytics` y `/api/admin/sync-status`, con PostgreSQL mediante `DATABASE_URL` o fallback `.data/analytics-events.json` para preview.
- Preview Next.js local generado en `http://localhost:8092` usando `start-next-preview.ps1`; el antiguo preview temporal de puerto 8091 fue detenido para evitar confusion.

## Imagenes locales

- `assets/generated/latam-mining-overband.png`
- `assets/generated/product-permanent-separator.png`
- `assets/generated/product-electromagnetic-separator.png`
- `assets/generated/product-magnetic-components.png`
- `assets/generated/application-cement-aggregates.png`

Estas imagenes no deben tratarse como fotos reales de producto, fabrica, cliente o proyecto. Antes de produccion, reemplazar por imagenes verificadas o mantener disclosure visible de ilustracion.

## Pendiente antes de produccion

- Confirmar dominio, presupuesto y reglas de registro.
- Crear deployment independiente.
- Crear base de datos o schema independiente.
- Configurar almacenamiento de imagenes independiente.
- Configurar CAPTCHA, rate limit, correo, logs sanitizados y exportacion de inquiries.
- Sincronizar productos e imagenes reales desde la fuente global sin sobrescribir campos locales.
- Configurar Analytics y Search Console independientes.
- Ejecutar responsive, SEO, seguridad, performance y rollback tests.

## Rollback

Como este entregable es local y estatico, el rollback consiste en detener el servidor local y restaurar o borrar los archivos generados en este directorio.
