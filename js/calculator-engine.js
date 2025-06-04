/**
 * Universal Calculator Engine for FVE Quotes
 * Univerzální kalkukační engine pro FVE nabídky
 */

class CalculatorEngine {
    constructor() {
        this.projectConfig = null;
        this.componentsDatabase = null;
        this.budgetItems = [];
        this.isDirty = false;
    }

    /**
     * Načtení konfigurace projektu
     */
    async loadProjectConfiguration() {
        try {
            const projectId = this.getProjectIdFromUrl();
            const response = await fetch(`../projects/${projectId}/config.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.projectConfig = await response.json();
            console.log('✓ Konfigurace projektu načtena:', this.projectConfig.meta.name);
        } catch (error) {
            console.error('Chyba při načítání konfigurace:', error);
            throw new Error('Nepodařilo se načíst konfiguraci projektu');
        }
    }

    /**
     * Načtení databáze komponentů
     */
    async loadComponentsDatabase() {
        try {
            const response = await fetch('../database/components.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.componentsDatabase = await response.json();
            console.log('✓ Databáze komponentů načtena:', Object.keys(this.componentsDatabase.components).length, 'položek');
        } catch (error) {
            console.error('Chyba při načítání databáze:', error);
            throw new Error('Nepodařilo se načíst databázi komponentů');
        }
    }

    /**
     * Získání ID projektu z URL
     */
    getProjectIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        const projectIndex = pathParts.indexOf('projects');
        if (projectIndex !== -1 && pathParts[projectIndex + 1]) {
            return pathParts[projectIndex + 1];
        }
        // Fallback pro development
        return 'asv-solnice';
    }

    /**
     * Vygenerování rozhraní kalkulátoru
     */
    generateCalculatorInterface() {
        this.replacePlaceholders();
        this.generateBudgetGroups();
        this.loadSavedState();
    }

    /**
     * Nahrazení placeholder hodnot v HTML
     */
    replacePlaceholders() {
        const replacements = {
            '{{PROJECT_NAME}}': this.projectConfig.meta.name,
            '{{PROJECT_TITLE}}': this.projectConfig.project.title,
            '{{VAT_RATE}}': (this.projectConfig.budget.vat * 100).toString()
        };

        Object.entries(replacements).forEach(([placeholder, value]) => {
            document.body.innerHTML = document.body.innerHTML.replace(
                new RegExp(placeholder, 'g'), 
                value
            );
        });
    }

    /**
     * Vygenerování skupin rozpočtu
     */
    generateBudgetGroups() {
        const container = document.getElementById('budget-groups');
        const groupTemplate = document.getElementById('group-template');
        const itemTemplate = document.getElementById('item-template');
        
        // Seskupení položek podle kategorií
        const groupedItems = this.groupItemsByCategory();
        
        Object.entries(groupedItems).forEach(([categoryId, items]) => {
            const category = this.componentsDatabase.categories[categoryId];
            if (!category) return;

            // Klonování template skupiny
            const groupElement = groupTemplate.content.cloneNode(true);
            const groupDiv = groupElement.querySelector('.item-group');
            
            // Nastavení názvu skupiny
            const groupTitle = groupElement.querySelector('h3');
            groupTitle.innerHTML = `${category.icon} ${category.name}`;
            
            // Container pro položky skupiny
            const itemsContainer = groupElement.querySelector('.group-items');
            
            // Generování položek
            items.forEach(budgetItem => {
                const component = this.componentsDatabase.components[budgetItem.componentId];
                if (!component) return;

                const itemElement = itemTemplate.content.cloneNode(true);
                
                // Nahrazení placeholder hodnot
                this.replaceItemPlaceholders(itemElement, budgetItem, component);
                
                itemsContainer.appendChild(itemElement);
            });
            
            container.appendChild(groupElement);
        });
        
        console.log('✓ Rozhraní kalkulátoru vygenerováno');
    }

    /**
     * Seskupení položek podle kategorií
     */
    groupItemsByCategory() {
        const grouped = {};
        
        this.projectConfig.budget.items.forEach(item => {
            const component = this.componentsDatabase.components[item.componentId];
            if (!component) return;
            
            const categoryId = component.category;
            if (!grouped[categoryId]) {
                grouped[categoryId] = [];
            }
            grouped[categoryId].push(item);
        });
        
        return grouped;
    }

    /**
     * Nahrazení placeholder hodnot v položce
     */
    replaceItemPlaceholders(itemElement, budgetItem, component) {
        const replacements = {
            '{{COMPONENT_ID}}': budgetItem.componentId,
            '{{COMPONENT_NAME}}': budgetItem.customName || component.name,
            '{{QUANTITY}}': budgetItem.quantity || 0,
            '{{BASE_PRICE}}': budgetItem.customPrice || component.basePrice,
            '{{DEFAULT_MARGIN}}': budgetItem.customMargin || component.defaultMargin,
            '{{UNIT_OPTIONS}}': this.generateUnitOptions(component.unit)
        };

        Object.entries(replacements).forEach(([placeholder, value]) => {
            itemElement.innerHTML = itemElement.innerHTML.replace(
                new RegExp(placeholder, 'g'), 
                value.toString()
            );
        });
    }

    /**
     * Generování možností jednotek
     */
    generateUnitOptions(defaultUnit) {
        const commonUnits = ['ks', 'soubor', 'm', 'km', 'hod', 'kg'];
        const units = [defaultUnit, ...commonUnits.filter(u => u !== defaultUnit)];
        
        return units.map(unit => 
            `<option value="${unit}" ${unit === defaultUnit ? 'selected' : ''}>${unit}</option>`
        ).join('');
    }

    /**
     * Nastavení event listenerů
     */
    setupEventListeners() {
        const inputs = document.querySelectorAll('.input-field');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculateBudget();
                this.markAsChanged(input);
                this.isDirty = true;
            });
            
            input.addEventListener('change', () => {
                this.calculateBudget();
                this.saveState();
            });
        });

        // Auto-save při zavírání stránky
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                this.saveState();
                e.preventDefault();
                e.returnValue = '';
            }
        });

        console.log('✓ Event listenery nastaveny');
    }

    /**
     * Označení změněného pole
     */
    markAsChanged(element) {
        element.classList.add('changed');
        setTimeout(() => element.classList.remove('changed'), 500);
    }

    /**
     * Výpočet rozpočtu
     */
    calculateBudget() {
        let totalCost = 0;
        let totalFinal = 0;
        const groupTotals = {};
        let itemCount = 0;

        this.projectConfig.budget.items.forEach(budgetItem => {
            const component = this.componentsDatabase.components[budgetItem.componentId];
            if (!component) return;

            const qty = parseFloat(document.getElementById(budgetItem.componentId + '_qty')?.value) || 0;
            const price = parseFloat(document.getElementById(budgetItem.componentId + '_price')?.value) || 0;
            const margin = parseFloat(document.getElementById(budgetItem.componentId + '_margin')?.value) || 0;
            
            const itemCost = qty * price;
            const itemFinal = itemCost * (1 + margin / 100);
            
            // Aktualizace zobrazení
            const totalElement = document.getElementById(budgetItem.componentId + '_total');
            if (totalElement) {
                totalElement.textContent = this.formatNumber(itemFinal);
            }
            
            // Přidání do celkových součtů
            totalCost += itemCost;
            totalFinal += itemFinal;
            if (qty > 0) itemCount++;
            
            // Přidání do skupinových součtů
            const categoryId = component.category;
            const categoryName = this.componentsDatabase.categories[categoryId]?.name || 'Ostatní';
            
            if (!groupTotals[categoryName]) {
                groupTotals[categoryName] = { cost: 0, final: 0 };
            }
            groupTotals[categoryName].cost += itemCost;
            groupTotals[categoryName].final += itemFinal;
        });

        this.updateSummaryStats(itemCount, totalCost, totalFinal);
        this.updatePreviewTable(groupTotals, totalCost, totalFinal);
    }

    /**
     * Aktualizace souhrnných statistik
     */
    updateSummaryStats(itemCount, totalCost, totalFinal) {
        const totalMargin = totalFinal - totalCost;
        const marginPercent = totalCost > 0 ? (totalMargin / totalCost * 100) : 0;
        
        this.updateElement('total_items', itemCount);
        this.updateElement('total_cost', this.formatNumber(totalCost));
        this.updateElement('total_margin', this.formatNumber(totalMargin));
        this.updateElement('avg_margin', marginPercent.toFixed(1) + '%');
    }

    /**
     * Aktualizace náhledové tabulky
     */
    updatePreviewTable(groupTotals, totalCost, totalFinal) {
        const tbody = document.getElementById('preview_tbody');
        if (!tbody) return;

        let previewRows = '';
        Object.entries(groupTotals).forEach(([groupName, group]) => {
            const groupMargin = group.final - group.cost;
            previewRows += `
                <tr>
                    <td>${groupName}</td>
                    <td class="price-cell">${this.formatNumber(group.cost)}</td>
                    <td class="price-cell">${this.formatNumber(groupMargin)}</td>
                    <td class="price-cell">${this.formatNumber(group.final)}</td>
                </tr>
            `;
        });

        tbody.innerHTML = previewRows;
        
        const totalMargin = totalFinal - totalCost;
        this.updateElement('preview_total_cost', `<strong>${this.formatNumber(totalCost)}</strong>`);
        this.updateElement('preview_total_margin', `<strong>${this.formatNumber(totalMargin)}</strong>`);
        this.updateElement('preview_total_final', `<strong>${this.formatNumber(totalFinal)}</strong>`);
        
        // DPH a celkem s DPH
        const vat = totalFinal * this.projectConfig.budget.vat;
        const totalWithVat = totalFinal + vat;
        this.updateElement('preview_vat', this.formatNumber(vat));
        this.updateElement('preview_total_with_vat', `<strong>${this.formatNumber(totalWithVat)}</strong>`);
    }

    /**
     * Aktualizace elementu
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = content;
        }
    }

    /**
     * Formátování čísel
     */
    formatNumber(num) {
        return Math.round(num).toLocaleString('cs-CZ');
    }

    /**
     * Uložení stavu kalkulátoru
     */
    saveState() {
        const state = {
            projectId: this.projectConfig.meta.projectId,
            timestamp: new Date().toISOString(),
            items: {}
        };

        this.projectConfig.budget.items.forEach(budgetItem => {
            const qty = document.getElementById(budgetItem.componentId + '_qty')?.value;
            const unit = document.getElementById(budgetItem.componentId + '_unit')?.value;
            const price = document.getElementById(budgetItem.componentId + '_price')?.value;
            const margin = document.getElementById(budgetItem.componentId + '_margin')?.value;

            state.items[budgetItem.componentId] = {
                qty, unit, price, margin
            };
        });

        localStorage.setItem(`calculator_${this.projectConfig.meta.projectId}`, JSON.stringify(state));
        this.isDirty = false;
        console.log('✓ Stav kalkulátoru uložen');
    }

    /**
     * Načtení uloženého stavu
     */
    loadSavedState() {
        const savedState = localStorage.getItem(`calculator_${this.projectConfig.meta.projectId}`);
        if (!savedState) return false;

        try {
            const state = JSON.parse(savedState);
            let loadedCount = 0;

            Object.entries(state.items).forEach(([componentId, values]) => {
                if (values.qty !== undefined) {
                    const qtyEl = document.getElementById(componentId + '_qty');
                    if (qtyEl) { qtyEl.value = values.qty; loadedCount++; }
                }
                if (values.unit !== undefined) {
                    const unitEl = document.getElementById(componentId + '_unit');
                    if (unitEl) unitEl.value = values.unit;
                }
                if (values.price !== undefined) {
                    const priceEl = document.getElementById(componentId + '_price');
                    if (priceEl) priceEl.value = values.price;
                }
                if (values.margin !== undefined) {
                    const marginEl = document.getElementById(componentId + '_margin');
                    if (marginEl) marginEl.value = values.margin;
                }
            });

            if (loadedCount > 0) {
                this.showNotification(`✅ Načten uložený stav (${loadedCount} položek)`);
                return true;
            }
        } catch (error) {
            console.error('Chyba při načítání stavu:', error);
        }
        return false;
    }

    /**
     * Export rozpočtu pro GitHub
     */
    exportBudget() {
        this.calculateBudget();
        
        const exportData = {
            lastUpdated: new Date().toISOString(),
            items: {},
            totals: {}
        };
        
        let totalWithoutVat = 0;
        
        this.projectConfig.budget.items.forEach(budgetItem => {
            const qty = parseInt(document.getElementById(budgetItem.componentId + '_qty')?.value) || 0;
            const unit = document.getElementById(budgetItem.componentId + '_unit')?.value || 'ks';
            const price = parseFloat(document.getElementById(budgetItem.componentId + '_price')?.value) || 0;
            const margin = parseFloat(document.getElementById(budgetItem.componentId + '_margin')?.value) || 0;
            const total = Math.round(price * qty * (1 + margin / 100));
            
            exportData.items[budgetItem.componentId] = {
                qty: qty,
                unit: unit,
                total: total
            };
            
            totalWithoutVat += total;
        });
        
        const vat = Math.round(totalWithoutVat * this.projectConfig.budget.vat);
        const totalWithVat = totalWithoutVat + vat;
        
        exportData.totals = {
            withoutVat: totalWithoutVat,
            vat: vat,
            withVat: totalWithVat
        };
        
        this.showJSONModal(JSON.stringify(exportData, null, 2));
    }

    /**
     * Zobrazení JSON modalu
     */
    showJSONModal(jsonContent) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 2000; display: flex;
            justify-content: center; align-items: center;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; padding: 30px; border-radius: 10px; 
            max-width: 80%; max-height: 80%; overflow: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 20px; color: var(--primary-color);">📋 JSON pro aktualizaci ${this.projectConfig.meta.projectId}/prices.json</h3>
            <p style="margin-bottom: 15px; color: #666;">
                <strong>INSTRUKCE:</strong> Vyberte veškerý text v poli níže a zkopírujte jej
            </p>
            <textarea id="jsonTextArea" style="width: 100%; height: 400px; font-family: monospace; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" 
                      readonly>${jsonContent}</textarea>
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="calculator.selectAllAndCopy()" 
                        style="background: var(--success-color); color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                    📋 Vybrat vše a zkopírovat
                </button>
                <button onclick="document.body.removeChild(document.querySelector('.modal-overlay'))" 
                        style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    ✖️ Zavřít
                </button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    /**
     * Výběr a kopírování textu
     */
    selectAllAndCopy() {
        const textarea = document.getElementById('jsonTextArea');
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            this.showNotification('✅ JSON zkopírován do schránky!');
        } catch (err) {
            this.showNotification('❌ Kopírování selhalo. Vyberte text ručně.', 'error');
        }
    }

    /**
     * Reset kalkulátoru
     */
    resetBudget() {
        if (confirm('Opravdu chcete obnovit všechny hodnoty na výchozí?')) {
            localStorage.removeItem(`calculator_${this.projectConfig.meta.projectId}`);
            location.reload();
        }
    }

    /**
     * Uložení projektu
     */
    async saveProject() {
        this.showNotification('💾 Ukládání projektu...', 'info');
        this.saveState();
        
        // Zde by byla implementace ukládání do souboru nebo API
        setTimeout(() => {
            this.showNotification('✅ Projekt byl uložen');
        }, 1000);
    }

    /**
     * Zobrazení notifikace
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, type === 'error' ? 5000 : 3000);
    }
}

// Globální instance kalkulátoru
const calculator = new CalculatorEngine();

// Globální funkce pro kompatibilitu
async function loadProjectConfiguration() {
    return calculator.loadProjectConfiguration();
}

async function loadComponentsDatabase() {
    return calculator.loadComponentsDatabase();
}

function generateCalculatorInterface() {
    return calculator.generateCalculatorInterface();
}

function setupEventListeners() {
    return calculator.setupEventListeners();
}

function calculateBudget() {
    return calculator.calculateBudget();
}

function exportBudget() {
    return calculator.exportBudget();
}

function resetBudget() {
    return calculator.resetBudget();
}

function saveProject() {
    return calculator.saveProject();
}

function showNotification(message, type) {
    return calculator.showNotification(message, type);
}