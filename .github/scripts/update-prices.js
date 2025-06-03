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
            // SolarEdge komponenty
            'se50k_total': pricesData.items.se50k?.total || null,
            'se25k_total': pricesData.items.se25k?.total || null,
            'optimizers_total': pricesData.items.optimizers?.total || null,
            
            // Montážní práce
            'panel_mount_total': pricesData.items.panel_mount?.total || null,
            'inverter_mount_total': pricesData.items.inverter_mount?.total || null,
            'optimizer_mount_total': pricesData.items.optimizer_mount?.total || null,
            
            // K2 konstrukce
            'k2_components_total': pricesData.items.k2_components?.total || null,
            'k2_mount_total': pricesData.items.k2_mount?.total || null,
            
            // Rozvaděče
            'invrdc1_total': pricesData.items.invrdc1?.total || null,
            'invrdc2_total': pricesData.items.invrdc2?.total || null,
            'rdc_total': pricesData.items.rdc?.total || null,
            'rfve1_total': pricesData.items.rfve1?.total || null,
            'rfve2_total': pricesData.items.rfve2?.total || null,
            'ris1_r12_total': pricesData.items.ris1_r12?.total || null,
            'ris1_r112_total': pricesData.items.ris1_r112?.total || null,
            'panels_mount_total': pricesData.items.panels_mount?.total || null,
            
            // Kabeláž
            'dc_cable6_total': pricesData.items.dc_cable6?.total || null,
            'dc_cable10_total': pricesData.items.dc_cable10?.total || null,
            'ac_cables_rfve1_total': pricesData.items.ac_cables_rfve1?.total || null,
            'ac_cables_rfve2_total': pricesData.items.ac_cables_rfve2?.total || null,
            'electrical_work_total': pricesData.items.electrical_work?.total || null,
            
            // Doprava
            'transport_total': pricesData.items.transport?.total || null,
            
            // Servis
            'config_total': pricesData.items.config?.total || null,
            'documentation_total': pricesData.items.documentation?.total || null,
            
            // Celkové ceny
            'total-without-vat': pricesData.totals?.withoutVat || null,
            'vat-amount': pricesData.totals?.vat || null,
            'total-with-vat': pricesData.totals?.withVat || null
        };
        
        // Aktualizace množství
        const quantityMapping = {
            'se50k_qty': pricesData.items.se50k?.qty || null,
            'se25k_qty': pricesData.items.se25k?.qty || null,
            'optimizers_qty': pricesData.items.optimizers?.qty || null,
            'panel_mount_qty': pricesData.items.panel_mount?.qty || null,
            'inverter_mount_qty': pricesData.items.inverter_mount?.qty || null,
            'optimizer_mount_qty': pricesData.items.optimizer_mount?.qty || null,
            'k2_components_qty': pricesData.items.k2_components?.qty || null,
            'k2_mount_qty': pricesData.items.k2_mount?.qty || null,
            'invrdc1_qty': pricesData.items.invrdc1?.qty || null,
            'invrdc2_qty': pricesData.items.invrdc2?.qty || null,
            'rdc_qty': pricesData.items.rdc?.qty || null,
            'rfve1_qty': pricesData.items.rfve1?.qty || null,
            'rfve2_qty': pricesData.items.rfve2?.qty || null,
            'ris1_r12_qty': pricesData.items.ris1_r12?.qty || null,
            'ris1_r112_qty': pricesData.items.ris1_r112?.qty || null,
            'panels_mount_qty': pricesData.items.panels_mount?.qty || null,
            'dc_cable6_qty': pricesData.items.dc_cable6?.qty || null,
            'dc_cable10_qty': pricesData.items.dc_cable10?.qty || null,
            'ac_cables_rfve1_qty': pricesData.items.ac_cables_rfve1?.qty || null,
            'ac_cables_rfve2_qty': pricesData.items.ac_cables_rfve2?.qty || null,
            'electrical_work_qty': pricesData.items.electrical_work?.qty || null,
            'transport_qty': pricesData.items.transport?.qty || null,
            'config_qty': pricesData.items.config?.qty || null,
            'documentation_qty': pricesData.items.documentation?.qty || null
        };
        
        // Aktualizace jednotek
        const unitMapping = {
            'se50k_unit': pricesData.items.se50k?.unit || null,
            'se25k_unit': pricesData.items.se25k?.unit || null,
            'optimizers_unit': pricesData.items.optimizers?.unit || null,
            'panel_mount_unit': pricesData.items.panel_mount?.unit || null,
            'inverter_mount_unit': pricesData.items.inverter_mount?.unit || null,
            'optimizer_mount_unit': pricesData.items.optimizer_mount?.unit || null,
            'k2_components_unit': pricesData.items.k2_components?.unit || null,
            'k2_mount_unit': pricesData.items.k2_mount?.unit || null,
            'invrdc1_unit': pricesData.items.invrdc1?.unit || null,
            'invrdc2_unit': pricesData.items.invrdc2?.unit || null,
            'rdc_unit': pricesData.items.rdc?.unit || null,
            'rfve1_unit': pricesData.items.rfve1?.unit || null,
            'rfve2_unit': pricesData.items.rfve2?.unit || null,
            'ris1_r12_unit': pricesData.items.ris1_r12?.unit || null,
            'ris1_r112_unit': pricesData.items.ris1_r112?.unit || null,
            'panels_mount_unit': pricesData.items.panels_mount?.unit || null,
            'dc_cable6_unit': pricesData.items.dc_cable6?.unit || null,
            'dc_cable10_unit': pricesData.items.dc_cable10?.unit || null,
            'ac_cables_rfve1_unit': pricesData.items.ac_cables_rfve1?.unit || null,
            'ac_cables_rfve2_unit': pricesData.items.ac_cables_rfve2?.unit || null,
            'electrical_work_unit': pricesData.items.electrical_work?.unit || null,
            'transport_unit': pricesData.items.transport?.unit || null,
            'config_unit': pricesData.items.config?.unit || null,
            'documentation_unit': pricesData.items.documentation?.unit || null
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
        const solaredgeSubtotal = (pricesData.items.se50k?.total || 0) + 
                                 (pricesData.items.se25k?.total || 0) + 
                                 (pricesData.items.optimizers?.total || 0);
        
        const mountSubtotal = (pricesData.items.panel_mount?.total || 0) + 
                             (pricesData.items.inverter_mount?.total || 0) + 
                             (pricesData.items.optimizer_mount?.total || 0);
        
        const k2Subtotal = (pricesData.items.k2_components?.total || 0) + 
                          (pricesData.items.k2_mount?.total || 0);
        
        const panelsSubtotal = (pricesData.items.invrdc1?.total || 0) + 
                              (pricesData.items.invrdc2?.total || 0) + 
                              (pricesData.items.rdc?.total || 0) + 
                              (pricesData.items.rfve1?.total || 0) + 
                              (pricesData.items.rfve2?.total || 0) + 
                              (pricesData.items.ris1_r12?.total || 0) + 
                              (pricesData.items.ris1_r112?.total || 0) + 
                              (pricesData.items.panels_mount?.total || 0);
        
        const cablesSubtotal = (pricesData.items.dc_cable6?.total || 0) + 
                              (pricesData.items.dc_cable10?.total || 0) + 
                              (pricesData.items.ac_cables_rfve1?.total || 0) + 
                              (pricesData.items.ac_cables_rfve2?.total || 0) + 
                              (pricesData.items.electrical_work?.total || 0);
        
        const transportSubtotal = pricesData.items.transport?.total || 0;
        
        const serviceSubtotal = (pricesData.items.config?.total || 0) + 
                               (pricesData.items.documentation?.total || 0);
        
        // Aktualizace skupinových součtů
        const subtotalMapping = {
            'solaredge_subtotal': solaredgeSubtotal,
            'mount_subtotal': mountSubtotal,
            'k2_subtotal': k2Subtotal,
            'panels_subtotal': panelsSubtotal,
            'cables_subtotal': cablesSubtotal,
            'transport_subtotal': transportSubtotal,
            'service_subtotal': serviceSubtotal
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