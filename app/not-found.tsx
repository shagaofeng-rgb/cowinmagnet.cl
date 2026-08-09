import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="eyebrow">404</p>
      <h1>Página no encontrada</h1>
      <p>La dirección puede haber cambiado o ya no estar disponible.</p>
      <Link className="button primary" href="/es-cl">Volver al inicio</Link>
    </main>
  );
}
