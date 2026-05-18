/**
 * BuyRight AI – Produkthandbuch Generator
 * Erzeugt ein vollständiges professionelles Produkthandbuch als .docx
 * Ausführen: node scripts/generate-produkthandbuch.mjs
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  TableLayoutType,
  LevelFormat,
  NumberFormat,
  convertInchesToTwip,
  LineRuleType,
  UnderlineType,
  PageNumber,
  Header,
  Footer,
  PageOrientation,
} from "docx";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../public/BuyRight_AI_Produkthandbuch.docx");

// ─────────────────────────────────────────────
// FARB- UND STIL-KONSTANTEN
// ─────────────────────────────────────────────
const C = {
  primary:   "4F46E5", // Indigo
  dark:      "1E1B4B", // Dunkel-Indigo
  accent:    "7C3AED", // Violett
  light:     "EEF2FF", // Hellblau
  success:   "059669", // Grün
  warning:   "D97706", // Gelb
  danger:    "DC2626", // Rot
  gray900:   "111827",
  gray700:   "374151",
  gray500:   "6B7280",
  gray200:   "E5E7EB",
  white:     "FFFFFF",
};

// ─────────────────────────────────────────────
// HILFSFUNKTIONEN
// ─────────────────────────────────────────────
const pt = (n) => n * 20;            // Punkte → Twips (für Spacing)
const hp = (n) => n * 2;             // Punkte → Half-Points (für Font-Size)
const em = convertInchesToTwip;

function heading1(text, options = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: pt(20), after: pt(8) },
    ...options,
    children: [
      new TextRun({
        text,
        bold: true,
        size: hp(22),
        color: C.dark,
        font: "Calibri",
      }),
    ],
  });
}

function heading2(text, options = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: pt(14), after: pt(6) },
    ...options,
    children: [
      new TextRun({
        text,
        bold: true,
        size: hp(16),
        color: C.primary,
        font: "Calibri",
      }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: pt(10), after: pt(4) },
    children: [
      new TextRun({
        text,
        bold: true,
        size: hp(13),
        color: C.gray700,
        font: "Calibri",
      }),
    ],
  });
}

function body(text, options = {}) {
  return new Paragraph({
    spacing: { after: pt(6), line: 276, lineRule: LineRuleType.AUTO },
    ...options,
    children: [
      new TextRun({
        text,
        size: hp(11),
        color: C.gray700,
        font: "Calibri",
        ...options.run,
      }),
    ],
  });
}

function bold(text, color = C.gray900) {
  return new TextRun({ text, bold: true, size: hp(11), color, font: "Calibri" });
}

function normal(text) {
  return new TextRun({ text, size: hp(11), color: C.gray700, font: "Calibri" });
}

function mixed(...runs) {
  return new Paragraph({
    spacing: { after: pt(6), line: 276, lineRule: LineRuleType.AUTO },
    children: runs,
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: pt(4) },
    children: [
      new TextRun({ text, size: hp(11), color: C.gray700, font: "Calibri" }),
    ],
  });
}

function bulletBold(label, text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: pt(4) },
    children: [
      new TextRun({ text: label + " ", bold: true, size: hp(11), color: C.gray900, font: "Calibri" }),
      new TextRun({ text, size: hp(11), color: C.gray700, font: "Calibri" }),
    ],
  });
}

function spacer(pts = 8) {
  return new Paragraph({ spacing: { after: pt(pts) }, children: [] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function hr() {
  return new Paragraph({
    spacing: { before: pt(8), after: pt(8) },
    border: { bottom: { color: C.gray200, size: 6, style: BorderStyle.SINGLE } },
    children: [],
  });
}

function infoBox(label, text, bgColor = C.light) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: bgColor },
            borders: {
              top:    { style: BorderStyle.SINGLE, size: 1, color: C.primary },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: C.primary },
              left:   { style: BorderStyle.THICK,  size: 12, color: C.primary },
              right:  { style: BorderStyle.NIL },
            },
            margins: { top: pt(4), bottom: pt(4), left: pt(8), right: pt(8) },
            children: [
              new Paragraph({
                spacing: { after: pt(2) },
                children: [
                  new TextRun({ text: label, bold: true, size: hp(10), color: C.primary, font: "Calibri" }),
                ],
              }),
              new Paragraph({
                spacing: { after: 0 },
                children: [
                  new TextRun({ text, size: hp(11), color: C.gray700, font: "Calibri" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function scoreRow(score, label, color = C.primary) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: pt(4), bottom: pt(4), left: pt(6), right: pt(6) },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: score, bold: true, size: hp(14), color: C.white, font: "Calibri" })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: pt(4), bottom: pt(4), left: pt(8), right: pt(6) },
            children: [
              new Paragraph({
                children: [new TextRun({ text: label, size: hp(11), color: C.gray700, font: "Calibri" })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function twoColTable(rows, header = null) {
  const headerRows = header
    ? [new TableRow({
        tableHeader: true,
        children: header.map((h) =>
          new TableCell({
            shading: { type: ShadingType.SOLID, color: C.primary },
            margins: { top: pt(4), bottom: pt(4), left: pt(6), right: pt(6) },
            children: [
              new Paragraph({
                children: [new TextRun({ text: h, bold: true, size: hp(11), color: C.white, font: "Calibri" })],
              }),
            ],
          })
        ),
      })]
    : [];

  const dataRows = rows.map(([a, b], i) =>
    new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? C.white : C.light },
          margins: { top: pt(3), bottom: pt(3), left: pt(6), right: pt(6) },
          children: [
            new Paragraph({
              children: [new TextRun({ text: a, bold: true, size: hp(10), color: C.gray900, font: "Calibri" })],
            }),
          ],
        }),
        new TableCell({
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? C.white : C.light },
          margins: { top: pt(3), bottom: pt(3), left: pt(6), right: pt(6) },
          children: [
            new Paragraph({
              children: [new TextRun({ text: b, size: hp(10), color: C.gray700, font: "Calibri" })],
            }),
          ],
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [...headerRows, ...dataRows],
  });
}

function coverTitle(text, size = 42, color = C.white) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: pt(6) },
    children: [
      new TextRun({ text, bold: true, size: hp(size), color, font: "Calibri" }),
    ],
  });
}

function coverSubtitle(text, color = "C7D2FE") {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: pt(8) },
    children: [
      new TextRun({ text, size: hp(14), color, font: "Calibri" }),
    ],
  });
}

// ─────────────────────────────────────────────
// DOKUMENT
// ─────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "numbered",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: hp(11), color: C.gray700 },
        paragraph: { spacing: { after: pt(6) } },
      },
    },
  },
  sections: [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SEITE 1 – DECKBLATT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      properties: {
        page: {
          margin: { top: em(1), bottom: em(1), left: em(1.25), right: em(1.25) },
          size: { width: em(8.27), height: em(11.69) },
        },
      },
      children: [
        spacer(60),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "●  ●  ●",
              bold: true,
              size: hp(12),
              color: C.primary,
              font: "Calibri",
            }),
          ],
        }),
        spacer(10),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "PRODUKTHANDBUCH", bold: true, size: hp(13), color: C.gray500, font: "Calibri", characterSpacing: 200 }),
          ],
        }),
        spacer(6),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "BuyRight AI", bold: true, size: hp(52), color: C.dark, font: "Calibri" }),
          ],
        }),
        spacer(4),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Der KI-gestützte Kaufberater", size: hp(20), color: C.primary, font: "Calibri" }),
          ],
        }),
        spacer(6),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { color: C.gray200, size: 4, style: BorderStyle.SINGLE } },
          children: [],
        }),
        spacer(16),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Fehlkäufe vermeiden. Klüger kaufen.", size: hp(13), color: C.gray500, font: "Calibri", italics: true }),
          ],
        }),
        spacer(60),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "www.buyrai.eu", size: hp(12), color: C.primary, font: "Calibri", underline: { type: UnderlineType.SINGLE, color: C.primary } })],
        }),
        spacer(4),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Version 1.0  |  Mai 2026", size: hp(11), color: C.gray500, font: "Calibri" })],
        }),
        spacer(10),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "WAMOCON GmbH  |  Mergenthalerallee 79-81  |  65760 Eschborn", size: hp(10), color: C.gray500, font: "Calibri" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Dipl.-Ing. Waleri Moretz  |  info@wamocon.com", size: hp(10), color: C.gray500, font: "Calibri" })],
        }),
        pageBreak(),
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // HAUPTINHALT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      properties: {
        page: {
          margin: { top: em(1), bottom: em(1.1), left: em(1.25), right: em(1.1) },
          size: { width: em(8.27), height: em(11.69) },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { color: C.gray200, size: 4, style: BorderStyle.SINGLE } },
              children: [
                new TextRun({ text: "BuyRight AI  –  Produkthandbuch  v1.0", size: hp(9), color: C.gray500, font: "Calibri" }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { color: C.gray200, size: 4, style: BorderStyle.SINGLE } },
              children: [
                new TextRun({ text: "© 2026 WAMOCON GmbH  |  www.buyrai.eu  |  Seite ", size: hp(9), color: C.gray500, font: "Calibri" }),
                new TextRun({ children: [PageNumber.CURRENT], size: hp(9), color: C.gray500, font: "Calibri" }),
                new TextRun({ text: " von ", size: hp(9), color: C.gray500, font: "Calibri" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: hp(9), color: C.gray500, font: "Calibri" }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ──────────────────────────────────────────
        // INHALTSVERZEICHNIS (manuell)
        // ──────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: pt(6) },
          children: [new TextRun({ text: "INHALTSVERZEICHNIS", bold: true, size: hp(16), color: C.dark, font: "Calibri", characterSpacing: 150 })],
        }),
        hr(),
        spacer(4),

        ...([
          ["1", "Einleitung und Produktübersicht", "3"],
          ["1.1", "Was ist BuyRight AI?", "3"],
          ["1.2", "Zielgruppe", "3"],
          ["1.3", "Systemvoraussetzungen", "3"],
          ["2", "Erste Schritte", "4"],
          ["2.1", "Registrierung und Anmeldung", "4"],
          ["2.2", "Kontoverwaltung und Profil", "4"],
          ["2.3", "Preismodelle – Free vs. Pro", "4"],
          ["3", "Tool 1: Produktanalyse", "5"],
          ["3.1", "Eingabemethoden (URL, Produktname, Bild)", "5"],
          ["3.2", "Auswertung verstehen: Score 0–100", "5"],
          ["3.3", "KAUFEN / NICHT KAUFEN / NUR WENN", "6"],
          ["3.4", "Vorteile, Nachteile und Warnhinweise", "6"],
          ["3.5", "Bessere Alternativen", "6"],
          ["4", "Tool 2: Produktvergleich", "7"],
          ["4.1", "Zwei Produkte vergleichen", "7"],
          ["4.2", "Kategorie-Sieger-Auswertung", "7"],
          ["4.3", "KI-Kaufempfehlung und Begründung", "7"],
          ["5", "Tool 3: Fake-Detektor", "8"],
          ["5.1", "Wie Fake-Erkennung funktioniert", "8"],
          ["5.2", "Vertrauens-Score und Risikoklassen", "8"],
          ["5.3", "Typische Betrugsmerkmale", "9"],
          ["6", "Tool 4: Budget-Optimierer", "10"],
          ["6.1", "Einkaufsliste und Budget eingeben", "10"],
          ["6.2", "KI-Priorisierung: Kaufen / Überspringen", "10"],
          ["6.3", "Günstigere Alternativen finden", "10"],
          ["7", "Dashboard und Analyse-Historie", "11"],
          ["8", "Datenschutz und Datensicherheit", "12"],
          ["9", "Häufig gestellte Fragen (FAQ)", "13"],
          ["10", "Support und Kontakt", "14"],
          ["11", "Rechtliche Hinweise", "15"],
        ].map(([num, title, page]) =>
          new Paragraph({
            spacing: { after: pt(4) },
            children: [
              new TextRun({ text: `${num.padEnd(6)}  ${title}`, size: hp(10.5), color: C.gray700, font: "Calibri", bold: num.length <= 1 }),
              new TextRun({ text: `  .....  ${page}`, size: hp(10.5), color: C.gray500, font: "Calibri" }),
            ],
          })
        )),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 1
        // ══════════════════════════════════════════
        heading1("1  Einleitung und Produktübersicht"),
        hr(),

        heading2("1.1  Was ist BuyRight AI?"),
        body(
          "BuyRight AI ist eine KI-gestützte Web-Anwendung, die Verbraucher dabei unterstützt, fundierte Kaufentscheidungen zu treffen. " +
          "Die Plattform analysiert Online-Produkte auf Qualität, Preis-Leistungs-Verhältnis, Fälschungsrisiko und gibt klare Empfehlungen " +
          "in Sekunden – ohne dass eine Registrierung erforderlich ist."
        ),
        body(
          "BuyRight AI vereint vier leistungsstarke KI-Tools auf einer einzigen Plattform: Produktanalyse, Produktvergleich, Fake-Detektor " +
          "und Budget-Optimierer. Die Anwendung ist vollständig browserbasiert, unterstützt Deutsch und Englisch und ist für alle Endgeräte optimiert."
        ),
        spacer(6),
        infoBox(
          "Produktzugang",
          "Web-Anwendung erreichbar unter: https://www.buyrai.eu\n" +
          "Keine Installation erforderlich. Läuft auf jedem modernen Browser."
        ),
        spacer(8),

        heading2("1.2  Zielgruppe"),
        body("BuyRight AI richtet sich an folgende Nutzergruppen:"),
        bullet("Privatpersonen, die sicher und informiert online einkaufen möchten"),
        bullet("Technik-Enthusiasten und Schnäppchenjäger"),
        bullet("Menschen, die Fälschungen und Betrugsangebote vermeiden wollen"),
        bullet("Käufer, die ein begrenztes Budget optimal einsetzen möchten"),
        bullet("Alle, die keine Zeit für stundenlange Produktrecherche haben"),
        spacer(6),

        heading2("1.3  Systemvoraussetzungen"),
        body("BuyRight AI ist vollständig browserbasiert und erfordert keine Installation:"),
        spacer(4),
        twoColTable(
          [
            ["Browser", "Chrome 100+, Firefox 100+, Safari 16+, Edge 100+ (aktuellste Version empfohlen)"],
            ["Betriebssystem", "Windows 10/11, macOS 12+, Linux (beliebige Distribution), iOS 16+, Android 10+"],
            ["Verbindung", "Stabile Internetverbindung (min. 5 Mbit/s empfohlen)"],
            ["JavaScript", "Muss im Browser aktiviert sein"],
            ["Bildschirmauflösung", "Ab 320 px Breite – vollständig responsiv"],
            ["Konto (optional)", "Für Free-Plan nicht erforderlich; für Pro-Plan E-Mail-Adresse benötigt"],
          ],
          ["Anforderung", "Details"]
        ),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 2
        // ══════════════════════════════════════════
        heading1("2  Erste Schritte"),
        hr(),

        heading2("2.1  Registrierung und Anmeldung"),
        body(
          "BuyRight AI kann ohne Registrierung genutzt werden. Kostenlose Nutzer erhalten täglich 3 Produktanalysen direkt auf der Startseite. " +
          "Für erweiterte Funktionen und unbegrenzte Nutzung ist ein Pro-Konto erforderlich."
        ),
        spacer(4),
        heading3("Konto erstellen (Pro):"),
        bullet("Klicke oben rechts auf \u201EAnmelden\u201D"),
        bullet("Wähle \u201EKonto erstellen\u201D"),
        bullet("Gib deine E-Mail-Adresse und ein sicheres Passwort ein"),
        bullet("Bestätige deine Registrierung per E-Mail"),
        bullet("Nach der Bestätigung stehen alle Pro-Funktionen zur Verfügung"),
        spacer(6),
        heading3("Anmelden (bestehendes Konto):"),
        bullet("Klicke auf \u201EAnmelden\u201D in der Navigation"),
        bullet("Gib deine E-Mail-Adresse und dein Passwort ein"),
        bullet("Du wirst automatisch zum Dashboard weitergeleitet"),
        spacer(8),

        heading2("2.2  Kontoverwaltung und Profil"),
        body(
          "Nach der Anmeldung ist der Bereich \u201EProfil & Einstellungen\u201C über die Navigation erreichbar. Dort können folgende Einstellungen vorgenommen werden:"
        ),
        bulletBold("E-Mail-Adresse ändern:", "Neue E-Mail eingeben und per Bestätigungslink verifizieren."),
        bulletBold("Passwort ändern:", "Aktuelles Passwort und neues Passwort zweimal eingeben."),
        bulletBold("Sprache:", "Umschalten zwischen Deutsch und Englisch (oben rechts im Header)."),
        bulletBold("Design:", "Hell- und Dunkelmodus wählbar über den Umschalter im Header."),
        bulletBold("Analyse-Verlauf:", "Alle bisherigen Analysen im Dashboard einsehbar (Pro-Nutzer: vollständig, Free: begrenzt)."),
        spacer(8),

        heading2("2.3  Preismodelle – Free vs. Pro"),
        body("BuyRight AI bietet zwei Tarife:"),
        spacer(4),
        twoColTable(
          [
            ["Funktion", "Free", "Pro"],
            ["Produktanalysen pro Tag", "3", "Unbegrenzt"],
            ["Analysetiefe", "Grundlegend", "Tiefgehend"],
            ["Anzahl Alternativen", "2", "Bis zu 5"],
            ["Analyse-Historie", "Begrenzt", "Vollständig"],
            ["PDF-Export", "–", "✓"],
            ["Vorrangige Verarbeitung", "–", "✓"],
            ["Alle 4 KI-Tools", "✓", "✓"],
            ["Konto erforderlich", "Nein", "Ja"],
            ["Preis", "Kostenlos", "Pro-Tarif (aktuell auf der Plattform einsehbar)"],
          ],
          ["Feature", "Free", "Pro"]
        ),
        spacer(6),
        infoBox(
          "Hinweis",
          "Das tägliche Limit von 3 Analysen gilt pro Gerät/Browser (via Rate Limiting). " +
          "Pro-Nutzer haben kein Tageslimit und nutzen alle Tools ohne Einschränkung."
        ),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 3
        // ══════════════════════════════════════════
        heading1("3  Tool 1: Produktanalyse"),
        hr(),
        body(
          "Die Produktanalyse ist das Kernstück von BuyRight AI. Mit nur wenigen Klicks erhältst du eine umfassende KI-Bewertung " +
          "eines beliebigen Online-Produkts – mit Score, Empfehlung, Vor- und Nachteilen sowie besseren Alternativen."
        ),

        heading2("3.1  Eingabemethoden"),
        body("Du kannst ein Produkt auf drei Wegen analysieren:"),
        spacer(6),

        heading3("A) URL einfügen (empfohlen)"),
        body(
          "Kopiere die vollständige Produkt-URL aus einem Online-Shop (z. B. Amazon, MediaMarkt, Zalando, eBay) " +
          "und füge sie in das URL-Eingabefeld ein. Die KI extrahiert automatisch alle relevanten Produktdaten."
        ),
        bullet("Unterstützte Shops: Amazon, eBay, MediaMarkt, Saturn, Zalando, OTTO, Notebooksbilliger und weitere"),
        bullet("Tipp: Kopiere die vollständige URL aus der Adressleiste deines Browsers"),
        spacer(4),

        heading3("B) Produktname eingeben"),
        body(
          "Gib den Namen des Produkts in das Textfeld ein. Die KI sucht selbstständig nach relevanten Produktdaten und Marktinformationen."
        ),
        bullet("Beispiel: \u201ESony WH-1000XM5 Kopfhörer\u201D oder \u201EiPhone 16 Pro Max 256GB\u201D"),
        bullet("Je präziser der Name, desto genauer das Ergebnis"),
        spacer(4),

        heading3("C) Produktbild hochladen"),
        body(
          "Lade ein Foto des Produkts hoch (z. B. vom Verpackungsetikett oder einem Screenshot). " +
          "Die KI identifiziert das Produkt und erstellt eine vollständige Analyse."
        ),
        bullet("Unterstützte Formate: JPG, PNG, WebP (max. 10 MB)"),
        bullet("Hinweis: Hochgeladene Bilder werden nach der Analyse automatisch gelöscht (DSGVO-konform)"),
        spacer(8),

        heading2("3.2  Auswertung verstehen: Score 0–100"),
        body(
          "Nach der Analyse erhältst du einen Score von 0 bis 100. Dieser Wert fasst die Gesamtqualität " +
          "des Produkts zusammen – basierend auf mehreren Bewertungsdimensionen:"
        ),
        spacer(6),
        scoreRow("85–100", "Ausgezeichnet – klare Kaufempfehlung", C.success),
        spacer(3),
        scoreRow("70–84", "Gut – empfehlenswert mit kleinen Einschränkungen", C.primary),
        spacer(3),
        scoreRow("50–69", "Mittel – nur kaufen, wenn spezifische Bedürfnisse erfüllt werden", C.warning),
        spacer(3),
        scoreRow("0–49", "Schlecht – besser eine Alternative wählen", "DC2626"),
        spacer(8),

        heading3("Score-Kriterien:"),
        twoColTable(
          [
            ["Preis-Leistungs-Verhältnis", "Ist der Preis im Marktvergleich fair?"],
            ["Produktqualität", "Bewertungen, Materialien, Langlebigkeit"],
            ["Markenreputation", "Vertrauenswürdigkeit des Herstellers"],
            ["Bewertungsintegrität", "Echtheit und Konsistenz der Kundenbewertungen"],
            ["Wettbewerbsposition", "Wie gut ist das Produkt im Vergleich zu Alternativen?"],
            ["Risikofaktoren", "Bekannte Probleme, Rückrufe, Sicherheitsbedenken"],
          ],
          ["Kriterium", "Beschreibung"]
        ),
        spacer(8),

        heading2("3.3  Empfehlungstypen"),
        body("Die KI gibt eine von drei Kaufempfehlungen aus:"),
        spacer(4),
        bulletBold("KAUFEN:", "Das Produkt erfüllt alle Anforderungen. Preis-Leistungs-Verhältnis ist ausgezeichnet. Keine wesentlichen Nachteile."),
        bulletBold("NUR WENN:", "Das Produkt ist gut, aber hat spezifische Einschränkungen. Kaufen, wenn bestimmte Bedingungen für dich zutreffen."),
        bulletBold("NICHT KAUFEN:", "Erhebliche Mängel, überhöhter Preis oder bessere Alternativen verfügbar. Kauf nicht empfehlenswert."),
        spacer(8),

        heading2("3.4  Vorteile, Nachteile und Warnhinweise"),
        body(
          "Jede Analyse enthält eine strukturierte Liste von Vorteilen (Pros) und Nachteilen (Cons). " +
          "Bei identifizierten Risiken erscheinen zusätzlich farbige Warnhinweise:"
        ),
        bulletBold("Grüne Vorteile:", "Besonders starke Qualitätsmerkmale des Produkts."),
        bulletBold("Rote Nachteile:", "Bekannte Schwächen oder Risiken."),
        bulletBold("Gelbe Warnungen:", "Hinweise auf potenzielle Probleme (z. B. Preisanomalie, fragwürdige Bewertungen)."),
        spacer(8),

        heading2("3.5  Bessere Alternativen"),
        body(
          "Am Ende jeder Analyse schlägt die KI bis zu 5 (Pro) bzw. 2 (Free) bessere Alternativen vor. " +
          "Diese werden nach Verbesserungsgrad, Preis-Leistungs-Verhältnis und Verfügbarkeit sortiert."
        ),
        bullet("Die Alternativen haben in der Regel einen höheren Score als das analysierte Produkt"),
        bullet("Jede Alternative enthält Name, kurze Begründung und ggf. Preisrahmen"),
        bullet("Pro-Nutzer sehen detailliertere Alternativbeschreibungen"),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 4
        // ══════════════════════════════════════════
        heading1("4  Tool 2: Produktvergleich"),
        hr(),
        body(
          "Der Produktvergleich ermöglicht es, zwei Produkte direkt gegenüberzustellen und " +
          "eine klare KI-Entscheidung zu erhalten – ideal bei Kaufunentschlossenheit."
        ),

        heading2("4.1  Zwei Produkte vergleichen"),
        body("So verwendest du den Produktvergleich:"),
        bullet("Navigiere zu \"Vergleichen\" in der oberen Navigation"),
        bullet("Gib Produkt A (URL oder Produktname) in das linke Eingabefeld ein"),
        bullet("Gib Produkt B (URL oder Produktname) in das rechte Eingabefeld ein"),
        bullet("Klicke auf \"Vergleichen starten\""),
        bullet("Erhalte innerhalb von 10–15 Sekunden das vollständige Vergleichsergebnis"),
        spacer(8),

        heading2("4.2  Kategorie-Sieger-Auswertung"),
        body(
          "Die KI bewertet beide Produkte in mehreren Kategorien und bestimmt jeweils einen Sieger:"
        ),
        spacer(4),
        twoColTable(
          [
            ["Preis", "Welches Produkt bietet mehr für den Preis?"],
            ["Qualität", "Material, Verarbeitung, Langlebigkeit"],
            ["Leistung / Features", "Technische Ausstattung und Funktionsumfang"],
            ["Bewertungen", "Qualität und Echtheit der Nutzerbewertungen"],
            ["Kundenzufriedenheit", "Gesamtzufriedenheit basierend auf Bewertungsdaten"],
            ["Gesamtempfehlung", "Welches Produkt gewinnt insgesamt?"],
          ],
          ["Kategorie", "Bewertungsgrundlage"]
        ),
        spacer(8),

        heading2("4.3  KI-Kaufempfehlung und Begründung"),
        body(
          "Am Ende des Vergleichs gibt die KI eine eindeutige Kaufempfehlung mit ausführlicher Begründung. " +
          "Du erhältst:"
        ),
        bulletBold("Gewinner:", "Das Produkt, das du kaufen solltest."),
        bulletBold("Begründung:", "Detaillierte Erklärung, warum Produkt A oder B besser geeignet ist."),
        bulletBold("Für wen gilt was:", "In welchen Szenarien wäre das unterlegene Produkt dennoch die bessere Wahl."),
        spacer(4),
        infoBox(
          "Anwendungsbeispiel",
          "Du überlegst zwischen zwei Laptops. Produkt A kostet 899 €, Produkt B 999 €. " +
          "Die KI analysiert Prozessor, Akkulaufzeit, Display-Qualität und Bewertungen – und empfiehlt Produkt A " +
          "wegen des überlegenen Preis-Leistungs-Verhältnisses."
        ),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 5
        // ══════════════════════════════════════════
        heading1("5  Tool 3: Fake-Detektor"),
        hr(),
        body(
          "Der Fake-Detektor schützt Käufer vor gefälschten Produkten, manipulierten Bewertungen " +
          "und betrügerischen Verkäufern. Er analysiert Produkte auf zahlreiche Warnsignale."
        ),

        heading2("5.1  Wie Fake-Erkennung funktioniert"),
        body(
          "Die KI analysiert mehrere Datenpunkte gleichzeitig und bewertet das Gesamtrisiko:"
        ),
        spacer(4),
        twoColTable(
          [
            ["Bewertungsanalyse", "Erkennt unnatürliche Bewertungsmuster: zu viele 5-Sterne kurz nach Produktstart, identische Formulierungen, zeitliche Häufungen"],
            ["Preisanomalien", "Erkennt Preise, die deutlich unter dem Marktwert liegen – ein häufiges Warnsignal für Fälschungen"],
            ["Verkäufer-Analyse", "Bewertet Verkäuferprofil, Rückgabepolitik, Kontaktinformationen und Bewertungshistorie"],
            ["Produktbeschreibung", "Analysiert Rechtschreibfehler, unklare Bilder, fehlende CE-Zeichen, verdächtige Herstellerangaben"],
            ["Markenprüfung", "Vergleicht das Angebot mit offiziellem Markensortiment und autorisierten Händlern"],
            ["Produktbild-Analyse", "Erkennt manipulierte oder gestohlene Produktbilder"],
          ],
          ["Analysepunkt", "Methode"]
        ),
        spacer(8),

        heading2("5.2  Vertrauens-Score und Risikoklassen"),
        body(
          "Das Ergebnis der Fake-Analyse ist ein Vertrauens-Score von 0 bis 100:"
        ),
        spacer(6),
        scoreRow("85–100", "Vertrauenswürdig – kein Hinweis auf Fälschung oder Betrug", C.success),
        spacer(3),
        scoreRow("60–84", "Leicht verdächtig – einzelne Warnsignale vorhanden, Vorsicht geboten", C.warning),
        spacer(3),
        scoreRow("30–59", "Verdächtig – mehrere Risikofaktoren – besser ein anderes Angebot wählen", "D97706"),
        spacer(3),
        scoreRow("0–29", "Hohes Betrugsrisiko – nicht kaufen empfohlen", "DC2626"),
        spacer(8),

        heading2("5.3  Typische Betrugsmerkmale"),
        body("Folgende Signale erhöhen den Verdachtsgrad signifikant:"),
        spacer(4),

        heading3("Gefälschte Bewertungen:"),
        bullet("Mehr als 50 % 5-Sterne-Bewertungen innerhalb der ersten 7 Tage"),
        bullet("Mehrere Bewertungen mit identischem oder sehr ähnlichem Text"),
        bullet("Reviewers mit weniger als 3 Bewertungen insgesamt"),
        bullet("Auffällig kurze, inhaltsleere Bewertungstexte"),
        spacer(4),

        heading3("Preisbetrug:"),
        bullet("Preis mehr als 50 % unter dem empfohlenen Marktpreis"),
        bullet("\"Angebot läuft in 2 Stunden ab\" ohne erkennbaren Sale-Anlass"),
        bullet("Ursprungspreis deutlich höher als jemals am Markt gesehen"),
        spacer(4),

        heading3("Verkäuferbetrug:"),
        bullet("Verkäufer hat weniger als 10 Bewertungen bei hohem Verkaufsvolumen"),
        bullet("Keine Rückgabemöglichkeit oder fragwürdige Rückgabebedingungen"),
        bullet("Kein offizielles Markenshop-Zertifikat"),
        bullet("Versand ausschließlich aus Risikoregionen bei EU/DE-Marke"),
        spacer(4),
        infoBox(
          "Wichtiger Hinweis",
          "Die Fake-Erkennung durch KI ist ein Hilfsmittel und erhebt keinen Anspruch auf 100 % Genauigkeit. " +
          "Bei Zweifeln empfehlen wir, ausschließlich über offizielle Hersteller-Webseiten oder autorisierte Händler zu kaufen."
        ),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 6
        // ══════════════════════════════════════════
        heading1("6  Tool 4: Budget-Optimierer"),
        hr(),
        body(
          "Der Budget-Optimierer hilft dir, eine Einkaufsliste mit mehreren Produkten innerhalb eines " +
          "definierten Budgets optimal zu planen. Die KI priorisiert, was du kaufen, überspringen oder " +
          "günstiger finden solltest."
        ),

        heading2("6.1  Einkaufsliste und Budget eingeben"),
        body("So verwendest du den Budget-Optimierer:"),
        bullet("Navigiere zu \"Budget-Optimierer\" in der Navigation"),
        bullet("Gib dein Gesamtbudget in Euro ein"),
        bullet("Füge bis zu 15 Produkte hinzu (Name, URL oder beides)"),
        bullet("Optional: Markiere Produkte als \"Muss haben\" (Priorität hoch)"),
        bullet("Klicke auf \"Budget optimieren\""),
        bullet("Erhalte innerhalb von 15–20 Sekunden den optimierten Einkaufsplan"),
        spacer(8),

        heading2("6.2  KI-Priorisierung: Kaufen / Überspringen"),
        body(
          "Die KI analysiert jedes Produkt auf der Liste und kategorisiert es:"
        ),
        spacer(4),
        twoColTable(
          [
            ["KAUFEN (Grün)", "Produkt ist wichtig, gutes Preis-Leistungs-Verhältnis, innerhalb des Budgets prioritär"],
            ["KAUFEN GÜNSTIGER (Blau)", "Produkt ist sinnvoll, aber eine günstigere Alternative existiert"],
            ["ÜBERSPRINGEN (Gelb)", "Produkt ist im Budget vorhanden, aber kaum Mehrwert gegenüber Alternativen"],
            ["VERSCHIEBEN (Grau)", "Produkt sprengt das Budget oder hat niedrige Priorität – ggf. später kaufen"],
          ],
          ["Status", "Bedeutung"]
        ),
        spacer(8),

        heading2("6.3  Günstigere Alternativen finden"),
        body(
          "Für jedes Produkt mit dem Status \"KAUFEN GÜNSTIGER\" oder \"ÜBERSPRINGEN\" schlägt die KI " +
          "konkrete günstigere Alternativen vor, die denselben Bedarf erfüllen. Du erhältst:"
        ),
        bulletBold("Alternativname:", "Konkreter Name des günstigeren Produkts."),
        bulletBold("Preisersparnis:", "Geschätzte Ersparnis gegenüber dem Original."),
        bulletBold("Qualitätsvergleich:", "Kurze Einschätzung, wie nah die Alternative dem Original kommt."),
        spacer(4),
        infoBox(
          "Anwendungsbeispiel",
          "Budget: 800 €\nEinkaufsliste: Laptop (600 €), Maus (80 €), Tastatur (120 €), Webkamera (90 €)\n\n" +
          "Die KI stellt fest: Laptop + Maus + Tastatur = 800 €. Für die Webkamera schlägt sie eine günstigere " +
          "Alternative für 45 € vor, sodass das Gesamtbudget eingehalten wird."
        ),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 7
        // ══════════════════════════════════════════
        heading1("7  Dashboard und Analyse-Historie"),
        hr(),
        body(
          "Angemeldete Nutzer haben Zugriff auf das persönliche Dashboard, das eine Übersicht aller " +
          "durchgeführten Analysen bietet."
        ),

        heading2("7.1  Dashboard-Übersicht"),
        body("Das Dashboard zeigt folgende Informationen auf einen Blick:"),
        twoColTable(
          [
            ["Gesamte Analysen", "Anzahl aller bisher durchgeführten Produktchecks"],
            ["Dieser Monat", "Analysen im aktuellen Kalendermonat"],
            ["Vermiedene Fehlkäufe", "Produkte, bei denen die KI von Kauf abgeraten hat"],
            ["Durchschnittlicher Score", "Mittlerer Score über alle analysierten Produkte"],
          ],
          ["Kennzahl", "Beschreibung"]
        ),
        spacer(8),

        heading2("7.2  Analyse-Verlauf"),
        body(
          "Alle bisherigen Analysen werden tabellarisch aufgelistet. Jeder Eintrag zeigt:"
        ),
        bullet("Produktname oder URL"),
        bullet("Datum und Uhrzeit der Analyse"),
        bullet("Erhaltener Score (0–100)"),
        bullet("Empfehlung (KAUFEN / NICHT KAUFEN / NUR WENN)"),
        bullet("Button zum erneuten Öffnen der vollständigen Analyse"),
        spacer(6),
        body(
          "Free-Nutzer sehen die letzten 5 Einträge. Pro-Nutzer haben unbegrenzten Zugriff auf die vollständige Historie."
        ),
        spacer(8),

        heading2("7.3  PDF-Export (nur Pro)"),
        body(
          "Pro-Nutzer können jede gespeicherte Analyse als professionell formatiertes PDF exportieren. " +
          "Das PDF enthält Score, alle Analysepunkte, Empfehlung und Alternativen – ideal für den persönlichen Archiv " +
          "oder den Austausch mit anderen."
        ),
        bullet("Exportformat: PDF (A4, druckoptimiert)"),
        bullet("Dateiname: BuyRight-Analyse_[Produktname]_[Datum].pdf"),
        bullet("Verfügbar direkt aus dem Dashboard oder der Detailansicht"),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 8
        // ══════════════════════════════════════════
        heading1("8  Datenschutz und Datensicherheit"),
        hr(),
        body(
          "BuyRight AI wurde mit einem Privacy-by-Design-Ansatz entwickelt. Der Schutz deiner persönlichen " +
          "Daten hat höchste Priorität."
        ),

        heading2("8.1  DSGVO-Konformität"),
        body(
          "BuyRight AI ist vollständig DSGVO-konform (Datenschutz-Grundverordnung der EU). " +
          "Alle Daten werden ausschließlich auf europäischen Servern gespeichert und verarbeitet."
        ),
        spacer(4),

        heading2("8.2  Datenerhebung"),
        twoColTable(
          [
            ["Produktanfragen (URL/Text)", "Temporär für die Analyse verarbeitet, nicht dauerhaft gespeichert (Free-Nutzer)"],
            ["Hochgeladene Bilder", "Werden nach der Analyse automatisch gelöscht"],
            ["E-Mail-Adresse (Pro)", "Für Kontozugang und Benachrichtigungen verwendet"],
            ["Analyse-Verlauf (Pro)", "Gespeichert und nur dem Kontoinhaber zugänglich"],
            ["IP-Adresse", "Für Rate Limiting (Tageslimits) – nicht personenbezogen gespeichert"],
            ["Cookies", "Nur technisch notwendige Session-Cookies; keine Tracking-Cookies"],
          ],
          ["Datenkategorie", "Verwendung"]
        ),
        spacer(8),

        heading2("8.3  Datenweitergabe"),
        body(
          "BuyRight AI verkauft keine persönlichen Daten an Dritte. Produktanfragen werden " +
          "an KI-Dienste (OpenRouter) zur Verarbeitung übertragen – ausschließlich für die Analyse. " +
          "Diese Dienste unterliegen eigenen Datenschutzrichtlinien."
        ),
        spacer(6),

        heading2("8.4  Datensicherheit"),
        bullet("Alle Verbindungen sind mit TLS 1.3 verschlüsselt (HTTPS)"),
        bullet("Passwörter werden mit bcrypt gehasht und nie im Klartext gespeichert"),
        bullet("Datenbankzugriff durch Row Level Security (RLS) – jeder Nutzer sieht nur seine eigenen Daten"),
        bullet("Regelmäßige Sicherheits-Audits und automatische Sicherheitsupdates"),
        spacer(6),

        heading2("8.5  Deine Rechte"),
        body("Als DSGVO-betroffene Person hast du folgende Rechte:"),
        bulletBold("Auskunft:", "Anforderung aller über dich gespeicherten Daten."),
        bulletBold("Berichtigung:", "Korrektur unrichtiger Daten."),
        bulletBold("Löschung:", "Vollständige Löschung deines Kontos und aller Daten."),
        bulletBold("Datenportabilität:", "Export deiner Daten in maschinenlesbarem Format."),
        bulletBold("Widerspruch:", "Widerspruch gegen bestimmte Datenverarbeitungen."),
        spacer(4),
        body("Zur Ausübung deiner Rechte kontaktiere uns unter: info@wamocon.com"),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 9
        // ══════════════════════════════════════════
        heading1("9  Häufig gestellte Fragen (FAQ)"),
        hr(),

        heading2("Wie funktioniert BuyRight AI?"),
        body(
          "BuyRight AI verwendet fortschrittliche KI-Sprachmodelle (Large Language Models), um Produkte " +
          "anhand von Marktdaten, Preisinformationen, Bewertungsmustern und Qualitätsindikatoren zu analysieren. " +
          "Die KI erstellt daraus einen Score und eine Empfehlung."
        ),
        spacer(6),

        heading2("Ist der Service kostenlos?"),
        body(
          "Ja! Du erhältst täglich 3 kostenlose Produktanalysen ohne Anmeldung. " +
          "Für unbegrenzte Nutzung und zusätzliche Funktionen steht der Pro-Tarif zur Verfügung."
        ),
        spacer(6),

        heading2("Welche Produkte kann ich analysieren?"),
        body(
          "Nahezu jedes Produkt, das online verkauft wird: Elektronik, Haushaltsgeräte, Mode, Werkzeug, " +
          "Sportartikel, Möbel und vieles mehr. Die KI kommt mit URL, Produktname oder Produktfoto zurecht."
        ),
        spacer(6),

        heading2("Wie genau ist die KI?"),
        body(
          "Die KI-Analyse basiert auf umfangreichen Trainingsdaten und echten Marktinformationen. " +
          "Sie bietet eine zuverlässige erste Einschätzung, ersetzt aber keine vollständige manuelle Produktrecherche. " +
          "Für hochpreisige Käufe empfehlen wir, die Analyse als Entscheidungshilfe zu nutzen."
        ),
        spacer(6),

        heading2("Was passiert mit meinen hochgeladenen Bildern?"),
        body(
          "Hochgeladene Bilder werden ausschließlich für die laufende Analyse verwendet und danach " +
          "automatisch von unseren Servern gelöscht. Es erfolgt keine Speicherung oder Weitergabe."
        ),
        spacer(6),

        heading2("Kann ich die Ergebnisse exportieren?"),
        body(
          "Pro-Nutzer können alle Analysen als PDF exportieren. Free-Nutzer können die Ergebnisse " +
          "im Browser ausdrucken oder als Screenshot speichern."
        ),
        spacer(6),

        heading2("Funktioniert BuyRight AI auf dem Smartphone?"),
        body(
          "Ja, BuyRight AI ist vollständig responsiv und für mobile Geräte optimiert. " +
          "Alle Funktionen stehen auf Smartphones und Tablets zur Verfügung."
        ),
        spacer(6),

        heading2("In welchen Sprachen ist die App verfügbar?"),
        body(
          "BuyRight AI ist vollständig auf Deutsch und Englisch verfügbar. " +
          "Die Sprache kann jederzeit über den Umschalter im Header gewechselt werden."
        ),
        spacer(6),

        heading2("Gibt es eine API für Entwickler?"),
        body(
          "Derzeit ist keine öffentliche API verfügbar. Bei Interesse an einer Integration " +
          "kontaktiere uns unter info@wamocon.com."
        ),
        spacer(6),

        heading2("Wie kündige ich meinen Pro-Tarif?"),
        body(
          "Der Pro-Tarif kann jederzeit über das Profil unter \"Abonnement verwalten\" gekündigt werden. " +
          "Du behältst die Pro-Funktionen bis zum Ende des bezahlten Zeitraums."
        ),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 10
        // ══════════════════════════════════════════
        heading1("10  Support und Kontakt"),
        hr(),

        heading2("10.1  Self-Service"),
        body("Für die meisten Fragen findest du Antworten direkt in diesem Handbuch oder im FAQ-Bereich der Plattform."),
        spacer(4),

        heading2("10.2  Kontaktmöglichkeiten"),
        spacer(4),
        twoColTable(
          [
            ["E-Mail Support", "info@wamocon.com"],
            ["Web", "https://www.buyrai.eu"],
            ["Reaktionszeit", "Werktags: 24–48 Stunden"],
            ["Sprachen", "Deutsch und Englisch"],
          ],
          ["Kanal", "Details"]
        ),
        spacer(8),

        heading2("10.3  Fehlermeldungen"),
        body("Falls du einen Fehler oder ein unerwartetes Verhalten feststellst, helfe uns mit folgenden Informationen:"),
        bulletBold("Fehlerbeschreibung:", "Was ist passiert?"),
        bulletBold("Schritte zur Reproduktion:", "Wie kann der Fehler nachgestellt werden?"),
        bulletBold("Browser und Version:", "z. B. Chrome 124 auf Windows 11"),
        bulletBold("Screenshot:", "Falls möglich, einen Screenshot des Fehlers beifügen"),
        spacer(6),
        body("Bitte sende diese Informationen an info@wamocon.com mit dem Betreff \"BuyRight AI – Fehlerreport\"."),
        spacer(8),

        heading2("10.4  Feature-Anfragen"),
        body(
          "Wir freuen uns über Verbesserungsvorschläge und Ideen für neue Funktionen. " +
          "Schreibe uns gerne an info@wamocon.com mit dem Betreff \"BuyRight AI – Feature Request\"."
        ),

        pageBreak(),

        // ══════════════════════════════════════════
        // KAPITEL 11
        // ══════════════════════════════════════════
        heading1("11  Rechtliche Hinweise"),
        hr(),

        heading2("11.1  Haftungsausschluss"),
        body(
          "Die durch BuyRight AI erstellten Analysen und Empfehlungen basieren auf KI-Berechnungen " +
          "und dienen ausschließlich als unverbindliche Entscheidungshilfe. WAMOCON GmbH übernimmt keine " +
          "Haftung für Kaufentscheidungen, die auf Basis dieser Analysen getroffen werden."
        ),
        body(
          "Die KI kann Fehler machen, veraltete Informationen verwenden oder bestimmte Produktmerkmale " +
          "nicht vollständig erfassen. Für wichtige Kaufentscheidungen empfehlen wir zusätzliche Recherche."
        ),
        spacer(6),

        heading2("11.2  Urheberrecht"),
        body(
          "Alle Inhalte dieser Anwendung, einschließlich Texte, Grafiken, Logos und der Software selbst, " +
          "sind urheberrechtlich geschützt und Eigentum der WAMOCON GmbH. " +
          "Eine Vervielfältigung oder Nutzung ohne ausdrückliche Genehmigung ist untersagt."
        ),
        spacer(6),

        heading2("11.3  Markenrechte"),
        body(
          "\"BuyRight AI\" ist eine Marke der WAMOCON GmbH. Alle anderen genannten Marken und Produktnamen " +
          "sind Eigentum ihrer jeweiligen Inhaber. Die Erwähnung dient ausschließlich der Identifikation."
        ),
        spacer(6),

        heading2("11.4  Impressum"),
        spacer(4),
        twoColTable(
          [
            ["Unternehmen", "WAMOCON GmbH"],
            ["Geschäftsführer", "Dipl.-Ing. Waleri Moretz"],
            ["Anschrift", "Mergenthalerallee 79-81, 65760 Eschborn, Deutschland"],
            ["Telefon", "+49 6196 5838311"],
            ["E-Mail", "info@wamocon.com"],
            ["Handelsregister", "Eschborn HRB 123666"],
            ["USt-IdNr.", "DE344930486"],
            ["Webseite", "https://www.buyrai.eu"],
          ],
          ["Feld", "Wert"]
        ),
        spacer(8),

        heading2("11.5  Anwendbares Recht und Gerichtsstand"),
        body(
          "Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für alle Streitigkeiten " +
          "aus der Nutzung von BuyRight AI ist, sofern gesetzlich zulässig, Eschborn."
        ),
        spacer(8),

        heading2("11.6  Datenschutzerklärung"),
        body(
          "Die vollständige Datenschutzerklärung ist auf der Plattform unter dem Link \"Datenschutz\" " +
          "im Footer erreichbar und entspricht den Anforderungen der DSGVO und des TTDSG."
        ),
        spacer(8),

        heading2("11.7  AGB"),
        body(
          "Die Allgemeinen Geschäftsbedingungen sind über den Link \"AGB\" im Footer der Plattform abrufbar."
        ),

        spacer(20),
        hr(),

        // Abschluss
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: pt(16), after: pt(6) },
          children: [
            new TextRun({ text: "WAMOCON GmbH  ·  BuyRight AI  ·  Version 1.0  ·  Mai 2026", size: hp(9), color: C.gray500, font: "Calibri" }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "www.buyrai.eu  ·  info@wamocon.com  ·  +49 6196 5838311", size: hp(9), color: C.gray500, font: "Calibri" }),
          ],
        }),
      ],
    },
  ],
});

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────
const buffer = await Packer.toBuffer(doc);
writeFileSync(OUT_PATH, buffer);
console.log(`\n✅  Produkthandbuch erstellt: ${OUT_PATH}\n`);
