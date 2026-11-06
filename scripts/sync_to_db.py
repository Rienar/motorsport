import csv
import os
import re
import sys
from datetime import datetime
from supabase import Client, create_client

# Считываем переменные окружения
SUPABASE_URL = (
    os.environ.get("SUPABASE_URL") or "https://qugdovsytjqjawsesdix.supabase.co"
)
SUPABASE_KEY = (
    os.environ.get("SUPABASE_KEY")
    or "sb_publishable_DrPG1dGhbIWU2EARd9v88g_X3c_pPvX"
)

SUPABASE_URL = SUPABASE_URL.strip() if SUPABASE_URL else ""
SUPABASE_KEY = SUPABASE_KEY.strip() if SUPABASE_KEY else ""

if not SUPABASE_URL or not SUPABASE_KEY:
  print(
      "Ошибка: Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_KEY"
  )
  sys.exit(1)

# Инициализируем клиент Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def extract_year(date_str: str) -> int | None:
  """Извлекает 4-значный год из строки даты любого распространенного формата."""
  if not date_str:
    return None

  date_str = date_str.strip()

  # 1. Попытка взять первые 4 цифры (для 'YYYY-MM-DD' или 'YYYY-MM-DDTHH:MM:SS')
  match = re.match(r"^(\d{4})", date_str)
  if match:
    return int(match.group(1))

  # 2. Попытка найти 4 цифры года в конце строки (для 'DD.MM.YYYY' или 'DD/MM/YYYY')
  match = re.search(r"(\d{4})$", date_str)
  if match:
    return int(match.group(1))

  # 3. Попытка стандартного ISO парсинга
  try:
    return datetime.fromisoformat(date_str).year
  except (ValueError, TypeError):
    return None


def sync_csv_to_db(csv_file: str = "data/f1_calendar.csv"):
  if not os.path.exists(csv_file):
    print(f"Ошибка: Файл {csv_file} не найден.")
    sys.exit(1)

  rows = []
  with open(csv_file, mode="r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row_idx, row in enumerate(reader, start=2):
      date_raw = row.get("date", "").strip() if row.get("date") else ""
      season = extract_year(date_raw)

      if not season:
        print(
            f"Предупреждение: Строка {row_idx} ({row.get('name')}) пропущена —"
            f" не удалось определить год/сезон из даты '{date_raw}'."
        )
        continue

      # Обрабатываем int8 поле circuit_id: пустую строку переводим в None (NULL в Postgres)
      circuit_id_raw = row.get("circuit_id")
      circuit_id = (
          int(circuit_id_raw)
          if circuit_id_raw and circuit_id_raw.strip()
          else None
      )

      rows.append({
          "series_id": 1,  # ID серии Formula 1
          "season": season,  # Динамический год (2026, 2027, 2028 и т.д.)
          "name": row.get("name"),
          "date": date_raw,
          "circuit": row.get("circuit"),
          "country": row.get("country"),
          "time": row.get("time"),
          "circuit_id": circuit_id,
      })

  if not rows:
    print("Нет валидных записей для синхронизации.")
    return

  # Группировка для вывода статистики по сезонам
  seasons_found = sorted(list({r["season"] for r in rows}))
  print(
      f"Подготовлено {len(rows)} записей для синхронизации (сезоны:"
      f" {seasons_found})..."
  )

  # Upsert по составному ограничению (series_id, season, name)
  try:
    res = (
        supabase.table("races")
        .upsert(rows, on_conflict="series_id,season,name")
        .execute()
    )
    print(
        f"Успешно синхронизировано {len(res.data)} этапов в таблицу races!"
    )
  except Exception as e:
    print(f"Ошибка при выполнении upsert в базу: {e}")
    sys.exit(1)


if __name__ == "__main__":
  sync_csv_to_db()
