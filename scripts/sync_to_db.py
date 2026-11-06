import csv
import os
import sys
from supabase import Client, create_client

# Считываем переменные окружения
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
  print(
      "Ошибка: Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_KEY"
  )
  sys.exit(1)

# Инициализируем клиент Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def sync_csv_to_db():
  csv_file = "data/f1_calendar.csv"

  if not os.path.exists(csv_file):
    print(f"Ошибка: Файл {csv_file} не найден.")
    sys.exit(1)

  rows = []
  with open(csv_file, mode="r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
      # Обрабатываем int8 поле circuit_id: пустую строку переводим в None (NULL в Postgres)
      circuit_id_raw = row.get("circuit_id")
      circuit_id = (
          int(circuit_id_raw)
          if circuit_id_raw and circuit_id_raw.strip()
          else None
      )

      # Формируем строку под обновленную схему с внешним ключом series_id
      rows.append({
          "series_id": 1,  # ID серии Formula 1 в таблице series
          "name": row.get("name"),
          "date": row.get("date"),
          "circuit": row.get("circuit"),
          "country": row.get("country"),
          "time": row.get("time"),
          "circuit_id": circuit_id,
      })

  if not rows:
    print("CSV-файл пуст, синхронизация не требуется.")
    return

  print(f"Подготовлено {len(rows)} записей для синхронизации...")

  # Upsert: вставляет новые этапы и обновляет существующие, если совпадает пара (series_id, name)
  try:
    res = (
        supabase.table("races_test")
        .upsert(rows, on_conflict="series_id,name")
        .execute()
    )
    print(f"Успешно синхронизировано {len(res.data)} этапов в races_test!")
  except Exception as e:
    print(f"Ошибка при выполнении upsert в базу: {e}")
    sys.exit(1)


if __name__ == "__main__":
  sync
