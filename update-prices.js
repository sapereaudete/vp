const fs = require('fs');
const fetch = require('node-fetch');

async function updatePrices() {
  const output = {
    letztesUpdate: new Date().toISOString(),
    deutschePost: [],
    hermes: []
  };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json'
  };

  // 1. Deutsche Post abrufen
  try {
    const res = await fetch("https://deutschepost.de", { headers });
    if (res.ok) {
      const data = await res.json();
      output.deutschePost = data
        .filter(p => p.category === "brief_national")
        .map(b => ({ name: b.title, preis: parseFloat(b.price), gewichtMax: b.weightMax || null }));
      console.log("Deutsche Post Daten erfolgreich geladen.");
    }
  } catch (err) {
    console.error("Fehler bei Deutsche Post:", err.message);
  }

  // 2. Hermes abrufen
  try {
    const res = await fetch("https://myhermes.de", { headers });
    if (res.ok) {
      const data = await res.json();
      output.hermes = data.parcelClasses
        .filter(p => p.id !== "xl" && p.id !== "xxl")
        .map(p => ({
          klasse: p.name,
          masseMax: p.dimensions.maxSum,
          gewichtMax: p.dimensions.maxWeight,
          preisShop: parseFloat(p.prices.shop2shop.online),
          preisHaustuer: parseFloat(p.prices.shop2home.online)
        }));
      console.log("Hermes Daten erfolgreich geladen.");
    }
  } catch (err) {
    console.error("Fehler bei Hermes:", err.message);
  }

  // Datei speichern
  fs.writeFileSync('preise.json', JSON.stringify(output, null, 2));
  console.log("preise.json wurde aktualisiert.");
}

updatePrices();
