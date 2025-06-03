#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Čtení dat z prices.json
function readPricesData() {
    try {
        const pricesPath = path.join(process.cwd(), 'prices.json');
        const data = fs.readFileSync(pricesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Chyba při čtení prices.json:', error.message);
        process.exit(1);
    }
}

// Formátování ceny pro zobrazení
function formatPrice(price) {
    return Math.round(price).toLocaleString('cs-CZ');
}

// Aktualizace HTML souboru
function updateHtmlFile(pricesData) {
    try {
        const htmlPath = path.join(process.cwd(), 'index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        console.log('Aktualizuji ceny v index.html...');
        
        // Mapování z prices.json na HTML elementy
        const priceMapping = {
            // SolarEdge komponenty z prices.json
            'se50k_total': pricesData.items.se50k?.total || null,
            'se25k_total': pricesData.items.se25k?.total || null,
            'optimizers_total': pricesData.items.optimizers?.total || null,
            
            // K2 komponenty z prices.json  
            'k2_components_total': pricesData.items.k2_components?.total || null,
            'k2_mount_total': pricesData.items.k2_mount?.total || null,
            
            // Celkové ceny
            'total-without-vat': pricesData.totals?.withoutVat || null,
            'vat-amount': pricesData.totals?.vat || null,
            'total-with-vat': pricesData.totals?.withVat || null
        };
        
        // Aktualizace množství (pokud jsou dostupná)
        const quantityMapping = {
            'se50k_qty': pricesData.items.se50k?.qty || null,
            'se25k_qty': pricesData.items.se25k?.qty || null,
            'optimizers_qty': pricesData.items.optimizers?.qty || null,
            'k2_components_qty': pricesData.items.k2_components?.qty || null,
            'k2_mount_qty': pricesData.items.k2_mount?.qty || null
        };
        
        // Aktualizace jednotek (pokud jsou dostupné)
        const unitMapping = {
            'se50k_unit': pricesData.items.se50k?.unit || null,
            'se25k_unit': pricesData.items.se25k?.unit || null,
            'optimizers_unit': pricesData.items.optimizers?.unit || null,
            'k2_components_unit': pricesData.items.k2_components?.unit || null,
            'k2_mount_unit': pricesData.items.k2_mount?.unit || null
        };
        
        let changesCount = 0;
        
        // Aktualizace cen
        for (const [elementId, newPrice] of Object.entries(priceMapping)) {
            if (newPrice !== null) {
                const formattedPrice = formatPrice(newPrice) + ' Kč';
                const regex = new RegExp(`(<td[^>]*id="${elementId}"[^>]*>)[^<]*(</td>)`, 'g');
                const oldContent = htmlContent;
                htmlContent = htmlContent.replace(regex, `$1${formattedPrice}$2`);
                
                if (oldContent !== htmlContent) {
                    console.log(`✓ Aktualizován element ${elementId}: ${formattedPrice}`);
                    changesCount++;
                }
            }
        }
        
        // Aktualizace množství
        for (const [elementId, newQty] of Object.entries(quantityMapping)) {
            if (newQty !== null) {
                const regex = new RegExp(`(<td[^>]*id="${elementId}"[^>]*>)[^<]*(</td>)`, 'g');
                const oldContent = htmlContent;
                htmlContent = htmlContent.replace(regex, `$1${newQty}$2`);
                
                if (oldContent !== htmlContent) {
                    console.log(`✓ Aktualizováno množství ${elementId}: ${newQty}`);
                    changesCount++;
                }
            }
        }
        
        // Aktualizace jednotek
        for (const [elementId, newUnit] of Object.entries(unitMapping)) {
            if (newUnit !== null) {
                const regex = new RegExp(`(<td[^>]*id="${elementId}"[^>]*>)[^<]*(</td>)`, 'g');
                const oldContent = htmlContent;
                htmlContent = htmlContent.replace(regex, `$1${newUnit}$2`);
                
                if (oldContent !== htmlContent) {
                    console.log(`✓ Aktualizována jednotka ${elementId}: ${newUnit}`);
                    changesCount++;
                }
            }
        }
        
        // Vypočet a aktualizace skupinových součtů
        const solaredgeSubtotal = (pricesData.items.se50k?.total || 67027) + 
                                 (pricesData.items.se25k?.total || 35022) + 
                                 (pricesData.items.optimizers?.total || 133898);
        
        const k2Subtotal = (pricesData.items.k2_components?.total || 92136) + 
                          (pricesData.items.k2_mount?.total || 73000);
        
        // Aktualizace skupinových součtů
        const subtotalMapping = {
            'solaredge_subtotal': solaredgeSubtotal,
            'k2_subtotal': k2Subtotal
        };
        
        for (const [elementId, subtotal] of Object.entries(subtotalMapping)) {
            const formattedSubtotal = formatPrice(subtotal) + ' Kč';
            const regex = new RegExp(`(<td[^>]*id="${elementId}"[^>]*>)[^<]*(</td>)`, 'g');
            const oldContent = htmlContent;
            htmlContent = htmlContent.replace(regex, `$1${formattedSubtotal}$2`);
            
            if (oldContent !== htmlContent) {
                console.log(`✓ Aktualizován mezisoučet ${elementId}: ${formattedSubtotal}`);
                changesCount++;
            }
        }
        
        // Zapsat aktualizovaný soubor
        if (changesCount > 0) {
            fs.writeFileSync(htmlPath, htmlContent, 'utf8');
            console.log(`\n🎉 Úspěšně aktualizováno ${changesCount} položek v index.html`);
            console.log(`📅 Datum aktualizace: ${pricesData.lastUpdated || new Date().toISOString()}`);
        } else {
            console.log('ℹ️  Žádné změny nebyly potřeba');
        }
        
    } catch (error) {
        console.error('Chyba při aktualizaci HTML souboru:', error.message);
        process.exit(1);
    }
}

// Hlavní funkce
function main() {
    console.log('🚀 Spouštím aktualizaci cen...');
    
    const pricesData = readPricesData();
    console.log('✓ Úspěšně načtena data z prices.json');
    console.log(`📊 Celková cena s DPH: ${formatPrice(pricesData.totals?.withVat || 0)} Kč`);
    
    updateHtmlFile(pricesData);
    
    console.log('✅ Hotovo!');
}

// Spuštění skriptu
if (require.main === module) {
    main();
}