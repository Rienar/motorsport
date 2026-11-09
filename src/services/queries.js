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

export async function getSeasonResults(raceIds) {
  if (!raceIds || raceIds.length === 0) return { drivers: [], teams: [] };
  const [drivers, teams] = await Promise.all([
    supabase.from('driver_results').select('*').in('race_id', raceIds),
    supabase.from('team_results').select('*').in('race_id', raceIds)
  ]);
  return { drivers: drivers.data || [], teams: teams.data || [] };
}

export async function getF1Standings(year) {
  try {
    const targetYear = String(year);

    const { data: races, error: racesError } = await supabase
      .from('races')
      .select('id, date, season, series_id')
      .eq('series_id', 1);

    if (racesError) throw racesError;

    const f1RaceIds = (races || [])
      .filter(r => {
        const rYear = r.season ? String(r.season) : (r.date ? String(r.date).substring(0, 4) : null);
        return rYear === targetYear;
      })
      .map(r => r.id);

    if (f1RaceIds.length === 0) {
      return { drivers: [], teams: [] };
    }

    const { drivers: rawDrivers, teams: rawTeams } = await getSeasonResults(f1RaceIds);

    const driverMap = {};
    (rawDrivers || []).forEach(d => {
      const name = d.driver_name;
      if (!name) return;
      if (!driverMap[name]) {
        driverMap[name] = {
          name: d.driver_name,
          team_name: d.team_name,
          points: 0
        };
      }
      driverMap[name].points += (Number(d.points) || 0);
    });

    const teamMap = {};
    (rawTeams || []).forEach(t => {
      const name = t.team_name;
      if (!name) return;
      if (!teamMap[name]) {
        teamMap[name] = {
          name: t.team_name,
          team_name: t.team_name,
          points: 0
        };
      }
      teamMap[name].points += (Number(t.points) || 0);
    });

    return {
      drivers: Object.values(driverMap).sort((a, b) => b.points - a.points),
      teams: Object.values(teamMap).sort((a, b) => b.points - a.points)
    };
  } catch (error) {
    console.error('Ошибка getF1Standings:', error);
    return { drivers: [], teams: [] };
  }
}
