# 🏗️ Univerzální systém pro FVE nabídky

Pokročilý, škálovatelný systém pro vytváření a správu nabídek fotovoltaických elektráren s automatizovaným workflow.

## 🎯 Klíčové vlastnosti

✅ **Univerzální architektura** - jeden systém pro nekonečně mnoho projektů  
✅ **Centrální databáze komponentů** - snadná správa cen a specifikací  
✅ **Automatická synchronizace** - GitHub Actions automaticky aktualizují nabídky  
✅ **Inteligentní kalkulator** - dynamické generování rozhraní podle konfigurace  
✅ **Verzování** - každý projekt má vlastní historii změn  
✅ **Rychlé nasazení** - nový projekt za 5 minut  

## 📁 Struktura projektu

```
📦 nabidka-asv-solnice/
├── 🗄️  database/
│   └── components.json          # Centrální databáze všech komponentů
├── 🎨 templates/
│   ├── calculator.html          # Univerzální šablona kalkulátoru
│   └── quote-template.html      # Šablona pro nabídky
├── 💼 projects/
│   └── asv-solnice/            # Konkrétní projekt
│       ├── config.json         # Konfigurace projektu
│       ├── prices.json         # Aktuální ceny (generováno)
│       ├── calculator.html     # Kalkulator pro tento projekt
│       └── index.html          # Veřejná nabídka
├── 🎨 styles/
│   └── calculator.css          # Styly pro kalkulátory
├── ⚙️ js/
│   └── calculator-engine.js    # JavaScript engine
├── 🛠️ tools/
│   └── project-generator.js    # Generátor nových projektů
└── 🤖 .github/
    ├── workflows/
    │   └── update-projects.yml  # GitHub Actions pro automatizaci
    └── scripts/
        └── update-project-prices.js  # Skript pro aktualizace
```

## 🚀 Rychlý start

### 1. Vytvoření nového projektu

```bash
# Spuštění generátoru nového projektu
node tools/project-generator.js
```

Generátor vás provede procesem:
- ✏️ Zadání základních údajů o projektu
- 🏢 Informace o objednateli  
- ⚡ Technické parametry FVE
- 🧩 Výběr komponentů z databáze

### 2. Práce s kalkulátorem

1. Otevřete `projects/váš-projekt/calculator.html` v prohlížeči
2. Nastavte množství a ceny komponentů
3. Systém automaticky přepočítává marže a celkové ceny
4. Klikněte na **"Export do nabídky"** pro vygenerování JSON

### 3. Aktivace automatizace

1. Zkopírujte vygenerovaný JSON
2. Vložte jej do `projects/váš-projekt/prices.json`
3. Commitněte změny do Git
4. GitHub Actions automaticky vytvoří/aktualizuje veřejnou nabídku

## 🧩 Databáze komponentů

Centrální databáze obsahuje všechny dostupné komponenty:

```json
{
  "categories": {
    "solaredge": {
      "name": "SolarEdge komponenty",
      "icon": "🔌"
    }
  },
  "components": {
    "se50k": {
      "name": "SE50K MC4 střídač",
      "category": "solaredge", 
      "basePrice": 60934,
      "unit": "ks",
      "defaultMargin": 10,
      "specifications": {
        "power": "50kW",
        "efficiency": "98.8%"
      }
    }
  }
}
```

### Přidání nového komponentu

1. Editujte `database/components.json`
2. Přidejte nový komponent s jedinečným ID
3. Komponent se automaticky objeví ve všech nových projektech

## ⚙️ Konfigurace projektu

Každý projekt má vlastní `config.json`:

```json
{
  "meta": {
    "projectId": "muj-projekt",
    "name": "Můj FVE projekt"
  },
  "client": {
    "name": "Objednatel s.r.o.",
    "address": "Adresa 123"
  },
  "budget": {
    "items": [
      {
        "componentId": "se50k",
        "quantity": 1,
        "customPrice": null,
        "customMargin": null
      }
    ]
  }
}
```

## 🤖 Automatizace

### GitHub Actions workflow

Systém automaticky detekuje změny v `projects/*/prices.json` a:

1. 🔍 **Detekuje** které projekty se změnily
2. 📊 **Načte** nová data z prices.json  
3. 🔄 **Aktualizuje** HTML nabídky
4. 💾 **Commitne** změny zpět do repozitáře

### Manuální spuštění

```bash
# Aktualizace konkrétního projektu
node .github/scripts/update-project-prices.js asv-solnice

# Generování nového projektu
node tools/project-generator.js
```

## 🎨 Přizpůsobení

### Styly

Upravte `styles/calculator.css` pro změnu vzhledu kalkulátorů.

### Šablony

- `templates/calculator.html` - struktura kalkulátoru
- `templates/quote-template.html` - šablona nabídek

### JavaScript engine

`js/calculator-engine.js` obsahuje logiku kalkulátoru:
- Dynamické generování rozhraní
- Výpočty cen a marží
- Export do JSON formátu
- Auto-save funkcionalita

## 🔧 Pokročilé funkce

### Vlastní komponenty pro projekt

```json
{
  "componentId": "se50k",
  "quantity": 1,
  "customName": "Speciální střídač SE50K",
  "customPrice": 65000,
  "customMargin": 15
}
```

### Podmíněné zobrazení komponentů

```json
{
  "componentId": "rdc",
  "quantity": 0,
  "note": "Položka zrušena dle požadavku zákazníka"
}
```

### Skupinové kalkulace

Komponenty se automaticky seskupují podle kategorie z databáze.

## 📈 Výhody nového systému

| **Dříve** | **Nyní** |
|-----------|----------|
| 🔒 Jeden projekt = jeden hardcoded systém | 🚀 Jeden systém = nekonečně projektů |
| ⚠️ Změna komponenty = editace kódu | ✅ Změna komponenty = editace JSON |
| 📝 Ruční kopírování cen | 🤖 Automatická synchronizace |
| 🐌 Nový projekt = hodiny práce | ⚡ Nový projekt = 5 minut |
| 🔄 Duplicitní kód pro každý projekt | 📦 Sdílené komponenty a šablony |

## 🎯 Příklady použití

### Rychlé vytvoření nabídky

1. `node tools/project-generator.js`
2. Zadání: "rodinny-dum", "Rodinný dům Novák"
3. Otevření kalkulátoru → nastavení parametrů → export
4. Automatické vytvoření veřejné nabídky

### Aktualizace cen komponentů

1. Editace `database/components.json`
2. Všechny projekty automaticky použijí nové ceny

### Hromadná aktualizace

GitHub Actions automaticky aktualizuje všechny změněné projekty najednou.

## 🚨 Migrace ze starého systému

Stávající projekt ASV Solnice byl úspěšně migrován:
- ✅ Zachována funkčnost
- ✅ Konvertována data do nové struktury  
- ✅ Zachována kompatibilita s GitHub Actions

## 🎉 Výsledek

**Univerzální, škálovatelný systém pro profesionální správu FVE nabídek s plnou automatizací a neomezeným množstvím projektů.**

---

*Systém vytvořen s důrazem na efektivitu, škálovatelnost a snadnost použití. Pro dotazy kontaktujte autora.*