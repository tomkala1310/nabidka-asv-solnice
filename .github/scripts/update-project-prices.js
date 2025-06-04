#!/usr/bin/env node

/**
 * Universal Project Price Updater
 * Univerzální aktualizátor cen pro projekty
 */

const fs = require('fs');
const path = require('path');

class ProjectPriceUpdater {
    constructor(projectId) {
        this.projectId = projectId;
        this.projectPath = path.join(process.cwd(), 'projects', projectId);
        this.pricesPath = path.join(this.projectPath, 'prices.json');
        this.configPath = path.join(this.projectPath, 'config.json');
        this.indexPath = path.join(this.projectPath, 'index.html');
    }

    /**
     * Hlavní funkce aktualizace
     */
    async update() {
        console.log(`🚀 Aktualizuji projekt: ${this.projectId}`);
        
        try {
            // Načtení dat
            const pricesData = this.loadPricesData();
            const configData = this.loadConfigData();
            
            console.log(`✓ Načtena data pro projekt: ${configData.meta.name}`);
            console.log(`📊 Celková cena s DPH: ${this.formatPrice(pricesData.totals?.withVat || 0)} Kč`);
            
            // Aktualizace HTML nabídky
            await this.updateOrCreateQuoteHtml(pricesData, configData);
            
            console.log('✅ Aktualizace dokončena!');
            
        } catch (error) {
            console.error('❌ Chyba při aktualizaci:', error.message);
            process.exit(1);
        }
    }

    /**
     * Načtení cen z prices.json
     */
    loadPricesData() {
        try {
            if (!fs.existsSync(this.pricesPath)) {
                throw new Error(`Soubor ${this.pricesPath} neexistuje`);
            }
            
            const data = fs.readFileSync(this.pricesPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Chyba při čtení prices.json: ${error.message}`);
        }
    }

    /**
     * Načtení konfigurace projektu
     */
    loadConfigData() {
        try {
            if (!fs.existsSync(this.configPath)) {
                throw new Error(`Soubor ${this.configPath} neexistuje`);
            }
            
            const data = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Chyba při čtení config.json: ${error.message}`);
        }
    }

    /**
     * Aktualizace nebo vytvoření HTML nabídky
     */
    async updateOrCreateQuoteHtml(pricesData, configData) {
        let htmlContent;
        
        if (fs.existsSync(this.indexPath)) {
            // Aktualizace existujícího HTML
            console.log('📝 Aktualizuji existující index.html');
            htmlContent = fs.readFileSync(this.indexPath, 'utf8');
            htmlContent = this.updateExistingHtml(htmlContent, pricesData, configData);
        } else {
            // Vytvoření nového HTML z template
            console.log('🆕 Vytvářím nový index.html z template');
            htmlContent = await this.generateQuoteFromTemplate(pricesData, configData);
        }
        
        // Uložení aktualizovaného HTML
        fs.writeFileSync(this.indexPath, htmlContent, 'utf8');
        console.log('✓ HTML nabídka aktualizována');
    }

    /**
     * Aktualizace existujícího HTML
     */
    updateExistingHtml(htmlContent, pricesData, configData) {
        let changesCount = 0;
        
        // Mapování položek z prices.json na HTML elementy
        Object.entries(pricesData.items || {}).forEach(([itemId, itemData]) => {
            // Aktualizace množství
            const qtyRegex = new RegExp(`(<td[^>]*id="${itemId}_qty"[^>]*>)[^<]*(</td>)`, 'g');
            const oldQtyContent = htmlContent;
            htmlContent = htmlContent.replace(qtyRegex, `$1${itemData.qty || 0}$2`);
            if (oldQtyContent !== htmlContent) changesCount++;
            
            // Aktualizace jednotky
            const unitRegex = new RegExp(`(<td[^>]*id="${itemId}_unit"[^>]*>)[^<]*(</td>)`, 'g');
            const oldUnitContent = htmlContent;
            htmlContent = htmlContent.replace(unitRegex, `$1${itemData.unit || 'ks'}$2`);
            if (oldUnitContent !== htmlContent) changesCount++;
            
            // Aktualizace celkové ceny
            const totalRegex = new RegExp(`(<td[^>]*id="${itemId}_total"[^>]*>)[^<]*(</td>)`, 'g');
            const oldTotalContent = htmlContent;
            const formattedTotal = this.formatPrice(itemData.total || 0) + ' Kč';
            htmlContent = htmlContent.replace(totalRegex, `$1${formattedTotal}$2`);
            if (oldTotalContent !== htmlContent) changesCount++;
        });
        
        // Aktualizace celkových součtů
        if (pricesData.totals) {
            const totalsMapping = {
                'total-without-vat': pricesData.totals.withoutVat,
                'vat-amount': pricesData.totals.vat,
                'total-with-vat': pricesData.totals.withVat
            };
            
            Object.entries(totalsMapping).forEach(([elementId, value]) => {
                if (value !== undefined) {
                    const regex = new RegExp(`(<td[^>]*id="${elementId}"[^>]*>)[^<]*(</td>)`, 'g');
                    const oldContent = htmlContent;
                    const formattedValue = this.formatPrice(value) + ' Kč';
                    htmlContent = htmlContent.replace(regex, `$1${formattedValue}$2`);
                    if (oldContent !== htmlContent) changesCount++;
                }
            });
        }
        
        // Aktualizace metadat
        htmlContent = this.updateMetadata(htmlContent, configData);
        
        console.log(`✓ Aktualizováno ${changesCount} cenových položek`);
        return htmlContent;
    }

    /**
     * Generování nového HTML z template
     */
    async generateQuoteFromTemplate(pricesData, configData) {
        // Načtení template z nadřazené složky
        const templatePath = path.join(process.cwd(), 'templates', 'quote-template.html');
        
        if (!fs.existsSync(templatePath)) {
            // Fallback - vytvoření základního HTML
            return this.generateBasicQuoteHtml(pricesData, configData);
        }
        
        let template = fs.readFileSync(templatePath, 'utf8');
        
        // Nahrazení placeholderů
        template = this.replacePlaceholders(template, configData);
        
        // Vygenerování tabulky položek
        template = this.generateItemsTable(template, pricesData, configData);
        
        return template;
    }

    /**
     * Generování základního HTML (fallback)
     */
    generateBasicQuoteHtml(pricesData, configData) {
        const totalWithVat = pricesData.totals?.withVat || 0;
        const totalWithoutVat = pricesData.totals?.withoutVat || 0;
        const vat = pricesData.totals?.vat || 0;
        
        return `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cenová nabídka - ${configData.meta.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #2c5aa0; color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
        .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .budget-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .budget-table th { background: #2c5aa0; color: white; padding: 12px; }
        .budget-table td { padding: 10px; border: 1px solid #ddd; }
        .total-row { background: #2c5aa0; color: white; font-weight: bold; }
        .price-cell { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Cenová nabídka</h1>
        <h2>${configData.project.title}</h2>
    </div>
    
    <div class="info-section">
        <div class="info-box">
            <h3>📋 Informace o projektu</h3>
            <p><strong>Název:</strong> ${configData.project.title}</p>
            <p><strong>Lokace:</strong> ${configData.project.location}</p>
            <p><strong>Datum nabídky:</strong> ${configData.project.quoteDate}</p>
        </div>
        <div class="info-box">
            <h3>🏢 Objednatel</h3>
            <p><strong>Název:</strong> ${configData.client.name}</p>
            <p><strong>Adresa:</strong> ${configData.client.address}</p>
            ${configData.client.ico ? `<p><strong>IČO:</strong> ${configData.client.ico}</p>` : ''}
        </div>
    </div>
    
    <div class="budget-section">
        <h2>Položkový rozpočet</h2>
        <table class="budget-table">
            <thead>
                <tr>
                    <th>Položka</th>
                    <th>Množství</th>
                    <th>Jednotka</th>
                    <th>Cena celkem</th>
                </tr>
            </thead>
            <tbody>
                ${this.generateItemRows(pricesData, configData)}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"><strong>CELKEM bez DPH</strong></td>
                    <td class="price-cell" id="total-without-vat"><strong>${this.formatPrice(totalWithoutVat)} Kč</strong></td>
                </tr>
                <tr>
                    <td colspan="3">DPH ${(configData.budget.vat * 100)}%</td>
                    <td class="price-cell" id="vat-amount">${this.formatPrice(vat)} Kč</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3"><strong>CELKEM s DPH</strong></td>
                    <td class="price-cell" id="total-with-vat"><strong>${this.formatPrice(totalWithVat)} Kč</strong></td>
                </tr>
            </tfoot>
        </table>
    </div>
    
    <div class="footer">
        <h3>Kontakt</h3>
        <p><strong>${configData.contractor.contact.person}</strong><br>
        ${configData.contractor.name}<br>
        Tel: ${configData.contractor.contact.phone}<br>
        Email: ${configData.contractor.contact.email}</p>
    </div>
</body>
</html>`;
    }

    /**
     * Generování řádků položek
     */
    generateItemRows(pricesData, configData) {
        // Načtení databáze komponentů pro názvy
        const componentsDbPath = path.join(process.cwd(), 'database', 'components.json');
        let componentsDb = {};
        
        if (fs.existsSync(componentsDbPath)) {
            try {
                componentsDb = JSON.parse(fs.readFileSync(componentsDbPath, 'utf8'));
            } catch (error) {
                console.warn('⚠️ Nepodařilo se načíst databázi komponentů');
            }
        }
        
        let rows = '';
        
        Object.entries(pricesData.items || {}).forEach(([itemId, itemData]) => {
            if ((itemData.qty || 0) === 0) return; // Přeskočit nulové položky
            
            const component = componentsDb.components?.[itemId];
            const name = component?.name || itemId;
            const qty = itemData.qty || 0;
            const unit = itemData.unit || 'ks';
            const total = this.formatPrice(itemData.total || 0);
            
            rows += `
                <tr>
                    <td>${name}</td>
                    <td id="${itemId}_qty" style="text-align: center;">${qty}</td>
                    <td id="${itemId}_unit" style="text-align: center;">${unit}</td>
                    <td id="${itemId}_total" class="price-cell">${total} Kč</td>
                </tr>
            `;
        });
        
        return rows;
    }

    /**
     * Nahrazení placeholderů v template
     */
    replacePlaceholders(template, configData) {
        const replacements = {
            '{{PROJECT_NAME}}': configData.meta.name,
            '{{PROJECT_TITLE}}': configData.project.title,
            '{{PROJECT_LOCATION}}': configData.project.location,
            '{{QUOTE_DATE}}': configData.project.quoteDate,
            '{{CLIENT_NAME}}': configData.client.name,
            '{{CLIENT_ADDRESS}}': configData.client.address,
            '{{CLIENT_ICO}}': configData.client.ico || '',
            '{{CONTRACTOR_NAME}}': configData.contractor.name,
            '{{CONTRACTOR_PERSON}}': configData.contractor.contact.person,
            '{{CONTRACTOR_PHONE}}': configData.contractor.contact.phone,
            '{{CONTRACTOR_EMAIL}}': configData.contractor.contact.email,
            '{{VAT_RATE}}': (configData.budget.vat * 100).toString()
        };
        
        Object.entries(replacements).forEach(([placeholder, value]) => {
            template = template.replace(new RegExp(placeholder, 'g'), value);
        });
        
        return template;
    }

    /**
     * Aktualizace metadat v HTML
     */
    updateMetadata(htmlContent, configData) {
        // Aktualizace titulu
        htmlContent = htmlContent.replace(
            /<title>([^<]*)<\/title>/,
            `<title>Cenová nabídka - ${configData.meta.name}</title>`
        );
        
        // Další metadata by mohla být aktualizována zde
        
        return htmlContent;
    }

    /**
     * Formátování ceny
     */
    formatPrice(price) {
        return Math.round(price).toLocaleString('cs-CZ');
    }
}

// Spuštění skriptu
if (require.main === module) {
    const projectId = process.argv[2];
    
    if (!projectId) {
        console.error('❌ Chybí ID projektu');
        console.log('Použití: node update-project-prices.js <project-id>');
        process.exit(1);
    }
    
    const updater = new ProjectPriceUpdater(projectId);
    updater.update().catch(error => {
        console.error('❌ Chyba:', error.message);
        process.exit(1);
    });
}

module.exports = ProjectPriceUpdater;