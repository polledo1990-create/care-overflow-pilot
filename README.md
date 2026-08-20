# Care Overflow Pilot v0.1

Minimaler, datensparsamer Pilot für ein lokales Overflow-/Capacity-Matching zwischen Anbietern von Alltagshilfe und haushaltsnaher Unterstützung in Ulm/Neu-Ulm.

## Pilotziel

Nur eine Hypothese testen:

> Kann eine Anfrage, die Anbieter A wegen fehlender oder unpassender Kapazität ablehnt, über ein lokales Netzwerk zu Anbieter B gematcht werden?

## Enthalten

- Landingpage auf Deutsch
- interne Provider-Erfassung
- Capacity-Erfassung (PLZ, Leistung, Finanzierung, Verfügbarkeit)
- anonymisierte Overflow-Erfassung
- Familien-Intake als Demo
- lokales Matching nach PLZ + Leistung + Zeit + Finanzierung
- internes Pilot-Dashboard
- manuelle Match-Bestätigung
- Export der lokalen Testdaten als JSON
- Datenschutz-/Impressum-Platzhalter
- GitHub-Pages-Workflow

## Wichtige Grenze der v0.1

Die v0.1 besitzt bewusst **kein Backend**. Alle Formulardaten werden ausschließlich im `localStorage` des verwendeten Browsers gespeichert. Ein Provider oder eine Familie, die die Seite auf einem anderen Gerät öffnet und ein Formular ausfüllt, sendet dadurch **keine Daten an das Pilotteam**.

Die aktuelle Version ist deshalb eine interne Erfassungs- und Matching-Demo für Gespräche und manuelle Pilotarbeit. Remote-Onboarding und echte öffentliche Familienanfragen werden erst aktiviert, wenn ein abgesichertes Backend und der dafür notwendige Datenschutz-/Rollenfluss vorhanden sind.

## Bewusst nicht enthalten

- kein produktives Backend
- keine Remote-Formularübermittlung
- keine Pflegekassen-API
- keine Zahlungsabwicklung
- keine medizinische Beratung
- keine Gesundheitsakten
- keine automatische Kontaktweitergabe
- keine native App

## Lokal testen

Es reicht ein statischer HTTP-Server, z. B.:

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080` öffnen.

Der Button **Demo-Daten laden** erzeugt einen Testanbieter und eine kompatible Anfrage. Danach erscheint ein Match-Vorschlag, der manuell bestätigt werden kann.

## GitHub Pages

Nach dem Merge nach `main` kann der Workflow `.github/workflows/pages.yml` die statische Demo deployen. In den Repository Settings muss GitHub Pages auf **GitHub Actions** gestellt sein. Ein Pages-Deployment macht aus der v0.1 noch kein Remote-Intake-System; die Datenspeicherung bleibt browserlokal.

## Gate A — Supply Validation

Der MVP ist absichtlich klein. Zunächst werden 10 Provider manuell kontaktiert. Erfolgsgrenzen:

- >= 6 reale Gespräche
- >= 4 akzeptieren aktuell grundsätzlich neue Kunden
- >= 3 können Kapazität nach Region/Zeit beschreiben
- >= 3 würden nicht passende Anfragen in den Pilot weitergeben

Vor Erreichen dieses Gates keine weitere Produktentwicklung.

## Vor öffentlicher Pilotnutzung

1. Projektname/Marke final prüfen.
2. Betreiber festlegen und Impressum vervollständigen.
3. Datenschutzerklärung für tatsächliches Hosting/Backend finalisieren.
4. Consent- und Datenfluss prüfen.
5. Backend mit Rollen, Zugriffskontrolle, Löschkonzept, Protokollierung und ggf. AV-Verträgen umsetzen.
