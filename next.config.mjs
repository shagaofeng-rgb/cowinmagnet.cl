/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {},
  async redirects() {
    return [
      { source: "/index.html", destination: "/es-cl", permanent: true },
      { source: "/productos.html", destination: "/es-cl/products", permanent: true },
      { source: "/aplicaciones.html", destination: "/es-cl/industries", permanent: true },
      { source: "/mercados.html", destination: "/es-cl/markets", permanent: true },
      { source: "/nosotros.html", destination: "/es-cl/about", permanent: true },
      { source: "/cotizacion.html", destination: "/es-cl/request-a-quote", permanent: true },
      { source: "/recursos.html", destination: "/es-cl/downloads", permanent: true },
      { source: "/soluciones.html", destination: "/es-cl/solutions", permanent: true }
    ];
  }
};

export default nextConfig;
