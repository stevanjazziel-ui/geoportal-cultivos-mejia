from __future__ import annotations

import json
import time
from pathlib import Path
from urllib.request import urlopen


BASE_URL = "https://raw.githubusercontent.com/statsbomb/open-data/master/data"
WORLD_CUP_COMPETITION_ID = 43
WORLD_CUP_SEASON_IDS = [3, 51, 54, 55, 106, 269, 270, 272]


def fetch_json(url: str):
    with urlopen(url, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def ensure_json(path: Path, url: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
      return json.loads(path.read_text(encoding="utf-8"))
    payload = fetch_json(url)
    path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    time.sleep(0.05)
    return payload


def main() -> None:
    root = Path("tmp/statsbomb-open-data")
    matches_dir = root / "matches" / str(WORLD_CUP_COMPETITION_ID)
    events_dir = root / "events"

    total_matches = 0
    for season_id in WORLD_CUP_SEASON_IDS:
        match_path = matches_dir / f"{season_id}.json"
        match_url = f"{BASE_URL}/matches/{WORLD_CUP_COMPETITION_ID}/{season_id}.json"
        matches = ensure_json(match_path, match_url)
        total_matches += len(matches)
        for match in matches:
            match_id = match["match_id"]
            event_path = events_dir / f"{match_id}.json"
            event_url = f"{BASE_URL}/events/{match_id}.json"
            ensure_json(event_path, event_url)
    print(f"StatsBomb descargado: {total_matches} partidos del Mundial en {root}")


if __name__ == "__main__":
    main()
