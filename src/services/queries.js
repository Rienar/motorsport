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
    // 1. Сначала получаем все гонки серии F1
    const { data: races, error: racesError } = await supabase
      .from('races')
      .select('id, date, season, series:series_id(code)');

    if (racesError) throw racesError;

    // 2. Фильтруем гонки только для F1 и нужного года
    const targetYear = String(year);
    const f1RaceIds = (races || [])
      .filter(r => {
        const seriesCode = r.series?.code?.toLowerCase();
        const raceYear = r.season ? String(r.season) : (r.date ? r.date.substring(0, 4) : null);
        return seriesCode === 'f1' && raceYear === targetYear;
      })
      .map(r => r.id);

    // Если гонок в этом году нет, возвращаем пустые массивы
    if (f1RaceIds.length === 0) {
      return { drivers: [], teams: [] };
    }

    // 3. Используем вашу существующую функцию для получения результатов этих гонок
    const { drivers, teams } = await getSeasonResults(f1RaceIds);

    // 4. Подсчитываем общие очки для Пилотов
    const driverMap = {};
    drivers.forEach(d => {
      // Адаптируйте ключи (driver_name / team_name) под названия колонок в вашей таблице driver_results
      const name = d.driver_name || d.driver || d.name || `Пилот #${d.driver_id}`;
      const team = d.team_name || d.team || d.constructor_name || `Команда #${d.team_id}`;
      
      if (!driverMap[name]) {
        driverMap[name] = { id: d.driver_id || name, name, team_name: team, points: 0 };
      }
      driverMap[name].points += (Number(d.points) || 0);
    });

    // 5. Подсчитываем общие очки для Команд
    const teamMap = {};
    teams.forEach(t => {
      // Адаптируйте ключи (team_name) под названия колонок в вашей таблице team_results
      const name = t.team_name || t.team || t.name || `Команда #${t.team_id}`;
      
      if (!teamMap[name]) {
        teamMap[name] = { id: t.team_id || name, name, points: 0 };
      }
      teamMap[name].points += (Number(t.points) || 0);
    });

    // 6. Сортируем массивы по убыванию очков и возвращаем
    return {
      drivers: Object.values(driverMap).sort((a, b) => b.points - a.points),
      teams: Object.values(teamMap).sort((a, b) => b.points - a.points)
    };

  } catch (error) {
    console.error('Ошибка при формировании зачета F1:', error);
    return { drivers: [], teams: [] };
  }
}
