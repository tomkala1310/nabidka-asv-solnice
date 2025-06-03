const fs = require('fs');

// Načtení cen z environment variables (GitHub Secrets)
const prices = {
  se50k: process.env.SE50K_PRICE || '67027',
  se25k: process.env.SE25K_PRICE || '35022', 
  optimizers: process.env.OPTIMIZERS_PRICE || '133898',
  k2Components: process.env.K2_COMPONENTS_PRICE || '92136',
  totalWithoutVat: process.env.TOTAL_WITHOUT_VAT || '794013',
  totalWithVat: process.env.TOTAL_WITH_VAT || '960756'
};

console.log('Aktualizuji ceny v nabídce...');

// Načtení HTML souboru
let html = fs.readFileSync('index.html', 'utf8');

// Aktualizace jednotlivých cen
html = html.replace(/id="se50k_total">[^<]+/, `id="se50k_total">${formatPrice(prices.se50k)} Kč`);
html = html.replace(/id="se25k_total">[^<]+/, `id="se25k_total">${formatPrice(prices.se25k)} Kč`);
html = html.replace(/id="optimizers_total">[^<]+/, `id="optimizers_total">${formatPrice(prices.optimizers)} Kč`);
html = html.replace(/id="k2_components_total">[^<]+/, `id="k2_components_total">${formatPrice(prices.k2Components)} Kč`);

// Aktualizace celkových cen
html = html.replace(/id="total-without-vat">[^<]+/, `id="total-without-vat">${formatPrice(prices.totalWithoutVat)} Kč`);
html = html.replace(/id="total-with-vat">[^<]+/, `id="total-with-vat">${formatPrice(prices.totalWithVat)} Kč`);

// Aktualizace DPH (21% z ceny bez DPH)
const vat = Math.round(parseInt(prices.totalWithoutVat.replace(/\s/g, '')) * 0.21);
html = html.replace(/id="vat-amount">[^<]+/, `id="vat-amount">${formatPrice(vat)} Kč`);

// Aktualizace data nabídky na dnešní
const today = new Date();
const dateStr = `${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}`;
html = html.replace(/<p><strong>Datum nabídky:<\/strong> <span>[^<]+<\/span><\/p>/, 
                   `<p><strong>Datum nabídky:</strong> <span>${dateStr}</span></p>`);

// Uložení aktualizovaného HTML
fs.writeFileSync('index.html', html);

console.log('✅ Ceny byly úspěšně aktualizovány!');

function formatPrice(price) {
  return Math.round(parseInt(price.toString().replace(/\s/g, ''))).toLocaleString('cs-CZ');
}