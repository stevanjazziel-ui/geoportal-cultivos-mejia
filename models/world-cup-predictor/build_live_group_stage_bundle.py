from __future__ import annotations

import json
import math
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import numpy as np


OUTPUT_DIR = Path("public-data/world-cup-predictor")
LIVE_BUNDLE_NAME = "live_group_stage_bundle.json"
LIVE_REPORT_NAME = "live_group_stage_report.md"
SIMULATION_SEED = 20260619
SIMULATIONS = 5000


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


PAST_RESULTS = [
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


def poisson_distribution(lam: float, max_goals: int = 8) -> list[float]:
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


def build_initial_state() -> dict[str, dict[str, float]]:
    state: dict[str, dict[str, float]] = {}
    for team, info in TEAMS.items():
        rating_strength = 1.0 - ((info.rank - 1) / 99.0)
        state[team] = {
            "actual_matches": 0.0,
            "actual_points": 0.0,
            "actual_gf": 0.0,
            "actual_ga": 0.0,
            "forecast_matches": 0.0,
            "forecast_points": 0.0,
            "forecast_gf": 0.0,
            "forecast_ga": 0.0,
            "rating_strength": rating_strength,
            "rank": float(info.rank),
            "host_bonus": 0.08 if info.host else 0.0,
        }
    for _, _, _, team_a, team_b, goals_a, goals_b in PAST_RESULTS:
        update_actual_result(state, team_a, team_b, goals_a, goals_b)
    return state


def update_actual_result(state: dict[str, dict[str, float]], team_a: str, team_b: str, goals_a: int, goals_b: int) -> None:
    for team, goals_for, goals_against in ((team_a, goals_a, goals_b), (team_b, goals_b, goals_a)):
        state[team]["actual_matches"] += 1.0
        state[team]["actual_gf"] += float(goals_for)
        state[team]["actual_ga"] += float(goals_against)
    if goals_a > goals_b:
        state[team_a]["actual_points"] += 3.0
    elif goals_b > goals_a:
        state[team_b]["actual_points"] += 3.0
    else:
        state[team_a]["actual_points"] += 1.0
        state[team_b]["actual_points"] += 1.0


def blended_metrics(team: str, state: dict[str, dict[str, float]]) -> dict[str, float]:
    row = state[team]
    total_matches = row["actual_matches"] + (0.75 * row["forecast_matches"])
    total_matches = max(total_matches, 1.0)
    points = row["actual_points"] + (0.75 * row["forecast_points"])
    goals_for = row["actual_gf"] + (0.75 * row["forecast_gf"])
    goals_against = row["actual_ga"] + (0.75 * row["forecast_ga"])
    points_pm = points / total_matches
    gf_pm = goals_for / total_matches
    ga_pm = goals_against / total_matches
    goal_diff_pm = gf_pm - ga_pm
    form_signal = clamp(
        (0.48 * (points_pm / 3.0))
        + (0.32 * ((goal_diff_pm + 1.8) / 3.6))
        + (0.20 * clamp(gf_pm / 2.4, 0.0, 1.0)),
        0.0,
        1.0,
    )
    pressure = 0.0
    if row["actual_matches"] >= 1:
        if row["actual_points"] <= 0.0:
            pressure = 0.14
        elif row["actual_points"] <= 1.0:
            pressure = 0.08
        elif row["actual_points"] >= 4.0 and row["actual_matches"] >= 2:
            pressure = -0.05
    return {
        "matches": total_matches,
        "points_pm": points_pm,
        "gf_pm": gf_pm,
        "ga_pm": ga_pm,
        "goal_diff_pm": goal_diff_pm,
        "rating_strength": row["rating_strength"],
        "host_bonus": row["host_bonus"],
        "form_signal": form_signal,
        "pressure": pressure,
        "rank": row["rank"],
    }


def expected_goals(team_a: str, team_b: str, state: dict[str, dict[str, float]], match_date: str) -> tuple[float, float, dict[str, float], dict[str, float]]:
    ctx_a = blended_metrics(team_a, state)
    ctx_b = blended_metrics(team_b, state)
    rank_edge = ctx_a["rating_strength"] - ctx_b["rating_strength"]
    form_edge = ctx_a["form_signal"] - ctx_b["form_signal"]
    attack_edge_a = (ctx_a["gf_pm"] - ctx_b["ga_pm"]) / 2.6
    attack_edge_b = (ctx_b["gf_pm"] - ctx_a["ga_pm"]) / 2.6
    host_edge = ctx_a["host_bonus"] - ctx_b["host_bonus"]
    pressure_edge = ctx_a["pressure"] - ctx_b["pressure"]
    round_three = 1.0 if match_date >= "2026-06-24" else 0.0

    xg_a = 1.16 + (1.02 * rank_edge) + (0.74 * form_edge) + (0.38 * attack_edge_a) + (0.18 * host_edge) + (0.11 * pressure_edge)
    xg_b = 1.16 - (1.02 * rank_edge) - (0.74 * form_edge) + (0.38 * attack_edge_b) - (0.18 * host_edge) - (0.11 * pressure_edge)

    if round_three:
        xg_a -= 0.05
        xg_b -= 0.05

    xg_a = clamp(xg_a, 0.35, 3.25)
    xg_b = clamp(xg_b, 0.30, 3.05)
    return xg_a, xg_b, ctx_a, ctx_b


def ancillary_metrics(xg_team: float, xg_opponent: float, ctx_team: dict[str, float], ctx_opp: dict[str, float]) -> dict[str, float]:
    rank_edge = ctx_team["rating_strength"] - ctx_opp["rating_strength"]
    shots = clamp(6.6 + (3.75 * xg_team) + (1.9 * max(rank_edge, 0.0)) + (0.85 * ctx_team["gf_pm"]) + (0.45 * ctx_team["pressure"] * 10.0), 5.0, 22.0)
    corners = clamp(2.0 + (0.30 * shots) + (0.38 * max(rank_edge, 0.0)) + (0.10 * (xg_team + xg_opponent)), 2.0, 9.5)
    offsides = clamp(0.45 + (0.07 * shots) + (0.12 * ctx_team["gf_pm"]) + (0.18 * max(rank_edge, 0.0)), 0.2, 3.8)
    yellow_cards = clamp(1.2 + (0.35 * max(-rank_edge, 0.0)) + (0.18 * ctx_team["pressure"] * 10.0) + (0.10 * ctx_team["ga_pm"]), 0.8, 4.2)
    red_cards = clamp(0.03 + (0.05 * max(yellow_cards - 2.0, 0.0)) + (0.02 * ctx_team["pressure"] * 10.0), 0.02, 0.25)
    return {
        "shots": round(shots, 2),
        "corners": round(corners, 2),
        "offsides": round(offsides, 2),
        "yellow_cards": round(yellow_cards, 2),
        "red_cards": round(red_cards, 2),
    }


def simulate_match(team_a: str, team_b: str, match_id: str, match_date: str, group: str, state: dict[str, dict[str, float]], rng: np.random.Generator) -> tuple[dict, list[dict]]:
    xg_a, xg_b, ctx_a, ctx_b = expected_goals(team_a, team_b, state, match_date)
    metrics_a = ancillary_metrics(xg_a, xg_b, ctx_a, ctx_b)
    metrics_b = ancillary_metrics(xg_b, xg_a, ctx_b, ctx_a)
    team_a_win, draw, team_b_win = outcome_probabilities(xg_a, xg_b)
    expected_points_a = (3.0 * team_a_win) + draw
    expected_points_b = (3.0 * team_b_win) + draw

    scores_a = rng.poisson(xg_a, size=SIMULATIONS)
    scores_b = rng.poisson(xg_b, size=SIMULATIONS)
    over_2_5 = float(np.mean((scores_a + scores_b) >= 3))
    btts = float(np.mean((scores_a >= 1) & (scores_b >= 1)))
    scoreline_counter = Counter(zip(scores_a.tolist(), scores_b.tolist()))
    top_score = max(scoreline_counter.items(), key=lambda item: item[1])[0]
    max_prob = max(team_a_win, draw, team_b_win)
    second_prob = sorted([team_a_win, draw, team_b_win], reverse=True)[1]
    confidence_gap = max_prob - second_prob
    confidence_level = "high" if confidence_gap >= 0.18 else "medium" if confidence_gap >= 0.08 else "low"

    drivers_a = {
        "rank_edge": 1.02 * (ctx_a["rating_strength"] - ctx_b["rating_strength"]),
        "form_edge": 0.74 * (ctx_a["form_signal"] - ctx_b["form_signal"]),
        "attack_trend": 0.38 * ((ctx_a["gf_pm"] - ctx_b["ga_pm"]) / 2.6),
        "host_context": 0.18 * (ctx_a["host_bonus"] - ctx_b["host_bonus"]),
        "pressure": 0.11 * (ctx_a["pressure"] - ctx_b["pressure"]),
    }
    drivers_b = {
        "rank_edge": 1.02 * (ctx_b["rating_strength"] - ctx_a["rating_strength"]),
        "form_edge": 0.74 * (ctx_b["form_signal"] - ctx_a["form_signal"]),
        "attack_trend": 0.38 * ((ctx_b["gf_pm"] - ctx_a["ga_pm"]) / 2.6),
        "host_context": 0.18 * (ctx_b["host_bonus"] - ctx_a["host_bonus"]),
        "pressure": 0.11 * (ctx_b["pressure"] - ctx_a["pressure"]),
    }

    shot_drivers_a = {
        "xg_link": 3.75 * xg_a,
        "control_edge": 1.9 * max(ctx_a["rating_strength"] - ctx_b["rating_strength"], 0.0),
        "recent_output": 0.85 * ctx_a["gf_pm"],
        "urgency": 0.45 * ctx_a["pressure"] * 10.0,
    }
    shot_drivers_b = {
        "xg_link": 3.75 * xg_b,
        "control_edge": 1.9 * max(ctx_b["rating_strength"] - ctx_a["rating_strength"], 0.0),
        "recent_output": 0.85 * ctx_b["gf_pm"],
        "urgency": 0.45 * ctx_b["pressure"] * 10.0,
    }

    fixture_drivers: list[dict] = []
    for team_name, driver_map in ((team_a, drivers_a), (team_b, drivers_b)):
        for rank, (feature, contribution) in enumerate(sorted(driver_map.items(), key=lambda item: abs(item[1]), reverse=True), start=1):
            fixture_drivers.append(
                {
                    "match_id": match_id,
                    "match_date": match_date,
                    "team": team_name,
                    "target": "goals",
                    "rank": rank,
                    "feature": feature,
                    "contribution": round(contribution, 3),
                }
            )
    for team_name, driver_map in ((team_a, shot_drivers_a), (team_b, shot_drivers_b)):
        for rank, (feature, contribution) in enumerate(sorted(driver_map.items(), key=lambda item: abs(item[1]), reverse=True), start=1):
            fixture_drivers.append(
                {
                    "match_id": match_id,
                    "match_date": match_date,
                    "team": team_name,
                    "target": "shots",
                    "rank": rank,
                    "feature": feature,
                    "contribution": round(contribution, 3),
                }
            )

    predicted_result = "Draw"
    predicted_winner = team_a if team_a_win + (draw * 0.5) >= 0.5 else team_b
    if team_a_win >= draw and team_a_win >= team_b_win:
        predicted_result = team_a
    elif team_b_win >= draw and team_b_win >= team_a_win:
        predicted_result = team_b

    team_rows = [
        {
            "match_id": match_id,
            "match_date": match_date,
            "team": team_a,
            "opponent": team_b,
            "stage_bucket": "group",
            "predicted_goals": round(xg_a, 2),
            "predicted_opponent_goals": round(xg_b, 2),
            "win_prob_90m": round(team_a_win, 4),
            "draw_prob_90m": round(draw, 4),
            "loss_prob_90m": round(team_b_win, 4),
            "predicted_result_90m": predicted_result,
            "predicted_winner": predicted_winner,
            "predicted_corners": metrics_a["corners"],
            "predicted_yellow_cards": metrics_a["yellow_cards"],
            "predicted_red_cards": metrics_a["red_cards"],
            "predicted_offsides": metrics_a["offsides"],
            "predicted_shots": metrics_a["shots"],
        },
        {
            "match_id": match_id,
            "match_date": match_date,
            "team": team_b,
            "opponent": team_a,
            "stage_bucket": "group",
            "predicted_goals": round(xg_b, 2),
            "predicted_opponent_goals": round(xg_a, 2),
            "win_prob_90m": round(team_b_win, 4),
            "draw_prob_90m": round(draw, 4),
            "loss_prob_90m": round(team_a_win, 4),
            "predicted_result_90m": predicted_result,
            "predicted_winner": predicted_winner,
            "predicted_corners": metrics_b["corners"],
            "predicted_yellow_cards": metrics_b["yellow_cards"],
            "predicted_red_cards": metrics_b["red_cards"],
            "predicted_offsides": metrics_b["offsides"],
            "predicted_shots": metrics_b["shots"],
        },
    ]

    match_summary = {
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
        "over_2_5_prob": round(over_2_5, 4),
        "btts_prob": round(btts, 4),
        "top_scoreline": f"{top_score[0]}-{top_score[1]}",
        "confidence_level": confidence_level,
        "predicted_winner": predicted_winner,
    }

    state[team_a]["forecast_matches"] += 1.0
    state[team_a]["forecast_points"] += expected_points_a
    state[team_a]["forecast_gf"] += xg_a
    state[team_a]["forecast_ga"] += xg_b
    state[team_b]["forecast_matches"] += 1.0
    state[team_b]["forecast_points"] += expected_points_b
    state[team_b]["forecast_gf"] += xg_b
    state[team_b]["forecast_ga"] += xg_a

    return match_summary, team_rows + fixture_drivers


def build_team_profiles(state: dict[str, dict[str, float]]) -> list[dict]:
    rows: list[dict] = []
    goal_mean = sum(team_state["actual_gf"] for team_state in state.values()) / max(sum(team_state["actual_matches"] for team_state in state.values()), 1.0)
    goal_mean = max(goal_mean, 1.0)
    for team, info in TEAMS.items():
        ctx = blended_metrics(team, state)
        discipline_pressure = round(1.05 + max(0.0, 0.25 - (ctx["rating_strength"] / 3.0)) + max(ctx["pressure"], 0.0), 3)
        form_score = (
            (ctx["points_pm"] * 1.1)
            + (ctx["goal_diff_pm"] * 0.55)
            + (ctx["rating_strength"] * 1.8)
            - (discipline_pressure * 0.08)
        )
        rows.append(
            {
                "team": team,
                "group": info.group,
                "matches_played": round(state[team]["actual_matches"], 0),
                "recent_points_5": round(ctx["points_pm"], 3),
                "recent_goals_for": round(ctx["gf_pm"], 3),
                "recent_goals_against": round(ctx["ga_pm"], 3),
                "recent_goal_diff": round(ctx["goal_diff_pm"], 3),
                "attack_index": round(ctx["gf_pm"] / goal_mean, 3),
                "defense_index": round(ctx["ga_pm"] / goal_mean, 3),
                "discipline_pressure": discipline_pressure,
                "form_score": round(form_score, 3),
            }
        )
    return sorted(rows, key=lambda row: (-row["form_score"], row["team"]))


def build_report(match_summaries: list[dict]) -> str:
    lines = [
        "# Mundial 2026 | Corte de fase de grupos",
        "",
        "Actualizado con resultados jugados hasta el 18 de junio de 2026 y proyecciones desde el 19 al 27 de junio.",
        "Modelo: ranking FIFA de junio 2026 + forma actual del torneo + simulacion Poisson.",
        "",
    ]
    current_date = ""
    for match in match_summaries:
        if match["match_date"] != current_date:
            current_date = match["match_date"]
            lines.append(f"## {current_date}")
        winner_prob = max(match["team_a_win_prob_90m"], match["draw_prob_90m"], match["team_b_win_prob_90m"]) * 100.0
        lines.append(
            f"- Grupo {match['group']}: {match['team_a']} vs {match['team_b']} | "
            f"score esperado {match['team_a_predicted_goals']:.2f}-{match['team_b_predicted_goals']:.2f} | "
            f"ganador probable {match['predicted_winner']} | confianza {match['confidence_level']} | "
            f"señal principal {winner_prob:.1f}%."
        )
    return "\n".join(lines)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(SIMULATION_SEED)
    state = build_initial_state()
    match_predictions: list[dict] = []
    match_simulations: list[dict] = []
    fixture_drivers: list[dict] = []

    for match_date, match_id, group, team_a, team_b in FUTURE_FIXTURES:
        match_summary, rows = simulate_match(team_a, team_b, match_id, match_date, group, state, rng)
        match_simulations.append(match_summary)
        team_rows = [row for row in rows if "predicted_goals" in row]
        driver_rows = [row for row in rows if row.get("target")]
        match_predictions.extend(team_rows)
        fixture_drivers.extend(driver_rows)

    team_profiles = build_team_profiles(state)
    analysis_report = build_report(match_simulations)
    bundle = {
        "sourceLabel": "Mundial 2026 | fase de grupos restante",
        "createdAt": datetime(2026, 6, 19, 10, 15, 0).isoformat(),
        "modelSummary": {
            "model_name": "world-cup-live-form-poisson",
            "model_type": "rating-form-poisson",
            "notes": [
                "Usa ranking FIFA de junio 2026 como fuerza base.",
                "Ajusta por puntos y goles del torneo ya jugados hasta el 18 de junio de 2026.",
                "Las metricas de corners, tarjetas, offsides y shots son derivadas heuristicas a partir del perfil del cruce.",
            ],
            "metadata": {
                "available_targets": ["goals", "corners", "yellow_cards", "red_cards", "offsides", "shots"],
                "simulations": SIMULATIONS,
                "simulation_seed": SIMULATION_SEED,
                "cutoff_date": "2026-06-19",
                "played_matches_in_cutoff": len(PAST_RESULTS),
                "predicted_matches_remaining_in_groups": len(FUTURE_FIXTURES),
            },
        },
        "matchPredictions": match_predictions,
        "matchSimulations": match_simulations,
        "teamProfiles": team_profiles,
        "fixtureDrivers": fixture_drivers,
        "playerPredictions": [],
        "analysisReport": analysis_report,
    }

    live_bundle_path = OUTPUT_DIR / LIVE_BUNDLE_NAME
    live_report_path = OUTPUT_DIR / LIVE_REPORT_NAME
    demo_bundle_path = OUTPUT_DIR / "demo_bundle.json"
    with live_bundle_path.open("w", encoding="utf-8") as handle:
        json.dump(bundle, handle, indent=2, ensure_ascii=False)
    with demo_bundle_path.open("w", encoding="utf-8") as handle:
        json.dump(bundle, handle, indent=2, ensure_ascii=False)
    live_report_path.write_text(analysis_report, encoding="utf-8")
    print(f"Bundle actualizado en {live_bundle_path}")


if __name__ == "__main__":
    main()
