// app/lib/content.ts

export const DASHBOARD_TEXTS = {
  // --- GEMENSAMT / NAVIGATION ---
  navigation: {
    brand: "🛒 Min Marknadsplats",
    myPage: "Min sida",
    sellBtn: "Sälj något"
  },

  // --- DASHBOARD (Det du redan har) ---
  header: {
    title: "Min Sida",
    welcome: "Inloggad som:",
    logout: "Logga ut"
  },
  ctaCard: {
    title: "Har du något nytt på gång?",
    subtitle: "Lägg upp en ny annons direkt.",
    button: "+ Sälj något"
  },
  tabs: {
    active: "Mina Annonser",
    history: "Mina sålda prylar 💰"
  },
  emptyStates: {
    active: "Här ekar det tomt. Dags att rensa garaget?",
    history: "Du har inte sålt något via oss än. Men vi tror på dig! 🚀"
  },
  listing: {
    soldLabel: "Såld via oss ⭐",
    activeLabel: "Aktiv",
    noImage: "Ingen bild",
    deleteTitle: "Radera annons",
    historyHeaders: {
      datePublished: "Publicerad",
      title: "Rubrik",
      price: "Pris",
      dateSold: "Såld datum"
    }
  },
  deleteModal: {
    title: "Är du verkligen säker?? 💔",
    description: (itemTitle: string) => `Du är på väg att ta bort **${itemTitle}**. Sista chansen att ångra sig! 💨`,
    question: "Bara av nyfikenhet, varför vill du ta bort annonsen?",
    options: {
      soldHere: "Såld här (Ni är bäst! ⭐)",
      soldElsewhere: "Såld någon annanstans (Jag var otrogen...)",
      justDelete: "Vill bara ta bort den (Inga frågor, tack)"
    },
    buttons: {
      cancel: "Jag ångrar mig!",
      confirm: "Sopar...",
      deleteNow: "Radera nu"
    }
  },

  // --- STARTSIDAN (NYTT) ---
  landing: {
    hero: {
      title: "Hitta fynd eller sälj det du inte behöver",
      subtitle: "En enkel och smidig marknadsplats för allt från elektronik till gamla möbler.",
      cta: "Lägg in en annons gratis"
    },
    search: {
      placeholder: "Vad letar du efter idag? (t.ex. Cykel)",
      filterTitle: "Kategorier:",
      // Dessa måste matcha vad vi sparar i databasen exakt
      categories: ["Alla", "Fordon", "Elektronik", "Kläder", "Möbler", "Övrigt"]
    },
    listings: {
      header: "Senaste annonserna",
      empty: "Inga annonser hittades som matchar din sökning. 🕵️‍♂️",
      locationPrefix: "📍",
      readMore: "Läs mer"
    },
    footer: "© 2025 Min Marknadsplats. Byggt med Next.js & Supabase."
  }
  // app/lib/content.ts

export const DASHBOARD_TEXTS = {
  // ... (behåll allt annat ovanför precis som det är) ...

  // --- DETALJSIDAN (NYTT) ---
  details: {
    backToHome: "← Tillbaka till alla annonser",
    loading: "Laddar annons...",
    notFound: {
      title: "Annonsen hittades inte",
      link: "Gå till startsidan"
    },
    sections: {
      description: "Beskrivning",
      location: "Plats:",
      category: "Kategori:"
    },
    contact: {
      button: "Kontakta säljaren",
      alert: "Chatt-funktion kommer i nästa uppdatering! Just nu får du låtsas mejla säljaren."
    },
    noImage: "Ingen bild tillgänglig"
  }
}
}