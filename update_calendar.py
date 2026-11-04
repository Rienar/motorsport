import os
import csv
import requests
from datetime import datetime

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
CSV_FILENAME = "races_data.csv"

def fetch_f1_from_api():
    """Динамически забирает актуальный календарь F1 из открытого API"""
    try:
        url = "https://api.jolpi.ca/ergast/f1/2027.json"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            races_raw = data['MRData']['RaceTable']['Races']
            formatted = []
            for r in races_raw:
                time_str = r.get('time', '14:00:00Z').replace('Z', '')
                formatted.append({
                    "series": "f1",
                    "name": r['raceName'],
                    "date": f"{r['date']}T{time_str}Z",
                    "circuit": r['Circuit']['circuitName'],
                    "country": r['Circuit']['Location']['country'],
                    "time": time_str[:5]
                })
            return formatted
    except Exception as e:
        print(f"Ошибка получения F1 API: {e}")
    return []

def fetch_wec_from_source():
    """Здесь будет парсер или запрос к API WEC"""
    # Пример структуры, получаемой «на лету» из внешнего источника
    return [
        {
            "series": "wec",
            "name": "Qatar 1812km",
            "date": "2027-03-27T08:00:00Z",
            "circuit": "Лусаил",
            "country": "Катар",
            "time": "11:00"
        }
    ]

def aggregate_all_series():
    """Собирает данные со всех независимых источников"""
    all_races = []
    
    print("Сбор данных Formula 1...")
    all_races.extend(fetch_f1_from_api())
    
    print("Сбор данных WEC...")
    all_races.extend(fetch_wec_from_source())
    
    return all_races

def save_to_csv(races):
    if not races:
        print("Нет данных для сохранения в CSV.")
        return
    fieldnames = ["series", "name", "date", "circuit", "country", "time"]
    with open(CSV_FILENAME, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for race in races:
            writer.writerow(race)
    print(f"Файл {CSV_FILENAME} успешно обновлен.")

def sync_to_supabase(races):
    if not SUPABASE_URL or not SUPABASE_KEY or not races:
        return
    url = f"{SUPABASE_URL}/rest/v1/races"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-upsert"
    }
    response = requests.post(url, headers=headers, json=races)
    if response.status_code in [200, 201]:
        print("База данных Supabase синхронизирована!")
    else:
        print(f"Ошибка отправки в БД: {response.text}")

if __name__ == "__main__":
    print("Запуск агента сбора расписания автоспорта...")
    races_data = aggregate_all_series()
    save_to_csv(races_data)
    sync_to_supabase(races_data)
