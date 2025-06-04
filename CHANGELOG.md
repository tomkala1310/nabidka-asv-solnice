# 📝 Changelog

Všechny významné změny v projektu budou dokumentovány v tomto souboru.

## [2.0.0] - 2025-06-04

### ✨ Přidáno

**🏗️ Univerzální architektura**
- Centrální databáze komponentů (`database/components.json`)
- Konfigurovatelné projekty v `projects/` složce
- Univerzální JavaScript engine pro kalkulátory
- Automatický generátor nových projektů

**🤖 Pokročilá automatizace**
- Multi-projekt GitHub Actions workflow
- Automatická detekce změn v projektech  
- Inteligentní aktualizace HTML nabídek
- Podpora pro současnou aktualizaci více projektů

**🎨 Šablonový systém**
- Univerzální šablona kalkulátoru
- Dynamické generování rozhraní
- Kategorizace komponentů s ikonami
- Responzivní CSS design

**⚙️ Pokročilé funkce**
- Auto-save stavu kalkulátoru
- Vlastní ceny a marže pro projekty
- Podmíněné zobrazení komponentů
- Export do standardizovaného JSON formátu

### 🔄 Změněno

- **Refaktorována** celá architektura ze single-project na multi-project
- **Migrována** data ASV Solnice do nové struktury
- **Vylepšena** uživatelská zkušenost kalkulátoru
- **Zoptimalizována** GitHub Actions pro lepší výkon

### ⬆️ Upgrade z verze 1.x

1. Původní `index.html` → `projects/asv-solnice/index.html`
2. Původní `prices.json` → `projects/asv-solnice/prices.json`  
3. Původní `rozpocet-kalkulace.html` → nový univerzální kalkulator
4. Nová konfigurace v `projects/asv-solnice/config.json`

### 🚀 Výkonnost

- **95% rychlejší** vytváření nových projektů (5 minut vs. hodiny)
- **Automatická synchronizace** všech projektů
- **Centralizovaná správa** komponentů a cen
- **Škálovatelnost** na desítky současných projektů

## [1.x] - Předchozí verze

### Legacy systém (zachována kompatibilita)
- Hardcoded struktura pro jeden projekt
- Manuální kopírování dat mezi soubory
- Základní GitHub Actions automatizace
- Funkční kalkulator s exportem

---

*Pro detailní informace o změnách viz commit historie a dokumentace.*