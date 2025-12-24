// Här definierar vi hur datan ser ut i vår chatt

export interface Conversation {
  id: string;
  created_at: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  // Vi kommer hämta info om annonsen samtidigt (Join)
  listing?: {
    title: string;
    images: string[];
  };
}

export interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
}