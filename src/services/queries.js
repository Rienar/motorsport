import { useQuery } from '@tanstack/react-query';

const SUPABASE_URL = 'https://qugdovsytjqjawsesdix.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DrPG1dGhbIWU2EARd9v88g_X3c_pPvX';

const fetchSupabase = async (endpoint) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  if (!res.ok) throw new Error(`Network response error: ${res.statusText}`);
  return res.json();
};

export const useRaces = () => {
  return useQuery({
    queryKey: ['races'],
    // Подтягиваем все поля race + связанную серию по foreign key
    queryFn: () => fetchSupabase('races?select=*,series:series_id(id,code,name,short_name)&order=date.asc'),
    staleTime: 10 * 60 * 1000,
  });
};

// Хук для загрузки списка серий из новой таблицы series
export const useSeriesList = () => {
  return useQuery({
    queryKey: ['series_list'],
    queryFn: () => fetchSupabase('series?select=*&order=id.asc'),
    staleTime: 60 * 60 * 1000,
  });
};

export const useCircuits = () => {
  return useQuery({
    queryKey: ['circuits'],
    queryFn: () => fetchSupabase('circuits?select=*'),
    staleTime: 60 * 60 * 1000,
    select: (data) => {
      const map = {};
      data.forEach(c => {
        map[String(c.id)] = c;
        map[c.name] = c;
      });
      return map;
    }
  });
};
