import csv
import os
import requests


def fetch_and_export_calendar():
  url = "http://api.jolpi.ca/ergast/f1/current.json"
  response = requests.get(url, timeout=10)
  response.raise_for_status()

  races = response.json()["MRData"]["RaceTable"]["Races"]

  rows = []
  for race in races:
    race_date = race.get("date")
    race_time = race.get("time", "00:00:00Z")

    # Формируем дату и время для timestamptz (ISO 8601)
    full_datetime = (
        f"{race_date}T{race_time}" if race_time else f"{race_date}T00:00:00Z"
    )

    rows.append({
        "series": "F1",
        "name": race.get("raceName"),
        "date": full_datetime,
        "circuit": race.get("Circuit", {}).get("circuitName"),
        "country": race.get("Circuit", {}).get("Location", {}).get("country"),
        "time": race_time,
        "circuit_id": "",  # Оставляем пустым (Postgres запишет NULL)
    })

  os.makedirs("data", exist_ok=True)
  csv_file = "data/f1_calendar.csv"

  fieldnames = [
      "series",
      "name",
      "date",
      "circuit",
      "country",
      "time",
      "circuit_id",
  ]

  with open(csv_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

  print(f"Готово! Сохранено этапов: {len(rows)} в {csv_file}")


if __name__ == "__main__":
  fetch_and_export_calendar()
