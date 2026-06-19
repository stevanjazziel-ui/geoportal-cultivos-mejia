from __future__ import annotations

import json
import math
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


OUTPUT_DIR = Path("public-data/world-cup-predictor")
OUTPUT_BUNDLE_PATH = OUTPUT_DIR / "live_group_stage_bundle.json"
OUTPUT_REPORT_PATH = OUTPUT_DIR / "live_group_stage_report.md"
OUTPUT_DEMO_PATH = OUTPUT_DIR / "demo_bundle.json"
STATSBOMB_ROOT = Path("tmp/statsbomb-open-data")
SIMULATION_SEED = 20260619
SIMULATIONS = 12000
GROUP_TABLE_SIMULATIONS = 12000
RIDGE_ALPHA = 1.5


@dataclass(frozen=True)
class TeamInfo:
    group: str
    rank: int
    host: bool = False


TEAMS: dict[str, TeamInfo] = {
    "Mexico": TeamInfo("A", 14, True),
    "South Africa": TeamInfo("A", 60),
    "South Korea": TeamInfo("A", 25),
    "Czechia": TeamInfo("A", 40),
    "Canada": TeamInfo("B", 30, True),
    "Bosnia and Herzegovina": TeamInfo("B", 64),
    "Qatar": TeamInfo("B", 56),
    "Switzerland": TeamInfo("B", 19),
    "Brazil": TeamInfo("C", 6),
    "Morocco": TeamInfo("C", 7),
    "Haiti": TeamInfo("C", 83),
    "Scotland": TeamInfo("C", 42),
    "United States": TeamInfo("D", 17, True),
    "Paraguay": TeamInfo("D", 41),
    "Australia": TeamInfo("D", 27),
    "Turkiye": TeamInfo("D", 22),
    "Germany": TeamInfo("E", 10),
    "Curacao": TeamInfo("E", 82),
    "Ivory Coast": TeamInfo("E", 33),
    "Ecuador": TeamInfo("E", 23),
    "Netherlands": TeamInfo("F", 8),
    "Japan": TeamInfo("F", 18),
    "Sweden": TeamInfo("F", 38),
    "Tunisia": TeamInfo("F", 45),
    "Belgium": TeamInfo("G", 9),
    "Egypt": TeamInfo("G", 29),
    "Iran": TeamInfo("G", 20),
    "New Zealand": TeamInfo("G", 85),
    "Spain": TeamInfo("H", 2),
    "Cape Verde": TeamInfo("H", 67),
    "Saudi Arabia": TeamInfo("H", 61),
    "Uruguay": TeamInfo("H", 16),
    "France": TeamInfo("I", 3),
    "Senegal": TeamInfo("I", 15),
    "Iraq": TeamInfo("I", 57),
    "Norway": TeamInfo("I", 31),
    "Argentina": TeamInfo("J", 1),
    "Algeria": TeamInfo("J", 28),
    "Austria": TeamInfo("J", 24),
    "Jordan": TeamInfo("J", 63),
    "Portugal": TeamInfo("K", 5),
    "DR Congo": TeamInfo("K", 46),
    "Uzbekistan": TeamInfo("K", 50),
    "Colombia": TeamInfo("K", 13),
    "England": TeamInfo("L", 4),
    "Croatia": TeamInfo("L", 11),
    "Ghana": TeamInfo("L", 73),
    "Panama": TeamInfo("L", 34),
}

GROUP_TEAMS: dict[str, list[str]] = {}
for team_name, team_info in TEAMS.items():
    GROUP_TEAMS.setdefault(team_info.group, []).append(team_name)
for group_name in GROUP_TEAMS:
    GROUP_TEAMS[group_name].sort(key=lambda item: (TEAMS[item].rank, item))


PLAYED_MATCHES = [
    ("2026-06-11", "A01", "A", "Mexico", "South Africa", 2, 0),
    ("2026-06-11", "A02", "A", "South Korea", "Czechia", 2, 1),
    ("2026-06-12", "B01", "B", "Canada", "Bosnia and Herzegovina", 1, 1),
    ("2026-06-12", "D01", "D", "United States", "Paraguay", 4, 1),
    ("2026-06-13", "B02", "B", "Switzerland", "Qatar", 1, 1),
    ("2026-06-13", "C01", "C", "Brazil", "Morocco", 1, 1),
    ("2026-06-13", "C02", "C", "Scotland", "Haiti", 1, 0),
    ("2026-06-14", "D02", "D", "Australia", "Turkiye", 2, 0),
    ("2026-06-14", "E01", "E", "Germany", "Curacao", 7, 1),
    ("2026-06-14", "F01", "F", "Netherlands", "Japan", 2, 2),
    ("2026-06-14", "E02", "E", "Ivory Coast", "Ecuador", 1, 0),
    ("2026-06-14", "F02", "F", "Sweden", "Tunisia", 5, 1),
    ("2026-06-15", "H01", "H", "Spain", "Cape Verde", 0, 0),
    ("2026-06-15", "G01", "G", "Belgium", "Egypt", 1, 1),
    ("2026-06-15", "H02", "H", "Saudi Arabia", "Uruguay", 1, 1),
    ("2026-06-15", "G02", "G", "Iran", "New Zealand", 2, 2),
    ("2026-06-16", "I01", "I", "France", "Senegal", 3, 1),
    ("2026-06-16", "I02", "I", "Norway", "Iraq", 4, 1),
    ("2026-06-16", "J01", "J", "Argentina", "Algeria", 3, 0),
    ("2026-06-17", "J02", "J", "Austria", "Jordan", 3, 1),
    ("2026-06-17", "K01", "K", "Portugal", "DR Congo", 1, 1),
    ("2026-06-17", "L01", "L", "England", "Croatia", 4, 2),
    ("2026-06-17", "L02", "L", "Ghana", "Panama", 1, 0),
    ("2026-06-17", "K02", "K", "Colombia", "Uzbekistan", 3, 1),
    ("2026-06-18", "A03", "A", "Czechia", "South Africa", 1, 1),
    ("2026-06-18", "B03", "B", "Switzerland", "Bosnia and Herzegovina", 4, 1),
    ("2026-06-18", "B04", "B", "Canada", "Qatar", 6, 0),
    ("2026-06-18", "A04", "A", "Mexico", "South Korea", 1, 0),
]


FUTURE_FIXTURES = [
    ("2026-06-19", "D03", "D", "United States", "Australia"),
    ("2026-06-19", "C03", "C", "Scotland", "Morocco"),
    ("2026-06-19", "C04", "C", "Brazil", "Haiti"),
    ("2026-06-19", "D04", "D", "Turkiye", "Paraguay"),
    ("2026-06-20", "F03", "F", "Netherlands", "Sweden"),
    ("2026-06-20", "E03", "E", "Germany", "Ivory Coast"),
    ("2026-06-20", "E04", "E", "Ecuador", "Curacao"),
    ("2026-06-21", "F04", "F", "Tunisia", "Japan"),
    ("2026-06-21", "H03", "H", "Spain", "Saudi Arabia"),
    ("2026-06-21", "G03", "G", "Belgium", "Iran"),
    ("2026-06-21", "H04", "H", "Uruguay", "Cape Verde"),
    ("2026-06-21", "G04", "G", "New Zealand", "Egypt"),
    ("2026-06-22", "J03", "J", "Argentina", "Austria"),
    ("2026-06-22", "I03", "I", "France", "Iraq"),
    ("2026-06-22", "I04", "I", "Norway", "Senegal"),
    ("2026-06-22", "J04", "J", "Jordan", "Algeria"),
    ("2026-06-23", "K03", "K", "Portugal", "Uzbekistan"),
    ("2026-06-23", "L03", "L", "England", "Ghana"),
    ("2026-06-23", "L04", "L", "Panama", "Croatia"),
    ("2026-06-23", "K04", "K", "Colombia", "DR Congo"),
    ("2026-06-24", "B05", "B", "Switzerland", "Canada"),
    ("2026-06-24", "B06", "B", "Bosnia and Herzegovina", "Qatar"),
    ("2026-06-24", "C05", "C", "Morocco", "Haiti"),
    ("2026-06-24", "C06", "C", "Scotland", "Brazil"),
    ("2026-06-24", "A05", "A", "South Africa", "South Korea"),
    ("2026-06-24", "A06", "A", "Czechia", "Mexico"),
    ("2026-06-25", "E05", "E", "Curacao", "Ivory Coast"),
    ("2026-06-25", "E06", "E", "Ecuador", "Germany"),
    ("2026-06-25", "F05", "F", "Tunisia", "Netherlands"),
    ("2026-06-25", "F06", "F", "Japan", "Sweden"),
    ("2026-06-25", "D05", "D", "Turkiye", "United States"),
    ("2026-06-25", "D06", "D", "Paraguay", "Australia"),
    ("2026-06-26", "I05", "I", "Norway", "France"),
    ("2026-06-26", "I06", "I", "Senegal", "Iraq"),
    ("2026-06-26", "H05", "H", "Cape Verde", "Saudi Arabia"),
    ("2026-06-26", "H06", "H", "Uruguay", "Spain"),
    ("2026-06-26", "G05", "G", "New Zealand", "Belgium"),
    ("2026-06-26", "G06", "G", "Egypt", "Iran"),
    ("2026-06-27", "L05", "L", "Panama", "England"),
    ("2026-06-27", "L06", "L", "Croatia", "Ghana"),
    ("2026-06-27", "K05", "K", "Colombia", "Portugal"),
    ("2026-06-27", "K06", "K", "DR Congo", "Uzbekistan"),
    ("2026-06-27", "J05", "J", "Algeria", "Austria"),
    ("2026-06-27", "J06", "J", "Jordan", "Argentina"),
]


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def rank_strength(rank: int) -> float:
    return 1.0 - ((float(rank) - 1.0) / 99.0)


def fit_ridge_closed_form(X: np.ndarray, y: np.ndarray, alpha: float) -> dict[str, Any]:
    mean = X.mean(axis=0)
    std = X.std(axis=0)
    std[std < 1e-6] = 1.0
    X_scaled = (X - mean) / std
    X_design = np.column_stack([np.ones(len(X_scaled)), X_scaled])
    penalty = np.eye(X_design.shape[1]) * alpha
    penalty[0, 0] = 0.0
    coefficients = np.linalg.pinv(X_design.T @ X_design + penalty) @ X_design.T @ y
    return {"coefficients": coefficients, "mean": mean, "std": std}


def predict_ridge(model: dict[str, Any], X: np.ndarray) -> np.ndarray:
    X_scaled = (X - model["mean"]) / model["std"]
    X_design = np.column_stack([np.ones(len(X_scaled)), X_scaled])
    return X_design @ model["coefficients"]


def load_statsbomb_world_cup_rows() -> pd.DataFrame:
    cache_path = Path("tmp/statsbomb-world-cup-team-match-stats.csv")
    if cache_path.exists():
        return pd.read_csv(cache_path)

    if not STATSBOMB_ROOT.exists():
        raise FileNotFoundError("No existe tmp/statsbomb-open-data. Ejecuta primero download_statsbomb_world_cups.py")

    rows: list[dict[str, Any]] = []
    modern_seasons = {"2018", "2022"}
    match_files = sorted((STATSBOMB_ROOT / "matches" / "43").glob("*.json"))
    for match_file in match_files:
        matches = json.loads(match_file.read_text(encoding="utf-8"))
        for match in matches:
            season_name = str(match.get("season", {}).get("season_name") or match.get("season_name") or "")
            if season_name not in modern_seasons:
                continue
            event_path = STATSBOMB_ROOT / "events" / f"{match['match_id']}.json"
            if not event_path.exists():
                continue
            events = json.loads(event_path.read_text(encoding="utf-8"))
            home_team = str(match["home_team"]["home_team_name"])
            away_team = str(match["away_team"]["away_team_name"])
            stats = {
                home_team: {"shots": 0, "corners": 0, "yellow_cards": 0, "red_cards": 0, "offsides": 0, "xg": 0.0},
                away_team: {"shots": 0, "corners": 0, "yellow_cards": 0, "red_cards": 0, "offsides": 0, "xg": 0.0},
            }
            for event in events:
                team_name = event.get("team", {}).get("name")
                if team_name not in stats:
                    continue
                event_type = event.get("type", {}).get("name", "")
                if event_type == "Shot":
                    stats[team_name]["shots"] += 1
                    stats[team_name]["xg"] += float(event.get("shot", {}).get("statsbomb_xg", 0.0) or 0.0)
                elif event_type == "Pass" and event.get("pass", {}).get("type", {}).get("name") == "Corner":
                    stats[team_name]["corners"] += 1
                elif event_type == "Offside":
                    stats[team_name]["offsides"] += 1
                elif event_type == "Bad Behaviour":
                    card_name = event.get("bad_behaviour", {}).get("card", {}).get("name", "")
                    if card_name in {"Yellow Card", "Second Yellow"}:
                        stats[team_name]["yellow_cards"] += 1
                    if card_name in {"Red Card", "Second Yellow"}:
                        stats[team_name]["red_cards"] += 1

            home_score = int(match.get("home_score", 0) or 0)
            away_score = int(match.get("away_score", 0) or 0)
            stage = str(match.get("competition_stage", {}).get("name", ""))
            match_date = str(match.get("match_date", ""))
            rows.append(
                {
                    "season_name": season_name,
                    "match_id": match["match_id"],
                    "match_date": match_date,
                    "stage": stage,
                    "team": home_team,
                    "opponent": away_team,
                    "goals": home_score,
                    "opponent_goals": away_score,
                    "shots": stats[home_team]["shots"],
                    "opponent_shots": stats[away_team]["shots"],
                    "corners": stats[home_team]["corners"],
                    "opponent_corners": stats[away_team]["corners"],
                    "yellow_cards": stats[home_team]["yellow_cards"],
                    "opponent_yellow_cards": stats[away_team]["yellow_cards"],
                    "red_cards": stats[home_team]["red_cards"],
                    "opponent_red_cards": stats[away_team]["red_cards"],
                    "offsides": stats[home_team]["offsides"],
                    "opponent_offsides": stats[away_team]["offsides"],
                    "xg": round(stats[home_team]["xg"], 4),
                    "opponent_xg": round(stats[away_team]["xg"], 4),
                }
            )
            rows.append(
                {
                    "season_name": season_name,
                    "match_id": match["match_id"],
                    "match_date": match_date,
                    "stage": stage,
                    "team": away_team,
                    "opponent": home_team,
                    "goals": away_score,
                    "opponent_goals": home_score,
                    "shots": stats[away_team]["shots"],
                    "opponent_shots": stats[home_team]["shots"],
                    "corners": stats[away_team]["corners"],
                    "opponent_corners": stats[home_team]["corners"],
                    "yellow_cards": stats[away_team]["yellow_cards"],
                    "opponent_yellow_cards": stats[home_team]["yellow_cards"],
                    "red_cards": stats[away_team]["red_cards"],
                    "opponent_red_cards": stats[home_team]["red_cards"],
                    "offsides": stats[away_team]["offsides"],
                    "opponent_offsides": stats[home_team]["offsides"],
                    "xg": round(stats[away_team]["xg"], 4),
                    "opponent_xg": round(stats[home_team]["xg"], 4),
                }
            )
    frame = pd.DataFrame(rows)
    frame.to_csv(cache_path, index=False)
    return frame


def fit_ancillary_models(frame: pd.DataFrame) -> dict[str, dict[str, Any]]:
    working = frame.copy()
    working["xg_diff"] = working["xg"] - working["opponent_xg"]
    working["total_xg"] = working["xg"] + working["opponent_xg"]
    working["is_group"] = working["stage"].str.contains("group", case=False, na=False).astype(float)
    feature_columns = ["xg", "opponent_xg", "xg_diff", "total_xg", "is_group"]
    X = working[feature_columns].fillna(0.0).to_numpy(dtype=float)
    models: dict[str, dict[str, Any]] = {}
    for target in ("shots", "corners", "yellow_cards", "red_cards", "offsides"):
        y = working[target].to_numpy(dtype=float)
        model = fit_ridge_closed_form(X, y, RIDGE_ALPHA)
        model["feature_columns"] = feature_columns
        model["target"] = target
        models[target] = model
    return models


def build_current_state() -> dict[str, dict[str, float]]:
    state: dict[str, dict[str, float]] = {}
    for team, info in TEAMS.items():
        state[team] = {
            "actual_matches": 0.0,
            "actual_points": 0.0,
            "actual_gf": 0.0,
            "actual_ga": 0.0,
            "forecast_matches": 0.0,
            "forecast_points": 0.0,
            "forecast_gf": 0.0,
            "forecast_ga": 0.0,
            "strength": rank_strength(info.rank),
            "host_bonus": 0.08 if info.host else 0.0,
        }
    for _, _, _, team_a, team_b, goals_a, goals_b in PLAYED_MATCHES:
        for team_name, goals_for, goals_against in ((team_a, goals_a, goals_b), (team_b, goals_b, goals_a)):
            state[team_name]["actual_matches"] += 1.0
            state[team_name]["actual_gf"] += float(goals_for)
            state[team_name]["actual_ga"] += float(goals_against)
        if goals_a > goals_b:
            state[team_a]["actual_points"] += 3.0
        elif goals_b > goals_a:
            state[team_b]["actual_points"] += 3.0
        else:
            state[team_a]["actual_points"] += 1.0
            state[team_b]["actual_points"] += 1.0
    return state


def build_empty_group_stats() -> dict[str, dict[str, dict[str, float]]]:
    return {
        group: {
            team: {
                "team": team,
                "group": group,
                "points": 0.0,
                "gf": 0.0,
                "ga": 0.0,
                "gd": 0.0,
                "wins": 0.0,
                "draws": 0.0,
                "losses": 0.0,
                "matches": 0.0,
            }
            for team in teams
        }
        for group, teams in GROUP_TEAMS.items()
    }


def apply_group_match(
    group_stats: dict[str, dict[str, dict[str, float]]],
    group_matches: dict[str, list[dict[str, Any]]],
    group: str,
    match_id: str,
    match_date: str,
    team_a: str,
    team_b: str,
    goals_a: int,
    goals_b: int,
) -> None:
    row_a = group_stats[group][team_a]
    row_b = group_stats[group][team_b]
    row_a["matches"] += 1.0
    row_b["matches"] += 1.0
    row_a["gf"] += float(goals_a)
    row_a["ga"] += float(goals_b)
    row_b["gf"] += float(goals_b)
    row_b["ga"] += float(goals_a)
    row_a["gd"] = row_a["gf"] - row_a["ga"]
    row_b["gd"] = row_b["gf"] - row_b["ga"]

    if goals_a > goals_b:
        row_a["points"] += 3.0
        row_a["wins"] += 1.0
        row_b["losses"] += 1.0
    elif goals_b > goals_a:
        row_b["points"] += 3.0
        row_b["wins"] += 1.0
        row_a["losses"] += 1.0
    else:
        row_a["points"] += 1.0
        row_b["points"] += 1.0
        row_a["draws"] += 1.0
        row_b["draws"] += 1.0

    group_matches[group].append(
        {
            "match_id": match_id,
            "match_date": match_date,
            "team_a": team_a,
            "team_b": team_b,
            "goals_a": int(goals_a),
            "goals_b": int(goals_b),
        }
    )


def build_actual_group_snapshot() -> tuple[dict[str, dict[str, dict[str, float]]], dict[str, list[dict[str, Any]]]]:
    group_stats = build_empty_group_stats()
    group_matches = {group: [] for group in GROUP_TEAMS}
    for match_date, match_id, group, team_a, team_b, goals_a, goals_b in PLAYED_MATCHES:
        apply_group_match(group_stats, group_matches, group, match_id, match_date, team_a, team_b, goals_a, goals_b)
    return group_stats, group_matches


def clone_group_snapshot(
    group_stats: dict[str, dict[str, dict[str, float]]],
    group_matches: dict[str, list[dict[str, Any]]],
) -> tuple[dict[str, dict[str, dict[str, float]]], dict[str, list[dict[str, Any]]]]:
    cloned_stats = {
        group: {team: values.copy() for team, values in team_rows.items()}
        for group, team_rows in group_stats.items()
    }
    cloned_matches = {
        group: [row.copy() for row in rows]
        for group, rows in group_matches.items()
    }
    return cloned_stats, cloned_matches


def build_mini_league_stats(tied_teams: list[str], matches: list[dict[str, Any]]) -> dict[str, dict[str, float]]:
    tied_set = set(tied_teams)
    mini_stats = {
        team: {"points": 0.0, "gf": 0.0, "ga": 0.0}
        for team in tied_teams
    }
    for match in matches:
        if match["team_a"] not in tied_set or match["team_b"] not in tied_set:
            continue
        team_a = match["team_a"]
        team_b = match["team_b"]
        goals_a = int(match["goals_a"])
        goals_b = int(match["goals_b"])
        mini_stats[team_a]["gf"] += float(goals_a)
        mini_stats[team_a]["ga"] += float(goals_b)
        mini_stats[team_b]["gf"] += float(goals_b)
        mini_stats[team_b]["ga"] += float(goals_a)
        if goals_a > goals_b:
            mini_stats[team_a]["points"] += 3.0
        elif goals_b > goals_a:
            mini_stats[team_b]["points"] += 3.0
        else:
            mini_stats[team_a]["points"] += 1.0
            mini_stats[team_b]["points"] += 1.0
    return mini_stats


def sort_tied_group_teams(
    group: str,
    tied_teams: list[str],
    group_stats: dict[str, dict[str, dict[str, float]]],
    group_matches: dict[str, list[dict[str, Any]]],
) -> list[str]:
    mini_stats = build_mini_league_stats(tied_teams, group_matches[group])

    def tie_key(team: str) -> tuple[float, float, float, float, float, float]:
        overall = group_stats[group][team]
        mini = mini_stats[team]
        return (
            mini["points"],
            mini["gf"] - mini["ga"],
            mini["gf"],
            overall["gd"],
            overall["gf"],
            -float(TEAMS[team].rank),
        )

    return sorted(tied_teams, key=tie_key, reverse=True)


def rank_group_table(
    group: str,
    group_stats: dict[str, dict[str, dict[str, float]]],
    group_matches: dict[str, list[dict[str, Any]]],
) -> list[dict[str, Any]]:
    points_buckets: dict[float, list[str]] = {}
    for team, row in group_stats[group].items():
        points_buckets.setdefault(row["points"], []).append(team)

    ordered_teams: list[str] = []
    for points in sorted(points_buckets.keys(), reverse=True):
        bucket = points_buckets[points]
        if len(bucket) == 1:
            ordered_teams.extend(bucket)
            continue
        ordered_teams.extend(sort_tied_group_teams(group, bucket, group_stats, group_matches))

    ranked_rows: list[dict[str, Any]] = []
    for position, team in enumerate(ordered_teams, start=1):
        row = group_stats[group][team].copy()
        row["position"] = position
        ranked_rows.append(row)
    return ranked_rows


def qualification_tier(advance_prob: float, current_points: float, matches_played: float) -> str:
    if advance_prob >= 0.9:
        return "lock"
    if advance_prob >= 0.7:
        return "strong"
    if advance_prob >= 0.45:
        return "bubble"
    if matches_played >= 2.0 and current_points <= 1.0:
        return "critical"
    return "under-pressure"


def fit_goal_strength_model(state: dict[str, dict[str, float]]) -> dict[str, Any]:
    teams = list(TEAMS.keys())
    team_to_idx = {team: idx for idx, team in enumerate(teams)}
    strengths = np.array([state[team]["strength"] for team in teams], dtype=float)
    hosts = np.array([state[team]["host_bonus"] for team in teams], dtype=float)
    attack_prior = 0.82 * (strengths - strengths.mean()) + (0.18 * hosts)
    defense_prior = -0.76 * (strengths - strengths.mean()) - (0.08 * hosts)
    attack = attack_prior.copy()
    defense = defense_prior.copy()
    mu = math.log(1.34)
    sigma_attack = 0.20
    sigma_defense = 0.19
    attack_lr = 0.010
    defense_lr = 0.008
    mu_lr = 0.0008

    encoded_matches = [
        (team_to_idx[team_a], team_to_idx[team_b], float(goals_a), float(goals_b))
        for _, _, _, team_a, team_b, goals_a, goals_b in PLAYED_MATCHES
    ]

    for _ in range(2600):
        grad_attack = np.zeros_like(attack)
        grad_defense = np.zeros_like(defense)
        grad_mu = 0.0
        for idx_a, idx_b, goals_a, goals_b in encoded_matches:
            eta_a = mu + attack[idx_a] - defense[idx_b] + hosts[idx_a]
            eta_b = mu + attack[idx_b] - defense[idx_a] + hosts[idx_b]
            lam_a = math.exp(clamp(eta_a, -3.5, 3.5))
            lam_b = math.exp(clamp(eta_b, -3.5, 3.5))
            grad_attack[idx_a] += goals_a - lam_a
            grad_attack[idx_b] += goals_b - lam_b
            grad_defense[idx_b] += lam_a - goals_a
            grad_defense[idx_a] += lam_b - goals_b
            grad_mu += (goals_a - lam_a) + (goals_b - lam_b)
        grad_attack -= (attack - attack_prior) / (sigma_attack ** 2)
        grad_defense -= (defense - defense_prior) / (sigma_defense ** 2)
        attack += attack_lr * grad_attack
        defense += defense_lr * grad_defense
        mu += mu_lr * grad_mu
        attack = np.clip(attack, -1.2, 1.2)
        defense = np.clip(defense, -1.2, 1.2)
        mu = clamp(mu, math.log(0.85), math.log(1.95))

    return {
        "teams": teams,
        "team_to_idx": team_to_idx,
        "attack": attack,
        "defense": defense,
        "hosts": hosts,
        "strengths": strengths,
        "mu": mu,
        "attack_prior": attack_prior,
        "defense_prior": defense_prior,
    }


def poisson_distribution(lam: float, max_goals: int = 9) -> list[float]:
    lam = max(lam, 0.05)
    values = [math.exp(-lam)]
    for goal in range(1, max_goals):
        values.append(values[-1] * lam / goal)
    tail = max(0.0, 1.0 - sum(values))
    values.append(tail)
    return values


def outcome_probabilities(xg_a: float, xg_b: float) -> tuple[float, float, float]:
    probs_a = poisson_distribution(xg_a)
    probs_b = poisson_distribution(xg_b)
    team_a_win = 0.0
    draw = 0.0
    team_b_win = 0.0
    for goals_a, prob_a in enumerate(probs_a):
        for goals_b, prob_b in enumerate(probs_b):
            joint = prob_a * prob_b
            if goals_a > goals_b:
                team_a_win += joint
            elif goals_a == goals_b:
                draw += joint
            else:
                team_b_win += joint
    total = team_a_win + draw + team_b_win
    return team_a_win / total, draw / total, team_b_win / total


def blended_form(team: str, state: dict[str, dict[str, float]]) -> dict[str, float]:
    row = state[team]
    weighted_matches = row["actual_matches"] + (0.65 * row["forecast_matches"])
    weighted_matches = max(weighted_matches, 1.0)
    points = row["actual_points"] + (0.65 * row["forecast_points"])
    goals_for = row["actual_gf"] + (0.65 * row["forecast_gf"])
    goals_against = row["actual_ga"] + (0.65 * row["forecast_ga"])
    points_pm = points / weighted_matches
    gf_pm = goals_for / weighted_matches
    ga_pm = goals_against / weighted_matches
    goal_diff_pm = gf_pm - ga_pm
    matches_remaining = 3.0 - min(row["actual_matches"] + row["forecast_matches"], 3.0)
    pressure = 0.0
    if matches_remaining <= 1.2 and points <= 1.2:
        pressure = 0.15
    elif matches_remaining <= 1.2 and points >= 4.0:
        pressure = -0.06
    return {
        "points_pm": points_pm,
        "gf_pm": gf_pm,
        "ga_pm": ga_pm,
        "goal_diff_pm": goal_diff_pm,
        "pressure": pressure,
    }


def expected_xg(team_a: str, team_b: str, goal_model: dict[str, Any], state: dict[str, dict[str, float]], match_date: str) -> tuple[float, float, dict[str, float], dict[str, float]]:
    idx_a = goal_model["team_to_idx"][team_a]
    idx_b = goal_model["team_to_idx"][team_b]
    form_a = blended_form(team_a, state)
    form_b = blended_form(team_b, state)
    strength_edge = goal_model["strengths"][idx_a] - goal_model["strengths"][idx_b]
    weight_a = clamp(0.10 + (0.10 * state[team_a]["actual_matches"]), 0.10, 0.35)
    weight_b = clamp(0.10 + (0.10 * state[team_b]["actual_matches"]), 0.10, 0.35)
    attack_a = ((1.0 - weight_a) * goal_model["attack_prior"][idx_a]) + (weight_a * goal_model["attack"][idx_a])
    attack_b = ((1.0 - weight_b) * goal_model["attack_prior"][idx_b]) + (weight_b * goal_model["attack"][idx_b])
    defense_a = ((1.0 - weight_a) * goal_model["defense_prior"][idx_a]) + (weight_a * goal_model["defense"][idx_a])
    defense_b = ((1.0 - weight_b) * goal_model["defense_prior"][idx_b]) + (weight_b * goal_model["defense"][idx_b])
    form_edge = form_a["points_pm"] - form_b["points_pm"]
    goal_edge = form_a["goal_diff_pm"] - form_b["goal_diff_pm"]
    round_three = 1.0 if match_date >= "2026-06-24" else 0.0

    eta_a = (
        goal_model["mu"]
        + attack_a
        - defense_b
        + goal_model["hosts"][idx_a]
        + (0.55 * strength_edge)
        + (0.04 * form_edge)
        + (0.02 * goal_edge)
        + (0.015 * form_a["pressure"])
        - (0.01 * form_b["pressure"])
        - (0.025 * round_three)
    )
    eta_b = (
        goal_model["mu"]
        + attack_b
        - defense_a
        + goal_model["hosts"][idx_b]
        - (0.55 * strength_edge)
        - (0.04 * form_edge)
        - (0.02 * goal_edge)
        + (0.015 * form_b["pressure"])
        - (0.01 * form_a["pressure"])
        - (0.025 * round_three)
    )
    xg_a = clamp(math.exp(clamp(eta_a, -1.8, 1.15)), 0.35, 3.15)
    xg_b = clamp(math.exp(clamp(eta_b, -1.8, 1.15)), 0.32, 3.05)
    return xg_a, xg_b, form_a, form_b


def predict_ancillary_metrics(models: dict[str, dict[str, Any]], xg_for: float, xg_against: float) -> dict[str, float]:
    feature_map = {
        "xg": xg_for,
        "opponent_xg": xg_against,
        "xg_diff": xg_for - xg_against,
        "total_xg": xg_for + xg_against,
        "is_group": 1.0,
    }
    values = np.array([[feature_map[column] for column in next(iter(models.values()))["feature_columns"]]], dtype=float)
    outputs: dict[str, float] = {}
    floors = {"shots": 4.0, "corners": 1.0, "yellow_cards": 0.6, "red_cards": 0.02, "offsides": 0.1}
    caps = {"shots": 24.0, "corners": 10.0, "yellow_cards": 4.8, "red_cards": 0.35, "offsides": 4.2}
    for target, model in models.items():
        predicted = float(predict_ridge(model, values)[0])
        outputs[target] = round(clamp(predicted, floors[target], caps[target]), 2)
    return outputs


def confidence_level(team_win: float, draw: float, team_loss: float) -> str:
    ordered = sorted([team_win, draw, team_loss], reverse=True)
    gap = ordered[0] - ordered[1]
    if ordered[0] >= 0.58 and gap >= 0.16:
        return "high"
    if ordered[0] >= 0.46 and gap >= 0.08:
        return "medium"
    return "low"


def build_driver_rows(match_id: str, match_date: str, team: str, xg_for: float, xg_against: float, form: dict[str, float], strength_edge: float) -> list[dict]:
    goal_drivers = {
        "xg_base": xg_for,
        "points_form": 0.12 * form["points_pm"],
        "goal_form": 0.08 * form["goal_diff_pm"],
        "pressure": 0.06 * form["pressure"],
        "strength_edge": 0.40 * strength_edge,
    }
    shot_drivers = {
        "xg_link": 3.7 * xg_for,
        "tempo": 0.75 * (xg_for + xg_against),
        "pressure": 0.65 * max(form["pressure"], 0.0),
        "transition_risk": 0.45 * abs(strength_edge),
    }
    rows: list[dict] = []
    for target, driver_map in (("goals", goal_drivers), ("shots", shot_drivers)):
        for rank, (feature, contribution) in enumerate(sorted(driver_map.items(), key=lambda item: abs(item[1]), reverse=True), start=1):
            rows.append(
                {
                    "match_id": match_id,
                    "match_date": match_date,
                    "team": team,
                    "target": target,
                    "rank": rank,
                    "feature": feature,
                    "contribution": round(float(contribution), 3),
                }
            )
    return rows


def simulate_group_outlooks(future_fixture_specs: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    base_group_stats, base_group_matches = build_actual_group_snapshot()
    counts = {
        team: {
            "first": 0,
            "second": 0,
            "third": 0,
            "fourth": 0,
            "advance": 0,
            "best_third": 0,
            "eliminated": 0,
            "projected_points": 0.0,
            "projected_gd": 0.0,
            "projected_gf": 0.0,
        }
        for team in TEAMS
    }
    rng = np.random.default_rng(SIMULATION_SEED + 17)

    for _ in range(GROUP_TABLE_SIMULATIONS):
        sim_group_stats, sim_group_matches = clone_group_snapshot(base_group_stats, base_group_matches)
        for spec in future_fixture_specs:
            goals_a = int(rng.poisson(max(float(spec["xg_a"]), 0.05)))
            goals_b = int(rng.poisson(max(float(spec["xg_b"]), 0.05)))
            apply_group_match(
                sim_group_stats,
                sim_group_matches,
                str(spec["group"]),
                str(spec["match_id"]),
                str(spec["match_date"]),
                str(spec["team_a"]),
                str(spec["team_b"]),
                goals_a,
                goals_b,
            )

        ranked_groups: dict[str, list[dict[str, Any]]] = {}
        third_rows: list[dict[str, Any]] = []
        for group in sorted(GROUP_TEAMS):
            ranked_rows = rank_group_table(group, sim_group_stats, sim_group_matches)
            ranked_groups[group] = ranked_rows
            for row in ranked_rows:
                team = str(row["team"])
                counts[team]["projected_points"] += float(row["points"])
                counts[team]["projected_gd"] += float(row["gd"])
                counts[team]["projected_gf"] += float(row["gf"])
                if row["position"] == 1:
                    counts[team]["first"] += 1
                elif row["position"] == 2:
                    counts[team]["second"] += 1
                elif row["position"] == 3:
                    counts[team]["third"] += 1
                    third_rows.append(row)
                else:
                    counts[team]["fourth"] += 1

        ranked_thirds = sorted(
            third_rows,
            key=lambda row: (
                float(row["points"]),
                float(row["gd"]),
                float(row["gf"]),
                -float(TEAMS[str(row["team"])].rank),
            ),
            reverse=True,
        )
        best_third_teams = {str(row["team"]) for row in ranked_thirds[:8]}

        for ranked_rows in ranked_groups.values():
            for row in ranked_rows:
                team = str(row["team"])
                if row["position"] <= 2:
                    counts[team]["advance"] += 1
                elif team in best_third_teams:
                    counts[team]["advance"] += 1
                    counts[team]["best_third"] += 1
                else:
                    counts[team]["eliminated"] += 1

    current_ranked_by_group = {
        group: rank_group_table(group, base_group_stats, base_group_matches)
        for group in sorted(GROUP_TEAMS)
    }
    current_positions = {
        row["team"]: row["position"]
        for rows in current_ranked_by_group.values()
        for row in rows
    }

    group_outlooks: list[dict[str, Any]] = []
    for group in sorted(GROUP_TEAMS):
        for team in GROUP_TEAMS[group]:
            current_row = base_group_stats[group][team]
            team_counts = counts[team]
            advance_prob = team_counts["advance"] / GROUP_TABLE_SIMULATIONS
            group_outlooks.append(
                {
                    "team": team,
                    "group": group,
                    "current_position": int(current_positions.get(team, 4)),
                    "matches_played": int(current_row["matches"]),
                    "current_points": round(float(current_row["points"]), 2),
                    "current_goals_for": round(float(current_row["gf"]), 2),
                    "current_goals_against": round(float(current_row["ga"]), 2),
                    "current_goal_diff": round(float(current_row["gd"]), 2),
                    "projected_points": round(team_counts["projected_points"] / GROUP_TABLE_SIMULATIONS, 2),
                    "projected_goal_diff": round(team_counts["projected_gd"] / GROUP_TABLE_SIMULATIONS, 2),
                    "projected_goals_for": round(team_counts["projected_gf"] / GROUP_TABLE_SIMULATIONS, 2),
                    "first_place_prob": round(team_counts["first"] / GROUP_TABLE_SIMULATIONS, 4),
                    "second_place_prob": round(team_counts["second"] / GROUP_TABLE_SIMULATIONS, 4),
                    "third_place_prob": round(team_counts["third"] / GROUP_TABLE_SIMULATIONS, 4),
                    "fourth_place_prob": round(team_counts["fourth"] / GROUP_TABLE_SIMULATIONS, 4),
                    "best_third_advancement_prob": round(team_counts["best_third"] / GROUP_TABLE_SIMULATIONS, 4),
                    "advance_prob": round(advance_prob, 4),
                    "elimination_prob": round(team_counts["eliminated"] / GROUP_TABLE_SIMULATIONS, 4),
                    "pressure_tier": qualification_tier(advance_prob, float(current_row["points"]), float(current_row["matches"])),
                }
            )

    group_summaries: list[dict[str, Any]] = []
    for group in sorted(GROUP_TEAMS):
        rows = [row for row in group_outlooks if row["group"] == group]
        by_group_win = sorted(rows, key=lambda row: (-float(row["first_place_prob"]), -float(row["advance_prob"]), row["team"]))
        by_advance = sorted(rows, key=lambda row: (-float(row["advance_prob"]), -float(row["projected_points"]), row["team"]))
        bubble_team = min(rows, key=lambda row: abs(float(row["advance_prob"]) - 0.5))
        gap_second_third = float(by_advance[1]["advance_prob"]) - float(by_advance[2]["advance_prob"])
        group_summaries.append(
            {
                "group": group,
                "favorite_team": by_group_win[0]["team"],
                "favorite_group_win_prob": round(float(by_group_win[0]["first_place_prob"]), 4),
                "likely_advancers": [by_advance[0]["team"], by_advance[1]["team"]],
                "bubble_team": bubble_team["team"],
                "bubble_advance_prob": round(float(bubble_team["advance_prob"]), 4),
                "second_third_gap": round(gap_second_third, 4),
            }
        )

    group_outlooks = sorted(
        group_outlooks,
        key=lambda row: (row["group"], float(row["current_position"]), -float(row["advance_prob"]), row["team"]),
    )
    return group_outlooks, group_summaries


def build_pattern_signals(
    match_simulations: list[dict[str, Any]],
    group_outlooks: list[dict[str, Any]],
    group_summaries: list[dict[str, Any]],
    team_profiles: list[dict[str, Any]],
    state: dict[str, dict[str, float]],
) -> list[dict[str, Any]]:
    played_count = max(len(PLAYED_MATCHES), 1)
    total_goals = sum(goals_a + goals_b for _, _, _, _, _, goals_a, goals_b in PLAYED_MATCHES)
    over_2_5 = sum(1 for _, _, _, _, _, goals_a, goals_b in PLAYED_MATCHES if (goals_a + goals_b) >= 3)
    draws = sum(1 for _, _, _, _, _, goals_a, goals_b in PLAYED_MATCHES if goals_a == goals_b)
    clean_sheets = sum(
        1
        for _, _, _, _, _, goals_a, goals_b in PLAYED_MATCHES
        if goals_a == 0 or goals_b == 0
    )

    host_teams = [team for team, info in TEAMS.items() if info.host]
    host_matches = sum(state[team]["actual_matches"] for team in host_teams)
    host_points = sum(state[team]["actual_points"] for team in host_teams)
    host_goal_diff = sum(state[team]["actual_gf"] - state[team]["actual_ga"] for team in host_teams)
    host_ppg = host_points / max(host_matches, 1.0)

    advance_rows = sorted(group_outlooks, key=lambda row: (-float(row["advance_prob"]), row["team"]))
    lower_seed_rows: list[dict[str, Any]] = []
    upper_seed_rows: list[dict[str, Any]] = []
    for row in group_outlooks:
        ordered = GROUP_TEAMS[str(row["group"])]
        seed_position = ordered.index(str(row["team"])) + 1
        enriched = {**row, "seed_position": seed_position}
        if seed_position >= 3:
            lower_seed_rows.append(enriched)
        else:
            upper_seed_rows.append(enriched)

    rising_team = max(lower_seed_rows, key=lambda row: (float(row["advance_prob"]), float(row["projected_points"])))
    fragile_favorite = min(upper_seed_rows, key=lambda row: (float(row["advance_prob"]), -float(row["projected_points"])))
    open_group = min(group_summaries, key=lambda row: float(row["second_third_gap"]))
    knife_edge_match = min(
        match_simulations,
        key=lambda row: abs(float(row["team_a_win_prob_90m"]) - float(row["team_b_win_prob_90m"])),
    )
    highest_tempo = max(
        match_simulations,
        key=lambda row: (float(row["over_2_5_prob"]), float(row["team_a_predicted_goals"]) + float(row["team_b_predicted_goals"])),
    )
    form_leader = team_profiles[0] if team_profiles else None

    return [
        {
            "title": "Clima de goles",
            "tone": "base",
            "summary": (
                f"El torneo llega con {total_goals / played_count:.2f} goles por partido, "
                f"{(over_2_5 / played_count) * 100:.1f}% de overs 2.5 y {(draws / played_count) * 100:.1f}% de empates."
            ),
        },
        {
            "title": "Pulso anfitrion",
            "tone": "low",
            "summary": (
                f"Mexico, Canada y Estados Unidos suman {host_points:.0f} puntos en {host_matches:.0f} partidos "
                f"({host_ppg:.2f} por juego) y un diferencial conjunto de {host_goal_diff:+.0f}."
            ),
        },
        {
            "title": "Sorpresa positiva",
            "tone": "low",
            "summary": (
                f"{rising_team['team']} llega como semilla {rising_team['seed_position']} y aun asi proyecta "
                f"{float(rising_team['advance_prob']) * 100:.1f}% de avance con {float(rising_team['projected_points']):.2f} puntos esperados."
            ),
        },
        {
            "title": "Favorito bajo presion",
            "tone": "mid",
            "summary": (
                f"{fragile_favorite['team']} era semilla {fragile_favorite['seed_position']} en su grupo, "
                f"pero solo marca {float(fragile_favorite['advance_prob']) * 100:.1f}% de pase."
            ),
        },
        {
            "title": "Grupo mas abierto",
            "tone": "mid",
            "summary": (
                f"El Grupo {open_group['group']} es el mas fino: el margen entre el segundo y el tercero en probabilidad "
                f"de clasificar es de solo {float(open_group['second_third_gap']) * 100:.1f} puntos."
            ),
        },
        {
            "title": "Cruce de maxima friccion",
            "tone": "mid",
            "summary": (
                f"{knife_edge_match['team_a']} vs {knife_edge_match['team_b']} es el partido mas equilibrado; "
                f"la diferencia entre ambos lados es minima y el empate vive en {float(knife_edge_match['draw_prob_90m']) * 100:.1f}%."
            ),
        },
        {
            "title": "Cruce mas caliente",
            "tone": "low",
            "summary": (
                f"{highest_tempo['team_a']} vs {highest_tempo['team_b']} concentra la mayor probabilidad de over 2.5 "
                f"({float(highest_tempo['over_2_5_prob']) * 100:.1f}%) y el mayor pulso ofensivo esperado."
            ),
        },
        {
            "title": "Equipo mas estable",
            "tone": "low",
            "summary": (
                f"{form_leader['team']} lidera el corte por forma combinada, con indice de forma {float(form_leader['form_score']):.2f} "
                f"y ataque relativo de {float(form_leader['attack_index']):.2f}."
            ) if form_leader else "Sin perfiles suficientes para detectar estabilidad.",
        },
        {
            "title": "Puertas cerradas",
            "tone": "base",
            "summary": f"El {clean_sheets / played_count:.1%} de los partidos ya jugados termino con al menos un arco en cero.",
        },
    ]


def build_predictions() -> dict[str, Any]:
    historical_frame = load_statsbomb_world_cup_rows()
    ancillary_models = fit_ancillary_models(historical_frame)
    state = build_current_state()
    goal_model = fit_goal_strength_model(state)
    rng = np.random.default_rng(SIMULATION_SEED)

    match_predictions: list[dict[str, Any]] = []
    match_simulations: list[dict[str, Any]] = []
    fixture_drivers: list[dict[str, Any]] = []
    future_fixture_specs: list[dict[str, Any]] = []

    for match_date, match_id, group, team_a, team_b in FUTURE_FIXTURES:
        xg_a, xg_b, form_a, form_b = expected_xg(team_a, team_b, goal_model, state, match_date)
        team_a_win, draw, team_b_win = outcome_probabilities(xg_a, xg_b)
        ancillary_a = predict_ancillary_metrics(ancillary_models, xg_a, xg_b)
        ancillary_b = predict_ancillary_metrics(ancillary_models, xg_b, xg_a)
        score_samples_a = rng.poisson(xg_a, SIMULATIONS)
        score_samples_b = rng.poisson(xg_b, SIMULATIONS)
        top_scoreline = Counter(zip(score_samples_a.tolist(), score_samples_b.tolist())).most_common(1)[0][0]
        predicted_result = "Draw"
        predicted_winner = team_a if team_a_win + (0.5 * draw) >= 0.5 else team_b
        if team_a_win >= draw and team_a_win >= team_b_win:
            predicted_result = team_a
        elif team_b_win >= draw and team_b_win >= team_a_win:
            predicted_result = team_b

        for team_name, opponent_name, xg_for, xg_against, team_win_prob, team_loss_prob, ancillary, form, strength_edge in (
            (team_a, team_b, xg_a, xg_b, team_a_win, team_b_win, ancillary_a, form_a, goal_model["strengths"][goal_model["team_to_idx"][team_a]] - goal_model["strengths"][goal_model["team_to_idx"][team_b]]),
            (team_b, team_a, xg_b, xg_a, team_b_win, team_a_win, ancillary_b, form_b, goal_model["strengths"][goal_model["team_to_idx"][team_b]] - goal_model["strengths"][goal_model["team_to_idx"][team_a]]),
        ):
            match_predictions.append(
                {
                    "match_id": match_id,
                    "match_date": match_date,
                    "team": team_name,
                    "opponent": opponent_name,
                    "stage_bucket": "group",
                    "predicted_goals": round(xg_for, 2),
                    "predicted_opponent_goals": round(xg_against, 2),
                    "win_prob_90m": round(team_win_prob, 4),
                    "draw_prob_90m": round(draw, 4),
                    "loss_prob_90m": round(team_loss_prob, 4),
                    "predicted_result_90m": predicted_result,
                    "predicted_winner": predicted_winner,
                    "predicted_shots": ancillary["shots"],
                    "predicted_corners": ancillary["corners"],
                    "predicted_yellow_cards": ancillary["yellow_cards"],
                    "predicted_red_cards": ancillary["red_cards"],
                    "predicted_offsides": ancillary["offsides"],
                }
            )
            fixture_drivers.extend(build_driver_rows(match_id, match_date, team_name, xg_for, xg_against, form, strength_edge))

        match_simulations.append(
            {
                "match_id": match_id,
                "match_date": match_date,
                "group": group,
                "stage_bucket": "group",
                "team_a": team_a,
                "team_b": team_b,
                "team_a_predicted_goals": round(xg_a, 2),
                "team_b_predicted_goals": round(xg_b, 2),
                "team_a_win_prob_90m": round(team_a_win, 4),
                "draw_prob_90m": round(draw, 4),
                "team_b_win_prob_90m": round(team_b_win, 4),
                "over_2_5_prob": round(float(np.mean((score_samples_a + score_samples_b) >= 3)), 4),
                "btts_prob": round(float(np.mean((score_samples_a >= 1) & (score_samples_b >= 1))), 4),
                "top_scoreline": f"{top_scoreline[0]}-{top_scoreline[1]}",
                "confidence_level": confidence_level(team_a_win, draw, team_b_win),
                "predicted_winner": predicted_winner,
            }
        )
        future_fixture_specs.append(
            {
                "match_id": match_id,
                "match_date": match_date,
                "group": group,
                "team_a": team_a,
                "team_b": team_b,
                "xg_a": round(xg_a, 4),
                "xg_b": round(xg_b, 4),
            }
        )

        state[team_a]["forecast_matches"] += 1.0
        state[team_b]["forecast_matches"] += 1.0
        state[team_a]["forecast_points"] += (3.0 * team_a_win) + draw
        state[team_b]["forecast_points"] += (3.0 * team_b_win) + draw
        state[team_a]["forecast_gf"] += xg_a
        state[team_a]["forecast_ga"] += xg_b
        state[team_b]["forecast_gf"] += xg_b
        state[team_b]["forecast_ga"] += xg_a

    group_outlooks, group_summaries = simulate_group_outlooks(future_fixture_specs)
    group_outlook_map = {row["team"]: row for row in group_outlooks}

    team_profiles = []
    for team, info in TEAMS.items():
        form = blended_form(team, state)
        idx = goal_model["team_to_idx"][team]
        attack_rating = goal_model["attack"][idx]
        defense_rating = goal_model["defense"][idx]
        shots_proxy = 4.9 + (4.3 * max(math.exp(goal_model["mu"] + attack_rating), 0.2))
        group_outlook = group_outlook_map.get(team, {})
        team_profiles.append(
            {
                "team": team,
                "group": info.group,
                "matches_played": int(state[team]["actual_matches"]),
                "recent_points_5": round(form["points_pm"], 3),
                "recent_goals_for": round(form["gf_pm"], 3),
                "recent_goals_against": round(form["ga_pm"], 3),
                "recent_goal_diff": round(form["goal_diff_pm"], 3),
                "attack_index": round(math.exp(attack_rating), 3),
                "defense_index": round(math.exp(defense_rating), 3),
                "recent_shots_for": round(shots_proxy, 3),
                "discipline_pressure": round(1.0 + max(form["pressure"], 0.0), 3),
                "form_score": round((form["points_pm"] * 1.05) + (form["goal_diff_pm"] * 0.6) + (0.8 * state[team]["strength"]) - (0.18 * defense_rating), 3),
                "advance_prob": round(float(group_outlook.get("advance_prob", 0.0)), 4),
                "first_place_prob": round(float(group_outlook.get("first_place_prob", 0.0)), 4),
                "current_position": int(group_outlook.get("current_position", 4)),
                "projected_points": round(float(group_outlook.get("projected_points", 0.0)), 2),
            }
        )
    team_profiles = sorted(team_profiles, key=lambda row: (-row["form_score"], row["team"]))
    pattern_signals = build_pattern_signals(match_simulations, group_outlooks, group_summaries, team_profiles, state)

    report_lines = [
        "# Mundial 2026 | Corte de fase de grupos con calibracion historica",
        "",
        "Actualizado con resultados jugados hasta el 18 de junio de 2026.",
        "Modelo de goles: Poisson con ataque/defensa latentes, prior por ranking FIFA de junio 2026 y actualizacion por resultados reales del torneo.",
        "Metricas complementarias: remates, corners, tarjetas y offsides calibradas con eventos abiertos de StatsBomb de los Mundiales 2018 y 2022.",
        "",
        "## Patrones y tendencias detectadas",
    ]
    for signal in pattern_signals:
        report_lines.append(f"- {signal['title']}: {signal['summary']}")
    report_lines.extend(["", "## Probabilidades de clasificacion por grupo"])
    for group in sorted(GROUP_TEAMS):
        report_lines.append(f"### Grupo {group}")
        group_rows = [row for row in group_outlooks if row["group"] == group]
        group_rows = sorted(
            group_rows,
            key=lambda row: (-float(row["advance_prob"]), -float(row["first_place_prob"]), row["team"]),
        )
        for row in group_rows:
            report_lines.append(
                f"- {row['team']}: avance {float(row['advance_prob']) * 100:.1f}% | "
                f"1ro {float(row['first_place_prob']) * 100:.1f}% | "
                f"2do {float(row['second_place_prob']) * 100:.1f}% | "
                f"mejor 3ro {float(row['best_third_advancement_prob']) * 100:.1f}% | "
                f"puntos proyectados {float(row['projected_points']):.2f} | presion {row['pressure_tier']}."
            )
    report_lines.extend(["", "## Predicciones partido a partido"])
    last_date = ""
    for match in match_simulations:
        if match["match_date"] != last_date:
            last_date = match["match_date"]
            report_lines.append(f"## {last_date}")
        report_lines.append(
            f"- Grupo {match['group']}: {match['team_a']} vs {match['team_b']} | "
            f"xG esperado {match['team_a_predicted_goals']:.2f}-{match['team_b_predicted_goals']:.2f} | "
            f"ganador probable {match['predicted_winner']} | confianza {match['confidence_level']} | "
            f"scoreline mas frecuente {match['top_scoreline']}."
        )
    analysis_report = "\n".join(report_lines)

    return {
        "sourceLabel": "Mundial 2026 | fase de grupos restante | calibracion historica + patrones + clasificacion",
        "createdAt": datetime(2026, 6, 19, 12, 0, 0).isoformat(),
        "modelSummary": {
            "model_name": "world-cup-live-bayesian-poisson-calibrated",
            "model_type": "latent-attack-defense-poisson-plus-historical-calibration-and-group-simulation",
            "notes": [
                "Base de fuerza con ranking FIFA de junio 2026.",
                "Actualizacion con resultados reales del Mundial jugados hasta el 18 de junio de 2026.",
                "Remates, corners, tarjetas y offsides calibrados con eventos abiertos de StatsBomb de los Mundiales 2018 y 2022.",
                "La tabla se simula con desempates de mini-liga para equipos empatados en puntos dentro de cada grupo.",
                "La capa de jugador no se publica en esta version porque no hay feed abierto uniforme de remates por jugador del Mundial 2026 en tiempo real dentro del proyecto.",
            ],
            "metadata": {
                "available_targets": ["goals", "corners", "yellow_cards", "red_cards", "offsides", "shots"],
                "simulations": SIMULATIONS,
                "simulation_seed": SIMULATION_SEED,
                "group_table_simulations": GROUP_TABLE_SIMULATIONS,
                "cutoff_date": "2026-06-19",
                "played_matches_in_cutoff": len(PLAYED_MATCHES),
                "predicted_matches_remaining_in_groups": len(FUTURE_FIXTURES),
                "historical_statsbomb_rows": int(len(historical_frame)),
                "historical_statsbomb_seasons": ["2018", "2022"],
            },
        },
        "matchPredictions": match_predictions,
        "matchSimulations": match_simulations,
        "teamProfiles": team_profiles,
        "groupOutlooks": group_outlooks,
        "groupSummaries": group_summaries,
        "patternSignals": pattern_signals,
        "fixtureDrivers": fixture_drivers,
        "playerPredictions": [],
        "analysisReport": analysis_report,
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    bundle = build_predictions()
    OUTPUT_BUNDLE_PATH.write_text(json.dumps(bundle, indent=2, ensure_ascii=False), encoding="utf-8")
    OUTPUT_DEMO_PATH.write_text(json.dumps(bundle, indent=2, ensure_ascii=False), encoding="utf-8")
    OUTPUT_REPORT_PATH.write_text(bundle["analysisReport"], encoding="utf-8")
    print(f"Bundle preciso actualizado en {OUTPUT_BUNDLE_PATH}")


if __name__ == "__main__":
    main()
