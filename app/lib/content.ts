// SOURCE OF TRUTH
// Denna fil innehåller all text för hela applikationen.
// Ändra här för att uppdatera text på alla sidor samtidigt.

export const DASHBOARD_TEXTS = {
  // --- GEMENSAMT / NAVIGATION ---
  navigation: {
    brand: "🛒 Min Marknadsplats",
    myPage: "Min sida",
    sellBtn: "Sälj något"
  },

  // --- DASHBOARD (Min sida) ---
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
    // Funktion för att baka in titeln dynamiskt
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

  // --- STARTSIDAN (Home) ---
  landing: {
    hero: {
      title: "Hitta fynd eller sälj det du inte behöver",
      subtitle: "Sveriges tryggaste marknadsplats för allt från elektronik till gamla möbler.", // Lite vassare text
      cta: "Lägg in en annons gratis"
    },
    search: {
      placeholder: "Vad letar du efter idag? (t.ex. Cykel)",
      filterTitle: "Kategorier:",
      categories: ["Alla", "Fordon", "Elektronik", "Kläder", "Möbler", "Övrigt"]
    },
    listings: {
      header: "Senaste annonserna",
      empty: "Inga annonser hittades som matchar din sökning. 🕵️‍♂️",
      locationPrefix: "📍",
      readMore: "Läs mer"
    },
    // NY FOOTER-STRUKTUR
    footer: {
      brand: "Min Marknadsplats",
      copyright: "© 2025 Min Marknadsplats. Alla rättigheter reserverade.",
      columns: [
        {
          title: "Marknadsplatsen",
          links: ["Om oss", "Så funkar det", "Hållbarhet", "Press"]
        },
        {
          title: "Kundservice",
          links: ["Kontakta oss", "Vanliga frågor", "Trygg affär", "Cookies"]
        },
        {
          title: "Följ oss",
          links: ["Instagram", "Facebook", "LinkedIn", "TikTok"]
        }
      ]
    }
  },

  // --- DETALJSIDAN (Annons-sidan) ---
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
  },

  // --- SKAPA ANNONS (Create) ---
  create: {
    header: "Skapa ny annons",
    backLink: "← Tillbaka till dashboard",
    form: {
      title: { label: "Rubrik", placeholder: "T.ex. Röd racercykel" },
      category: { label: "Kategori", options: ["Fordon", "Elektronik", "Kläder", "Möbler", "Övrigt"] },
      price: { label: "Pris (kr)", placeholder: "0" },
      location: { label: "Plats", placeholder: "T.ex. Stockholm, Södermalm" },
      description: { label: "Beskrivning", placeholder: "Berätta om skicket, ålder och annat viktigt..." },
      image: { 
        label: "Bilder", 
        uploadBtn: "Välj bilder", 
        uploading: "Laddar upp...",
        errorTooMany: "Du kan max ladda upp 5 bilder. Ta bort en för att lägga till en ny.",
        errorTooBig: "Bilden är för stor! Max 2MB tillåts."
      }
    },
    submit: {
      btn: "Publicera annons",
      loading: "Skapar..."
    },
    success: "Annonsen publicerad! Skickar dig tillbaka..."
  }, // <--- HÄR VAR DET SOM SAKNADES (KOMMAT)

  // --- REDIGERA ANNONS (Edit) ---
  edit: {
    header: "Redigera annons",
    backLink: "← Avbryt",
    loadingData: "Hämtar annonsuppgifter...",
    submit: {
      btn: "Spara ändringar",
      loading: "Sparar..."
    },
    success: "Ändringarna sparade! Går tillbaka..."
  }
}