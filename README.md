# Care Overflow Pilot v0.1

Minimaler, datensparsamer Pilot für ein lokales Overflow-/Capacity-Matching zwischen Anbietern von Alltagshilfe und haushaltsnaher Unterstützung in Ulm/Neu-Ulm.

## Pilotziel

Nur eine Hypothese testen:

> Kann eine Anfrage, die Anbieter A wegen fehlender oder unpassender Kapazität ablehnt, über ein lokales Netzwerk zu Anbieter B gematcht werden?

## Enthalten

- öffentliche Landingpage auf Deutsch
- Provider-Onboarding
- Capacity-Erfassung (PLZ, Leistung, Finanzierung, Verfügbarkeit)
- anonymisierte Overflow-Anfrage
- Familienanfrage
- lokales Matching nach PLZ + Leistung + Zeit + Finanzierung
- internes Pilot-Dashboard
- manuelle Match-Bestätigung
- Export der lokalen Testdaten als JSON
- Datenschutz-/Impressum-Platzhalter
- GitHub-Pages-Workflow

## Bewusst nicht enthalten

- keine Pflegekassen-API
- keine Zahlungsabwicklung
- keine medizinische Beratung
- keine Gesundheitsakten
- keine automatische Kontaktweitergabe
- keine native App
- kein produktives Backend

## Lokal testen

Es reicht ein statischer HTTP-Server, z. B.:

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080` öffnen.

Die v0.1 speichert Daten nur im Browser (`localStorage`). Der Button **Demo-Daten laden** erzeugt einen Testanbieter und eine kompatible Anfrage. Danach erscheint ein Match-Vorschlag, der manuell bestätigt werden kann.

## GitHub Pages

Nach dem Upload in ein GitHub-Repository kann der mitgelieferte Workflow `.github/workflows/pages.yml` die statische Seite deployen. In den Repository Settings muss GitHub Pages auf **GitHub Actions** gestellt sein.

## Gate A — Supply Validation

Der MVP ist absichtlich klein. Nach Veröffentlichung werden zunächst 10 Provider kontaktiert. Erfolgsgrenzen:

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
5. Wenn Daten serverseitig verarbeitet werden: Zugriffskontrolle, Löschkonzept, Protokollierung und AV-Verträge umsetzen.
