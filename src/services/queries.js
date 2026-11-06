import { supabase } from './supabase';

export async function getRaces() {
  const { data, error } = await supabase
    .from('races')
    .select(`
      *,
      circuits (*),
      series:series_id (*)
    `)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching races:', error);
    throw error;
  }
  return data || [];
}

export async function getSeries() {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching series:', error);
    throw error;
  }
  return data || [];
}

export async function getDriverResults(raceId) {
  const { data, error } = await supabase
    .from('driver_results')
    .select('*')
    .eq('race_id', raceId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching driver results:', error);
    throw error;
  }
  return data || [];
}

export async function getTeamResults(raceId) {
  const { data, error } = await supabase
    .from('team_results')
    .select('*')
    .eq('race_id', raceId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching team results:', error);
    throw error;
  }
  return data || [];
}
