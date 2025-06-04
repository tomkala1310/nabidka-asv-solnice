#!/usr/bin/env node

/**
 * Project Generator for FVE Quote System
 * Generátor projektů pro systém FVE nabídek
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ProjectGenerator {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Hlavní funkce generátoru
     */
    async generate() {
        console.log('🏗️  Generátor nového FVE projektu');
        console.log('=====================================\n');

        try {
            const projectData = await this.collectProjectData();
            await this.createProjectStructure(projectData);
            await this.generateProjectFiles(projectData);
            
            console.log('\n✅ Projekt byl úspěšně vytvořen!');
            console.log(`📂 Složka: projects/${projectData.id}/`);
            console.log(`🔗 Kalkulator: projects/${projectData.id}/calculator.html`);
            console.log(`📋 Nabídka: projects/${projectData.id}/index.html`);
            
        } catch (error) {
            console.error('❌ Chyba při vytváření projektu:', error.message);
        } finally {
            this.rl.close();
        }
    }

    /**
     * Sběr dat o projektu
     */
    async collectProjectData() {
        console.log('Zadejte základní informace o projektu:\n');

        const data = {
            id: await this.question('ID projektu (např. "mesto-zakazka"): '),
            name: await this.question('Název projektu: '),
            title: await this.question('Popis projektu (např. "Instalace FVE Město XY"): '),
            location: await this.question('Lokace projektu: '),
            cadastre: await this.question('Katastrální území (nepovinné): '),
            
            // Klient
            clientName: await this.question('\nNázev objednatele: '),
            clientAddress: await this.question('Adresa objednatele: '),
            clientIco: await this.question('IČO objednatele (nepovinné): '),
            
            // Technické parametry
            installedPower: await this.question('\nInstalovaný výkon (kWp): '),
            acPower: await this.question('AC výkon (kW): '),
            panelCount: parseInt(await this.question('Počet FV panelů: ')),
            optimizerCount: parseInt(await this.question('Počet optimizérů: ')),
            
            // Komponenty
            useTemplate: await this.question('\nPoužít šablonu komponentů z ASV Solnice? (y/n): ')
        };

        // Validace ID projektu
        if (!data.id.match(/^[a-z0-9-]+$/)) {
            throw new Error('ID projektu smí obsahovat pouze malá písmena, číslice a pomlčky');
        }

        return data;
    }

    /**
     * Vytvoření adresářové struktury
     */
    async createProjectStructure(projectData) {
        const projectPath = path.join(process.cwd(), 'projects', projectData.id);
        
        if (fs.existsSync(projectPath)) {
            throw new Error(`Projekt ${projectData.id} již existuje`);
        }

        fs.mkdirSync(projectPath, { recursive: true });
        console.log(`✓ Vytvořena složka ${projectPath}`);
    }

    /**
     * Generování konfiguračního souboru
     */
    generateConfig(projectData) {
        const now = new Date().toISOString();
        
        const config = {
            meta: {
                projectId: projectData.id,
                name: projectData.name,
                description: projectData.title,
                created: now,
                version: "1.0"
            },
            client: {
                name: projectData.clientName,
                address: projectData.clientAddress,
                ico: projectData.clientIco || "",
                contact: {
                    person: "",
                    email: "",
                    phone: ""
                }
            },
            project: {
                title: projectData.title,
                location: projectData.location,
                cadastre: projectData.cadastre || "",
                quoteDate: new Date().toLocaleDateString('cs-CZ'),
                validityDays: 30,
                deliveryDate: "dle dohody"
            },
            technical: {
                installedPower: projectData.installedPower + " kWp",
                acPower: projectData.acPower + " kW",
                panelCount: projectData.panelCount,
                optimizerCount: projectData.optimizerCount,
                fieldCount: 1,
                yearlyProduction: "TBD MWh/rok"
            },
            budget: {
                items: this.generateBudgetItems(projectData),
                vat: 0.21,
                currency: "Kč"
            },
            terms: {
                payment: "30% záloha, 70% při předání",
                warranty: {
                    mounting: "5 let na montáž",
                    components: "dle výrobce"
                },
                included: [
                    "Kompletní dodávka komponentů",
                    "Montáž a instalace",
                    "Uvedení do provozu",
                    "Dokumentace"
                ],
                excluded: []
            },
            contractor: {
                name: "iSolar PV s.r.o.",
                ico: "14281597",
                address: "Hronovická 663, Pardubice 53002",
                contact: {
                    person: "Kalabis Tomáš",
                    position: "Jednatel společnosti",
                    phone: "+420 602 837 611",
                    email: "tomas.kalabis@isolarpv.cz"
                }
            }
        };

        return config;
    }

    /**
     * Generování rozpočtových položek
     */
    generateBudgetItems(projectData) {
        if (projectData.useTemplate.toLowerCase() === 'y') {
            // Použití šablony z ASV Solnice
            return [
                { componentId: "se50k", quantity: 1 },
                { componentId: "se25k", quantity: 0 },
                { componentId: "optimizers", quantity: projectData.optimizerCount },
                { componentId: "panel_mount", quantity: projectData.panelCount },
                { componentId: "inverter_mount", quantity: 1 },
                { componentId: "optimizer_mount", quantity: projectData.optimizerCount },
                { componentId: "k2_components", quantity: 1 },
                { componentId: "k2_mount", quantity: projectData.panelCount },
                { componentId: "transport", quantity: 100 },
                { componentId: "config", quantity: 1 },
                { componentId: "documentation", quantity: 1 }
            ];
        } else {
            // Základní šablona
            return [
                { componentId: "optimizers", quantity: projectData.optimizerCount },
                { componentId: "panel_mount", quantity: projectData.panelCount },
                { componentId: "transport", quantity: 100 },
                { componentId: "config", quantity: 1 }
            ];
        }
    }

    /**
     * Generování prázdného prices.json
     */
    generateEmptyPrices() {
        return {
            lastUpdated: new Date().toISOString(),
            items: {},
            totals: {
                withoutVat: 0,
                vat: 0,
                withVat: 0
            }
        };
    }

    /**
     * Generování HTML kalkulátoru
     */
    generateCalculatorHtml(projectData) {
        return `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rozpočtová kalkulace - ${projectData.name}</title>
    <link rel="stylesheet" href="../../styles/calculator.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Rozpočtová kalkulace FVE</h1>
            <p>${projectData.title} - Profesionální rozpočtování</p>
        </div>

        <div class="content">
            <div class="budget-section">
                <h2 class="section-title">📋 Rozpočtová kalkulace</h2>
                <div id="budget-groups"></div>
                <div class="controls">
                    <button class="btn" onclick="calculateBudget()">🔄 Přepočítat rozpočet</button>
                    <button class="btn btn-secondary" onclick="resetBudget()">↩️ Výchozí hodnoty</button>
                    <button class="btn" onclick="exportBudget()">📝 Export do nabídky</button>
                    <button class="btn btn-success" onclick="saveProject()">💾 Uložit projekt</button>
                </div>
            </div>

            <div class="preview-section">
                <h2 class="section-title">📊 Shrnutí rozpočtu</h2>
                <div class="summary-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="total_items">0</div>
                        <div class="stat-label">Rozpočtových položek</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="total_cost">0</div>
                        <div class="stat-label">Náklady celkem</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="total_margin">0</div>
                        <div class="stat-label">Marže celkem</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="avg_margin">0%</div>
                        <div class="stat-label">Průměrná marže</div>
                    </div>
                </div>
                <table class="preview-table">
                    <thead>
                        <tr><th>Skupina</th><th>Náklad</th><th>Marže</th><th>Celkem</th></tr>
                    </thead>
                    <tbody id="preview_tbody"></tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td><strong>CELKEM bez DPH</strong></td>
                            <td class="price-cell" id="preview_total_cost"><strong>0</strong></td>
                            <td class="price-cell" id="preview_total_margin"><strong>0</strong></td>
                            <td class="price-cell" id="preview_total_final"><strong>0</strong></td>
                        </tr>
                        <tr>
                            <td>DPH 21%</td><td></td><td></td>
                            <td class="price-cell" id="preview_vat">0</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>CELKEM s DPH</strong></td><td></td><td></td>
                            <td class="price-cell" id="preview_total_with_vat"><strong>0</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>

    <template id="group-template">
        <div class="item-group">
            <h3></h3>
            <div class="budget-header">
                <div>Položka</div><div>Množství</div><div>Jednotka</div>
                <div>Jedn. cena</div><div>Marže %</div><div>Celkem</div>
            </div>
            <div class="group-items"></div>
        </div>
    </template>

    <template id="item-template">
        <div class="budget-item">
            <div class="item-label"></div>
            <input type="number" class="input-field qty-input" min="0" autocomplete="off">
            <select class="input-field unit-select" autocomplete="off"></select>
            <input type="number" class="input-field price-input" min="0" autocomplete="off">
            <input type="number" class="input-field margin-input" min="0" autocomplete="off">
            <div class="final-price">0</div>
        </div>
    </template>

    <script src="../../js/calculator-engine.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', async function() {
            try {
                await calculator.loadProjectConfiguration();
                await calculator.loadComponentsDatabase();
                calculator.generateCalculatorInterface();
                calculator.setupEventListeners();
                calculator.calculateBudget();
                calculator.showNotification('✅ Kalkulator projektu ${projectData.name} načten');
            } catch (error) {
                console.error('Chyba při inicializaci:', error);
                calculator.showNotification('❌ ' + error.message, 'error');
            }
        });
    </script>
</body>
</html>`;
    }

    /**
     * Generování všech souborů projektu
     */
    async generateProjectFiles(projectData) {
        const projectPath = path.join(process.cwd(), 'projects', projectData.id);
        
        // config.json
        const config = this.generateConfig(projectData);
        fs.writeFileSync(
            path.join(projectPath, 'config.json'),
            JSON.stringify(config, null, 2),
            'utf8'
        );
        console.log('✓ Vygenerován config.json');

        // prices.json
        const prices = this.generateEmptyPrices();
        fs.writeFileSync(
            path.join(projectPath, 'prices.json'),
            JSON.stringify(prices, null, 2),
            'utf8'
        );
        console.log('✓ Vygenerován prázdný prices.json');

        // calculator.html
        const calculatorHtml = this.generateCalculatorHtml(projectData);
        fs.writeFileSync(
            path.join(projectPath, 'calculator.html'),
            calculatorHtml,
            'utf8'
        );
        console.log('✓ Vygenerován calculator.html');

        // README.md
        const readme = this.generateReadme(projectData);
        fs.writeFileSync(
            path.join(projectPath, 'README.md'),
            readme,
            'utf8'
        );
        console.log('✓ Vygenerován README.md');
    }

    /**
     * Generování README
     */
    generateReadme(projectData) {
        return `# ${projectData.name}

## Základní informace
- **Projekt:** ${projectData.title}
- **Lokace:** ${projectData.location}
- **Objednatel:** ${projectData.clientName}
- **Instalovaný výkon:** ${projectData.installedPower} kWp
- **Datum vytvoření:** ${new Date().toLocaleDateString('cs-CZ')}

## Soubory
- \`config.json\` - Konfigurace projektu
- \`prices.json\` - Aktuální ceny (generováno kalkulátorem)
- \`calculator.html\` - Rozpočtový kalkulator
- \`index.html\` - Veřejná nabídka (bude vygenerována)

## Postup práce
1. Otevřete \`calculator.html\` v prohlížeči
2. Nastavte množství a ceny komponentů
3. Exportujte JSON pro aktualizaci \`prices.json\`
4. Commitněte změny do Gitu pro aktivaci automatizace

## Technické parametry
- Panely: ${projectData.panelCount} ks
- Optimizéry: ${projectData.optimizerCount} ks
- AC výkon: ${projectData.acPower} kW
`;
    }

    /**
     * Pomocná funkce pro vstup
     */
    question(query) {
        return new Promise(resolve => {
            this.rl.question(query, resolve);
        });
    }
}

// Spuštění generátoru
if (require.main === module) {
    const generator = new ProjectGenerator();
    generator.generate().catch(console.error);
}

module.exports = ProjectGenerator;