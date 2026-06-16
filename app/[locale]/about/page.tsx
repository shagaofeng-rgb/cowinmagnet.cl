import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { companySections } from "@/data/brief";
import { Locale, localizedPath } from "@/data/site";

export const metadata = { title: "About Us" };

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "About Us" }]} />
      <HeroBanner eyebrow="About" title="About Cowin Magnetic" summary="Professional supplier of magnetic separation equipment and metal recovery solutions for mining, recycling, aggregates and bulk material handling." image="/assets/brief/rcdc-air-cooled-self-cleaning-electromagnetic-separator.png" />
      <section className="band brief-page">
        <div className="brief-stack">
          {companySections.map((section) => (
            <article className="brief-text-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
        <div className="brief-cta">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Tell us your material and operating conditions</h2>
            <p>We can recommend the suitable magnetic separator after reviewing material type, conveyor width, capacity and separation target.</p>
          </div>
          <Link className="button primary" href={localizedPath(locale, "contact")}>Contact us</Link>
        </div>
      </section>
    </>
  );
}
