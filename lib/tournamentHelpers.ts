import { supabase } from "./supabase";

export interface TournamentSettings {
  id: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
}

/**
 * Helper function to safely fetch tournament settings
 * This handles the fallback and error cases properly
 */
export async function getTournamentSettings(): Promise<TournamentSettings> {
  try {
    // Try to fetch all settings
    const { data, error } = await supabase
      .from('tournament_settings')
      .select('*')
      .limit(1);
    
    if (error || !data || data.length === 0) {
      console.warn('No tournament settings found, using defaults');
      return createDefaultSettings();
    }
    
    return data[0] as TournamentSettings;
  } catch (error) {
    console.error('Error fetching tournament settings:', error);
    return createDefaultSettings();
  }
}

/**
 * Helper function to create a default tournament settings object
 * with a properly formatted UUID
 */
export function createDefaultSettings(): TournamentSettings {
  // Generate a proper UUID
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  
  return {
    id: uuid,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    status: 'upcoming'
  };
}

/**
 * Create tournament settings in the database if they don't exist yet
 */
export async function ensureTournamentSettings(): Promise<void> {
  try {
    // Check if any settings exist
    const { data, error } = await supabase
      .from('tournament_settings')
      .select('id')
      .limit(1);
    
    if (error || !data || data.length === 0) {
      // No settings exist, create default ones
      const defaultSettings = createDefaultSettings();
      
      const { error: insertError } = await supabase
        .from('tournament_settings')
        .insert([defaultSettings]);
      
      if (insertError) {
        console.error('Failed to create default tournament settings:', insertError);
      } else {
        console.log('Created default tournament settings');
      }
    }
  } catch (error) {
    console.error('Error ensuring tournament settings:', error);
  }
} 