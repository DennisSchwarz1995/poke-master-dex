import { Component } from '@angular/core';

@Component({
  selector: 'app-imprint',
  standalone: true,
  template: `
    <div class="container mx-auto max-w-5xl py-6 text-text-primary">
      <div class="bg-surface rounded-xl p-8 border border-theme shadow-sm">
        <h1 class="text-3xl font-bold mb-6">Impressum</h1>
        <h2 class="text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
        <p class="mb-6 text-secondary">
          Max Mustermann<br />
          Musterstraße 1<br />
          12345 Musterstadt
        </p>

        <h2 class="text-xl font-semibold mb-4">Kontakt</h2>
        <p class="mb-6 text-secondary">
          Telefon: +49 (0) 123 44 55 66<br />
          E-Mail: info@musterstadt.de
        </p>

        <h2 class="text-xl font-semibold mb-4">Haftung für Inhalte</h2>
        <p class="mb-6 text-secondary">
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach
          den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
          jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
          hinweisen.
        </p>

        <h2 class="text-xl font-semibold mb-4">Urheberrecht</h2>
        <p class="text-secondary">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
          der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
          Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
          nur für den privaten, nicht kommerziellen Gebrauch gestattet.
        </p>
      </div>
    </div>
  `,
})
export class ImprintComponent {}
