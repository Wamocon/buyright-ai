import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB",
};

export default function AGBPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Allgemeine Geschaeftsbedingungen</h1>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">1. Geltungsbereich</h2>
            <p>
              Diese AGB gelten fuer die Nutzung der Plattform BuyRight AI,
              betrieben von WAMOCON GmbH, Eschborn.
            </p>

            <h2 className="text-xl font-semibold">2. Leistungsbeschreibung</h2>
            <p>
              BuyRight AI bietet KI-gestutzte Produktanalysen. Die Analysen
              dienen als Entscheidungshilfe und stellen keine Kaufberatung im
              rechtlichen Sinne dar.
            </p>

            <h2 className="text-xl font-semibold">3. Nutzungsbedingungen</h2>
            <p>
              Nutzer erhalten im Free-Plan 3 Analysen pro Tag. Der Pro-Plan
              bietet unbegrenzte Analysen gegen eine monatliche Gebuhr.
            </p>

            <h2 className="text-xl font-semibold">4. Haftungsausschluss</h2>
            <p>
              BuyRight AI uebernimmt keine Haftung fuer Kaufentscheidungen, die
              auf Basis der Analysen getroffen werden. Die Ergebnisse basieren
              auf KI-Modellen und koennen Ungenauigkeiten enthalten.
            </p>

            <h2 className="text-xl font-semibold">5. Preise und Zahlung</h2>
            <p>
              Die Zahlung fuer den Pro-Plan erfolgt monatlich ueber Stripe.
              Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.
            </p>

            <h2 className="text-xl font-semibold">6. Kuendigung</h2>
            <p>
              Der Pro-Plan kann jederzeit zum Ende des Abrechnungszeitraums
              gekuendigt werden. Nach Kuendigung wird der Account auf den
              Free-Plan zurueckgestuft.
            </p>

            <h2 className="text-xl font-semibold">7. Schlussbestimmungen</h2>
            <p>
              Es gilt deutsches Recht. Gerichtsstand ist Frankfurt am Main.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
