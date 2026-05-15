import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Impressum</h1>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <h2 className="text-xl font-semibold">WAMOCON GmbH</h2>
            <p>
              Mergenthalerallee 79-81<br />
              65760 Eschborn<br />
              Deutschland
            </p>

            <h3 className="text-lg font-semibold">Kontakt</h3>
            <p>
              Telefon: +49 6196 5838311<br />
              E-Mail: info@wamocon.com<br />
              Projektkontakt: support@buyright.ai
            </p>

            <h3 className="text-lg font-semibold">Vertretungsberechtigter Geschaeftsfuehrer</h3>
            <p>Dipl.-Ing. Waleri Moretz</p>

            <h3 className="text-lg font-semibold">Registereintrag</h3>
            <p>
              Sitz der Gesellschaft: Eschborn<br />
              Handelsregister: Eschborn HRB 123666<br />
              Umsatzsteuer-Identifikationsnummer: DE344930486
            </p>

            <h3 className="text-lg font-semibold">Angaben zum Angebot</h3>
            <p>
              BuyRight AI ist eine webbasierte Software-as-a-Service-Plattform fuer
              KI-gestutzte Produktanalyse vor dem Kauf. Das Angebot richtet sich an
              Verbraucher und gewerbliche Nutzer.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
