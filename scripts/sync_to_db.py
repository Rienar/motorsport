import csv
import os
from supabase import Client, create_client

SUPABASE_URL = os.environ.get("https://qugdovsytjqjawsesdix.supabase.co")
SUPABASE_KEY = os.environ.get("sb_publishable_DrPG1dGhbIWU2EARd9v88g_X3c_pPvX")

if not SUPABASE_URL or not SUPABASE_KEY:
  raise ValueError(
      "Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_KEY"
  )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def sync_csv_to_db():
  csv_file = "data/f1_calendar.csv"

  if not os.path.exists(csv_file):
    raise FileNotFoundError(
        f"Файл {csv_file} не найден. Убедитесь, что предварительно сформировали"
        " CSV."
    )

  rows = []
  with open(csv_file, mode="r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
      # Пустые строки в числовых полях заменяем на None (в БД запишется NULL)
      circuit_id_val = row.get("circuit_id")
      circuit_id = (
          int(circuit_id_val)
          if circuit_id_val and circuit_id_val.strip()
          else None
      )

      rows.append({
          "series": row.get("series") or "F1",
          "name": row.get("name"),
          "date": row.get("date"),
          "circuit": row.get("circuit"),
          "country": row.get("country"),
          "time": row.get("time"),
          "circuit_id": circuit_id,
      })

  if not rows:
    print("CSV-файл пуст, синхронизация пропущена.")
    return

  # 1. Очищаем тестовую таблицу races_test перед заливкой
  supabase.table("races_test").delete().neq("id", 0).execute()

  # 2. Вставляем строки из CSV
  res = supabase.table("races_test").insert(rows).execute()
  print(
      f"Успешно импортировано {len(res.data)} строк из {csv_file} в races_test."
  )


if __name__ == "__main__":
  sync_csv_to_db()
