import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
};

export default function DatenschutzPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Datenschutzerklaerung</h1>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">1. Verantwortlicher</h2>
            <p>
              WAMOCON GmbH<br />
              Mergenthalerallee 79-81<br />
              65760 Eschborn, Deutschland<br />
              E-Mail: info@wamocon.com
            </p>

            <h2 className="text-xl font-semibold">2. Erhobene Daten</h2>
            <p>
              Wir erheben und verarbeiten folgende Daten:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>E-Mail-Adresse (bei Registrierung)</li>
              <li>Produktanalyse-Anfragen und -Ergebnisse</li>
              <li>IP-Adresse (fuer Rate-Limiting, anonymisiert)</li>
              <li>Nutzungsdaten (Analytics, cookiefrei via Plausible)</li>
            </ul>

            <h2 className="text-xl font-semibold">3. Zweck der Verarbeitung</h2>
            <p>
              Ihre Daten werden ausschliesslich zur Bereitstellung des BuyRight AI
              Dienstes, zur Missbrauchsvermeidung und zur Verbesserung unserer
              Dienste verwendet.
            </p>

            <h2 className="text-xl font-semibold">4. Rechtsgrundlage</h2>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b
              DSGVO (Vertragserfullung) und Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse).
            </p>

            <h2 className="text-xl font-semibold">5. Datenspeicherung</h2>
            <p>
              Ihre Daten werden auf Servern in der EU gespeichert (Supabase).
              Hochgeladene Bilder werden nach der Analyse automatisch geloescht.
            </p>

            <h2 className="text-xl font-semibold">6. Ihre Rechte</h2>
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Loeschung,
              Einschraenkung der Verarbeitung, Datenubertragbarkeit und
              Widerspruch. Kontaktieren Sie uns unter info@wamocon.com.
            </p>

            <h2 className="text-xl font-semibold">7. Cookies</h2>
            <p>
              BuyRight AI verwendet ausschliesslich technisch notwendige Cookies
              fuer die Authentifizierung. Fuer Analytics nutzen wir Plausible,
              welches ohne Cookies arbeitet.
            </p>

            <h2 className="text-xl font-semibold">8. Datenloeschung</h2>
            <p>
              Sie koennen jederzeit die Loeschung aller Ihrer Daten in den
              Dashboard-Einstellungen anfordern oder uns per E-Mail kontaktieren.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
