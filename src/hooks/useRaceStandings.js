import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://qugdovsytjqjawsesdix.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DrPG1dGhbIWU2EARd9v88g_X3c_pPvX';

const getSeriesCode = (series) => {
  if (!series) return '';
  if (typeof series === 'object') return (series.code || series.short_name || '').toLowerCase();
  return String(series).toLowerCase();
};

const aggregateResults = (data, keyField) => {
  const map = {};
  data.forEach(item => {
    const key = item[keyField];
    if (!map[key]) {
      map[key] = { ...item, points: 0, delta: 0 };
    }
    map[key].points += Number(item.points || 0);
  });
  return Object.values(map)
    .sort((a, b) => b.points - a.points)
    .map((item, idx) => ({ ...item, position: idx + 1 }));
};

export const useRaceStandings = (selectedRace, races = [], activeYear, isRaceLive) => {
  const [isStandingsExpanded, setIsStandingsExpanded] = useState(false);
  const [standingsTab, setStandingsTab] = useState('drivers');
  const [standingsScope, setStandingsScope] = useState('race');
  
  const [driverStandings, setDriverStandings] = useState([]);
  const [teamStandings, setTeamStandings] = useState([]);
  const [cumulativeDrivers, setCumulativeDrivers] = useState([]);
  const [cumulativeTeams, setCumulativeTeams] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);

  const [showSeasonStandingsModal, setShowSeasonStandingsModal] = useState(false);
  const [seasonStandingsTab, setSeasonStandingsTab] = useState('drivers');
  const [seasonDrivers, setSeasonDrivers] = useState([]);
  const [seasonTeams, setSeasonTeams] = useState([]);
  const [seasonLoading, setSeasonLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    
    const raceSeriesCode = selectedRace ? getSeriesCode(selectedRace.series) : '';
    const raceDate = selectedRace?.parsedDate || (selectedRace?.date ? new Date(selectedRace.date) : null);
    const isLive = typeof isRaceLive === 'function' && selectedRace ? isRaceLive(selectedRace) : false;

    if (selectedRace && (raceDate < new Date() || isLive) && raceSeriesCode === 'f1') {
      setStandingsLoading(true);

      const pastF1RacesUpToCurrent = (races || [])
        .filter(r => {
          const sCode = getSeriesCode(r.series);
          const pDate = r.parsedDate || (r.date ? new Date(r.date) : null);
          return sCode === 'f1' && 
                 pDate && raceDate &&
                 pDate.getFullYear() === raceDate.getFullYear() && 
                 pDate <= raceDate;
        })
        .map(r => r.id);

      const pastIdsQuery = pastF1RacesUpToCurrent.length > 0 
        ? `in.(${pastF1RacesUpToCurrent.join(',')})` 
        : `eq.${selectedRace.id}`;

      Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/driver_results?race_id=eq.${selectedRace.id}&order=position.asc`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/team_results?race_id=eq.${selectedRace.id}&order=position.asc`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/driver_results?race_id=${pastIdsQuery}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/team_results?race_id=${pastIdsQuery}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json())
      ]).then(([dRace, tRace, dCum, tCum]) => {
        if (isCancelled) return;
        setDriverStandings(Array.isArray(dRace) ? dRace : []);
        setTeamStandings(Array.isArray(tRace) ? tRace : []);

        if (Array.isArray(dCum) && Array.isArray(dRace)) {
          const racePointsMap = {};
          dRace.forEach(r => { racePointsMap[r.driver_name] = Number(r.points || 0); });
          setCumulativeDrivers(aggregateResults(dCum, 'driver_name').map(d => ({ ...d, delta: racePointsMap[d.driver_name] || 0 })));
        }

        if (Array.isArray(tCum) && Array.isArray(tRace)) {
          const raceTeamPointsMap = {};
          tRace.forEach(r => { raceTeamPointsMap[r.team_name] = Number(r.points || 0); });
          setCumulativeTeams(aggregateResults(tCum, 'team_name').map(t => ({ ...t, delta: raceTeamPointsMap[t.team_name] || 0 })));
        }
      }).catch(console.error).finally(() => {
        if (!isCancelled) setStandingsLoading(false);
      });
    } else {
      setDriverStandings([]);
      setTeamStandings([]);
      setCumulativeDrivers([]);
      setCumulativeTeams([]);
    }
    
    return () => { isCancelled = true; };
  }, [selectedRace, races, isRaceLive]);

  const fetchGlobalSeasonStandings = async () => {
    setShowSeasonStandingsModal(true);
    setSeasonLoading(true);

    const targetYear = String(activeYear);
    const pastF1SeasonIds = (races || [])
      .filter(r => {
        const sCode = getSeriesCode(r.series);
        const pDate = r.parsedDate || (r.date ? new Date(r.date) : null);
        return sCode === 'f1' && 
               pDate && 
               pDate.getFullYear().toString() === targetYear && 
               pDate < new Date();
      })
      .map(r => r.id);

    if (pastF1SeasonIds.length === 0) {
      setSeasonDrivers([]);
      setSeasonTeams([]);
      setSeasonLoading(false);
      return;
    }

    try {
      const [dRes, tRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/driver_results?race_id=in.(${pastF1SeasonIds.join(',')})`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/team_results?race_id=in.(${pastF1SeasonIds.join(',')})`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }).then(r => r.json())
      ]);
      if (Array.isArray(dRes)) setSeasonDrivers(aggregateResults(dRes, 'driver_name'));
      if (Array.isArray(tRes)) setSeasonTeams(aggregateResults(tRes, 'team_name'));
    } catch (e) {
      console.error(e);
    } finally {
      setSeasonLoading(false);
    }
  };

  return {
    isStandingsExpanded, setIsStandingsExpanded,
    standingsTab, setStandingsTab,
    standingsScope, setStandingsScope,
    driverStandings, teamStandings,
    cumulativeDrivers, cumulativeTeams,
    standingsLoading,
    showSeasonStandingsModal, setShowSeasonStandingsModal,
    seasonStandingsTab, setSeasonStandingsTab,
    seasonDrivers, seasonTeams,
    seasonLoading,
    fetchGlobalSeasonStandings
  };
};
