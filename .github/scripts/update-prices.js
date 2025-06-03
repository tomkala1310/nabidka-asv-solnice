const fs = require('fs');

// Načtení cen z prices.json souboru
let pricesData;
try {
  const pricesJson = fs.readFileSync('prices.json', 'utf8');
  pricesData = JSON.parse(pricesJson);
} catch (error) {
  console.error('❌ Chyba při načítání prices.json:', error);
  process.exit(1);
}

const prices = {
  se50k: pricesData.items.se50k?.total || '67027',
  se25k: pricesData.items.se25k?.total || '35022', 
  optimizers: pricesData.items.optimizers?.total || '133898',
  k2Components: pricesData.items.k2_components?.total || '92136',
  k2Mount: pricesData.items.k2_mount?.total || '73000',
  totalWithoutVat: pricesData.totals.withoutVat || '794013',
  totalWithVat: pricesData.totals.withVat || '960756'
};

console.log('Aktualizuji ceny v nabídce...');

// Načtení HTML souboru
let html = fs.readFileSync('index.html', 'utf8');

// Aktualizace jednotlivých cen
html = html.replace(/id="se50k_total">[^<]+/, `id="se50k_total">${formatPrice(prices.se50k)} Kč`);
html = html.replace(/id="se25k_total">[^<]+/, `id="se25k_total">${formatPrice(prices.se25k)} Kč`);
html = html.replace(/id="optimizers_total">[^<]+/, `id="optimizers_total">${formatPrice(prices.optimizers)} Kč`);
html = html.replace(/id="k2_components_total">[^<]+/, `id="k2_components_total">${formatPrice(prices.k2Components)} Kč`);
html = html.replace(/id="k2_mount_total">[^<]+/, `id="k2_mount_total">${formatPrice(prices.k2Mount)} Kč`);

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