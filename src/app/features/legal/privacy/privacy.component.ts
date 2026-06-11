import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <div class="container mx-auto max-w-5xl py-6 text-text-primary">
      <div class="bg-surface rounded-xl p-8 border border-theme shadow-sm">
        <h1 class="text-3xl font-bold mb-6">Datenschutzerklärung</h1>
        <h2 class="text-xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>
        <h3 class="font-semibold mb-2">Allgemeine Hinweise</h3>
        <p class="mb-6 text-secondary">
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
          personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten
          sind alle Daten, mit denen Sie persönlich identifiziert werden können.
        </p>

        <h2 class="text-xl font-semibold mb-4">2. Allgemeine Hinweise und Pflichtinformationen</h2>
        <h3 class="font-semibold mb-2">Datenschutz</h3>
        <p class="mb-6 text-secondary">
          Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
          behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen
          Datenschutzvorschriften sowie dieser Datenschutzerklärung.
        </p>

        <h3 class="font-semibold mb-2">Hinweis zur verantwortlichen Stelle</h3>
        <p class="mb-6 text-secondary">
          Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
          Max Mustermann<br />
          Musterstraße 1<br />
          12345 Musterstadt<br /><br />
          E-Mail: info@musterstadt.de
        </p>

        <h2 class="text-xl font-semibold mb-4">3. Datenerfassung auf dieser Website</h2>
        <h3 class="font-semibold mb-2">Server-Log-Dateien</h3>
        <p class="text-secondary">
          Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
          Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp
          und Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden
          Rechners, Uhrzeit der Serveranfrage, IP-Adresse. Eine Zusammenführung dieser Daten mit
          anderen Datenquellen wird nicht vorgenommen.
        </p>
      </div>
    </div>
  `,
})
export class PrivacyComponent {}
