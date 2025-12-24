import { createClient } from '@supabase/supabase-js';
import { Listing } from '../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export const listingService = {
  
  // Hämta alla aktiva annonser (För startsidan)
  getAllActive: async (): Promise<Listing[]> => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Service Error (getAllActive):', error);
      return [];
    }

    return (data as Listing[]) || [];
  },

  // Hämta en specifik annons
  getById: async (id: string): Promise<Listing | null> => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Service Error (getById):', error);
      return null;
    }

    return data as Listing;
  }
};