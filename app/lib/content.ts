// app/lib/content.ts

export const DASHBOARD_TEXTS = {
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
    deleteTitle: "Radera annons" 
  },
  deleteModal: {
    title: "Är du verkligen säker?? 💔",
    // Detta är en liten funktion som gör att vi kan baka in namnet på prylen i texten
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
  }
}