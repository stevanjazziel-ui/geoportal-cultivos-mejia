from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


STAT_COLUMNS = ("goals", "corners", "yellow_cards", "red_cards", "offsides", "shots")
STAGE_BUCKETS = (
    "group",
    "round_of_32",
    "round_of_16",
    "quarterfinal",
    "semifinal",
    "third_place",
    "final",
)
BASE_REQUIRED_COLUMNS = ("match_id", "match_date", "team", "opponent", "stage")
MATCH_REQUIRED_COLUMNS = BASE_REQUIRED_COLUMNS + tuple(
    column for stat in STAT_COLUMNS[:-1] for column in (stat, f"opponent_{stat}")
)
OPTIONAL_MATCH_COLUMNS = ("shots", "opponent_shots", "team_rank", "opponent_rank", "competition")
PLAYER_REQUIRED_COLUMNS = ("match_id", "match_date", "team", "player_id", "player_name", "minutes_played", "shots")
FIXTURE_REQUIRED_COLUMNS = BASE_REQUIRED_COLUMNS
DEFAULT_ALPHA = 4.0
DEFAULT_SIMULATIONS = 4000
DEFAULT_SIMULATION_SEED = 42
DEFAULT_EXPLAIN_TOP = 5


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Entrena un modelo predictivo portable para partidos del Mundial y genera "
            "pronosticos, simulaciones y explicaciones de goles, ganador, corners, "
            "tarjetas, fueras de juego y remates."
        )
    )
    parser.add_argument("--matches", required=True, help="CSV historico en formato largo, una fila por equipo-partido.")
    parser.add_argument("--fixtures", required=True, help="CSV de partidos a pronosticar en formato largo.")
    parser.add_argument("--player-stats", help="CSV opcional de estadisticas por jugador para remates.")
    parser.add_argument("--outdir", required=True, help="Carpeta de salida para CSV y JSON.")
    parser.add_argument("--recent-window", type=int, default=5, help="Ventana de forma reciente por equipo.")
    parser.add_argument("--ridge-alpha", type=float, default=DEFAULT_ALPHA, help="Regularizacion ridge.")
    parser.add_argument("--top-players", type=int, default=5, help="Cuantos jugadores mostrar por equipo y fixture.")
    parser.add_argument("--simulations", type=int, default=DEFAULT_SIMULATIONS, help="Numero de simulaciones Monte Carlo por partido.")
    parser.add_argument("--simulation-seed", type=int, default=DEFAULT_SIMULATION_SEED, help="Semilla reproducible para las simulaciones.")
    parser.add_argument("--explain-top", type=int, default=DEFAULT_EXPLAIN_TOP, help="Cuantos factores mostrar por objetivo.")
    return parser.parse_args()


def normalize_stage(value: Any) -> str:
    text = str(value or "").strip().lower().replace("-", "_").replace(" ", "_")
    if "group" in text:
        return "group"
    if "32" in text:
        return "round_of_32"
    if "16" in text:
        return "round_of_16"
    if "quarter" in text or "cuarto" in text:
        return "quarterfinal"
    if "semi" in text:
        return "semifinal"
    if "third" in text or "tercer" in text:
        return "third_place"
    if "final" in text:
        return "final"
    return "group"


def ensure_columns(df: pd.DataFrame, columns: tuple[str, ...], label: str) -> None:
    missing = [column for column in columns if column not in df.columns]
    if missing:
        raise ValueError(f"Faltan columnas en {label}: {', '.join(missing)}")


def load_csv(path: str | Path) -> pd.DataFrame:
    return pd.read_csv(path)


def prepare_matches(path: str | Path) -> tuple[pd.DataFrame, list[str]]:
    df = load_csv(path)
    ensure_columns(df, MATCH_REQUIRED_COLUMNS, "matches")
    for column in OPTIONAL_MATCH_COLUMNS:
        if column not in df.columns:
            df[column] = np.nan
    available_stats = [stat for stat in STAT_COLUMNS if stat in df.columns and f"opponent_{stat}" in df.columns]
    if not available_stats:
        raise ValueError("No se encontraron objetivos estadisticos validos en matches.")
    df = df.copy()
    df["match_date"] = pd.to_datetime(df["match_date"], utc=False)
    df["stage_bucket"] = df["stage"].map(normalize_stage)
    numeric_columns = [column for stat in available_stats for column in (stat, f"opponent_{stat}")]
    numeric_columns.extend(["team_rank", "opponent_rank"])
    for column in numeric_columns:
        df[column] = pd.to_numeric(df[column], errors="coerce")
    return df.sort_values(["match_date", "match_id", "team"]).reset_index(drop=True), available_stats


def prepare_fixtures(path: str | Path) -> pd.DataFrame:
    df = load_csv(path)
    ensure_columns(df, FIXTURE_REQUIRED_COLUMNS, "fixtures")
    for column in ("team_rank", "opponent_rank"):
        if column not in df.columns:
            df[column] = np.nan
    df = df.copy()
    df["match_date"] = pd.to_datetime(df["match_date"], utc=False)
    df["stage_bucket"] = df["stage"].map(normalize_stage)
    for column in ("team_rank", "opponent_rank"):
        df[column] = pd.to_numeric(df[column], errors="coerce")
    return df.sort_values(["match_date", "match_id", "team"]).reset_index(drop=True)


def prepare_player_stats(path: str | Path) -> pd.DataFrame:
    df = load_csv(path)
    ensure_columns(df, PLAYER_REQUIRED_COLUMNS, "player_stats")
    df = df.copy()
    df["match_date"] = pd.to_datetime(df["match_date"], utc=False)
    for column in ("minutes_played", "shots"):
        df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0.0)
    return df.sort_values(["match_date", "match_id", "team", "player_name"]).reset_index(drop=True)


def mean_last(values: list[float], window: int, fallback: float) -> float:
    if not values:
        return float(fallback)
    subset = values[-window:] if window > 0 else values
    return float(np.mean(subset))


def safe_ratio(numerator: float, denominator: float, fallback: float = 0.0) -> float:
    if denominator == 0:
        return fallback
    return numerator / denominator


def derived_feature_names(available_stats: list[str]) -> list[str]:
    names = ["recent_points_gap", "days_rest_gap"]
    if "goals" in available_stats:
        names.extend(["team_recent_goal_diff", "opponent_recent_goal_diff"])
    if "shots" in available_stats:
        names.extend(
            [
                "team_recent_shot_diff",
                "opponent_recent_shot_diff",
                "team_recent_conversion",
                "opponent_recent_conversion",
            ]
        )
    if "corners" in available_stats:
        names.extend(["team_recent_corner_diff", "opponent_recent_corner_diff"])
    if "yellow_cards" in available_stats or "red_cards" in available_stats:
        names.extend(["team_recent_discipline_pressure", "opponent_recent_discipline_pressure"])
    if "offsides" in available_stats:
        names.extend(["team_recent_offside_pressure", "opponent_recent_offside_pressure"])
    return names


def build_empty_history(available_stats: list[str]) -> dict[str, Any]:
    return {
        "matches": 0,
        "dates": [],
        "points": [],
        "for": {stat: [] for stat in available_stats},
        "against": {stat: [] for stat in available_stats},
    }


def default_numeric_features(global_means: dict[str, float], available_stats: list[str]) -> dict[str, float]:
    features = {
        "team_matches_before": 0.0,
        "opponent_matches_before": 0.0,
        "team_recent_points_5": 1.0,
        "opponent_recent_points_5": 1.0,
        "team_days_rest": 5.0,
        "opponent_days_rest": 5.0,
        "rank_gap": 0.0,
        "recent_points_gap": 0.0,
        "days_rest_gap": 0.0,
    }
    for stat, mean_value in global_means.items():
        features[f"team_recent_{stat}_for"] = mean_value
        features[f"team_recent_{stat}_against"] = mean_value
        features[f"opponent_recent_{stat}_for"] = mean_value
        features[f"opponent_recent_{stat}_against"] = mean_value
        features[f"team_career_{stat}_for"] = mean_value
        features[f"team_career_{stat}_against"] = mean_value
        features[f"opponent_career_{stat}_for"] = mean_value
        features[f"opponent_career_{stat}_against"] = mean_value
    goal_mean = global_means.get("goals", 1.0)
    shot_mean = max(global_means.get("shots", 1.0), 1.0)
    for name in derived_feature_names(available_stats):
        if name.endswith("conversion"):
            features[name] = safe_ratio(goal_mean, shot_mean, fallback=0.1)
        else:
            features[name] = 0.0
    for bucket in STAGE_BUCKETS[1:]:
        features[f"stage_{bucket}"] = 0.0
    return features


def build_feature_row(
    team_row: pd.Series,
    team_history: dict[str, Any],
    opponent_history: dict[str, Any],
    available_stats: list[str],
    global_means: dict[str, float],
    recent_window: int,
) -> dict[str, Any]:
    features: dict[str, Any] = {
        "match_id": team_row["match_id"],
        "match_date": team_row["match_date"],
        "team": team_row["team"],
        "opponent": team_row["opponent"],
        "stage_bucket": team_row["stage_bucket"],
        "team_rank": team_row.get("team_rank"),
        "opponent_rank": team_row.get("opponent_rank"),
        "team_matches_before": float(team_history["matches"]),
        "opponent_matches_before": float(opponent_history["matches"]),
        "team_recent_points_5": mean_last(team_history["points"], recent_window, 1.0),
        "opponent_recent_points_5": mean_last(opponent_history["points"], recent_window, 1.0),
    }
    for history, prefix in ((team_history, "team"), (opponent_history, "opponent")):
        last_date = history["dates"][-1] if history["dates"] else None
        if last_date is None:
            features[f"{prefix}_days_rest"] = 5.0
        else:
            delta_days = max((team_row["match_date"] - last_date).days, 0)
            features[f"{prefix}_days_rest"] = float(delta_days)
    if pd.notna(team_row.get("team_rank")) and pd.notna(team_row.get("opponent_rank")):
        features["rank_gap"] = float(team_row["opponent_rank"] - team_row["team_rank"])
    else:
        features["rank_gap"] = 0.0
    for stat in available_stats:
        mean_value = global_means[stat]
        features[f"team_recent_{stat}_for"] = mean_last(team_history["for"][stat], recent_window, mean_value)
        features[f"team_recent_{stat}_against"] = mean_last(team_history["against"][stat], recent_window, mean_value)
        features[f"opponent_recent_{stat}_for"] = mean_last(opponent_history["for"][stat], recent_window, mean_value)
        features[f"opponent_recent_{stat}_against"] = mean_last(opponent_history["against"][stat], recent_window, mean_value)
        features[f"team_career_{stat}_for"] = mean_last(team_history["for"][stat], 0, mean_value)
        features[f"team_career_{stat}_against"] = mean_last(team_history["against"][stat], 0, mean_value)
        features[f"opponent_career_{stat}_for"] = mean_last(opponent_history["for"][stat], 0, mean_value)
        features[f"opponent_career_{stat}_against"] = mean_last(opponent_history["against"][stat], 0, mean_value)
        if stat in team_row.index:
            features[stat] = float(team_row[stat])
    features["recent_points_gap"] = features["team_recent_points_5"] - features["opponent_recent_points_5"]
    features["days_rest_gap"] = features["team_days_rest"] - features["opponent_days_rest"]
    if "goals" in available_stats:
        features["team_recent_goal_diff"] = features["team_recent_goals_for"] - features["team_recent_goals_against"]
        features["opponent_recent_goal_diff"] = features["opponent_recent_goals_for"] - features["opponent_recent_goals_against"]
    if "shots" in available_stats:
        global_conversion = safe_ratio(global_means.get("goals", 1.0), max(global_means.get("shots", 1.0), 1.0), fallback=0.1)
        features["team_recent_shot_diff"] = features["team_recent_shots_for"] - features["team_recent_shots_against"]
        features["opponent_recent_shot_diff"] = features["opponent_recent_shots_for"] - features["opponent_recent_shots_against"]
        features["team_recent_conversion"] = safe_ratio(
            features.get("team_recent_goals_for", global_means.get("goals", 1.0)),
            max(features["team_recent_shots_for"], 0.1),
            fallback=global_conversion,
        )
        features["opponent_recent_conversion"] = safe_ratio(
            features.get("opponent_recent_goals_for", global_means.get("goals", 1.0)),
            max(features["opponent_recent_shots_for"], 0.1),
            fallback=global_conversion,
        )
    if "corners" in available_stats:
        features["team_recent_corner_diff"] = features["team_recent_corners_for"] - features["team_recent_corners_against"]
        features["opponent_recent_corner_diff"] = features["opponent_recent_corners_for"] - features["opponent_recent_corners_against"]
    if "yellow_cards" in available_stats or "red_cards" in available_stats:
        team_yellows = features.get("team_recent_yellow_cards_for", global_means.get("yellow_cards", 0.0))
        opponent_yellows = features.get("opponent_recent_yellow_cards_for", global_means.get("yellow_cards", 0.0))
        team_reds = features.get("team_recent_red_cards_for", global_means.get("red_cards", 0.0))
        opponent_reds = features.get("opponent_recent_red_cards_for", global_means.get("red_cards", 0.0))
        features["team_recent_discipline_pressure"] = team_yellows + (2.0 * team_reds)
        features["opponent_recent_discipline_pressure"] = opponent_yellows + (2.0 * opponent_reds)
    if "offsides" in available_stats:
        features["team_recent_offside_pressure"] = features["team_recent_offsides_for"] - features["team_recent_offsides_against"]
        features["opponent_recent_offside_pressure"] = features["opponent_recent_offsides_for"] - features["opponent_recent_offsides_against"]
    for bucket in STAGE_BUCKETS[1:]:
        features[f"stage_{bucket}"] = 1.0 if team_row["stage_bucket"] == bucket else 0.0
    return features


def update_history(history: dict[str, Any], row: pd.Series, available_stats: list[str]) -> None:
    history["matches"] += 1
    history["dates"].append(row["match_date"])
    goals = float(row["goals"])
    opponent_goals = float(row["opponent_goals"])
    if goals > opponent_goals:
        points = 3.0
    elif goals == opponent_goals:
        points = 1.0
    else:
        points = 0.0
    history["points"].append(points)
    for stat in available_stats:
        history["for"][stat].append(float(row[stat]))
        history["against"][stat].append(float(row[f"opponent_{stat}"]))


def build_training_frame(
    matches: pd.DataFrame,
    available_stats: list[str],
    recent_window: int,
) -> tuple[pd.DataFrame, dict[str, Any], dict[str, float]]:
    global_means = {stat: float(matches[stat].mean()) for stat in available_stats}
    histories: dict[str, Any] = {}
    feature_rows: list[dict[str, Any]] = []
    for _, match_rows in matches.groupby("match_id", sort=False):
        pending_rows = []
        for _, row in match_rows.iterrows():
            team_name = str(row["team"])
            opponent_name = str(row["opponent"])
            team_history = histories.setdefault(team_name, build_empty_history(available_stats))
            opponent_history = histories.setdefault(opponent_name, build_empty_history(available_stats))
            feature_rows.append(
                build_feature_row(row, team_history, opponent_history, available_stats, global_means, recent_window)
            )
            pending_rows.append((team_name, row))
        for team_name, row in pending_rows:
            update_history(histories[team_name], row, available_stats)
    return pd.DataFrame(feature_rows), histories, global_means


def numeric_feature_columns(target: str, available_stats: list[str]) -> list[str]:
    columns = [
        "team_matches_before",
        "opponent_matches_before",
        "team_recent_points_5",
        "opponent_recent_points_5",
        "team_days_rest",
        "opponent_days_rest",
        "rank_gap",
        "recent_points_gap",
        "days_rest_gap",
    ]
    stat_candidates = [target]
    if target != "goals" and "goals" in available_stats:
        stat_candidates.append("goals")
    if target != "shots" and "shots" in available_stats:
        stat_candidates.append("shots")
    for stat in stat_candidates:
        columns.extend(
            [
                f"team_recent_{stat}_for",
                f"team_recent_{stat}_against",
                f"opponent_recent_{stat}_for",
                f"opponent_recent_{stat}_against",
                f"team_career_{stat}_for",
                f"team_career_{stat}_against",
                f"opponent_career_{stat}_for",
                f"opponent_career_{stat}_against",
            ]
        )
    columns.extend(derived_feature_names(available_stats))
    columns.extend(f"stage_{bucket}" for bucket in STAGE_BUCKETS[1:])
    return list(dict.fromkeys(columns))


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
    mean = model["mean"]
    std = model["std"]
    coefficients = model["coefficients"]
    X_scaled = (X - mean) / std
    X_design = np.column_stack([np.ones(len(X_scaled)), X_scaled])
    return X_design @ coefficients


def fit_ridge_model(frame: pd.DataFrame, feature_columns: list[str], target: str, alpha: float) -> dict[str, Any]:
    frame = frame.dropna(subset=[target]).copy()
    frame = frame.sort_values(["match_date", "match_id", "team"]).reset_index(drop=True)
    X = frame[feature_columns].fillna(0.0).to_numpy(dtype=float)
    y = frame[target].to_numpy(dtype=float)
    if len(frame) < 4:
        raise ValueError(f"No hay suficientes filas para entrenar el objetivo {target}.")
    split_index = max(int(len(frame) * 0.8), len(frame) - 1)
    if split_index <= 1:
        split_index = len(frame) - 1
    train_X, test_X = X[:split_index], X[split_index:]
    train_y, test_y = y[:split_index], y[split_index:]
    holdout_model = fit_ridge_closed_form(train_X, train_y, alpha)
    if len(test_y):
        test_pred = predict_ridge(holdout_model, test_X)
        mae = float(np.mean(np.abs(test_y - test_pred)))
        rmse = float(np.sqrt(np.mean((test_y - test_pred) ** 2)))
    else:
        mae = 0.0
        rmse = 0.0
    final_model = fit_ridge_closed_form(X, y, alpha)
    final_model["feature_columns"] = feature_columns
    final_model["target"] = target
    final_model["holdout_rows"] = int(len(test_y))
    final_model["train_rows"] = int(len(train_y))
    final_model["mae"] = mae
    final_model["rmse"] = rmse
    final_model["mean_target"] = float(np.mean(y))
    return final_model


def build_fixture_feature_frame(
    fixtures: pd.DataFrame,
    histories: dict[str, Any],
    available_stats: list[str],
    global_means: dict[str, float],
    recent_window: int,
) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for _, fixture_row in fixtures.iterrows():
        team_name = str(fixture_row["team"])
        opponent_name = str(fixture_row["opponent"])
        team_history = histories.get(team_name, build_empty_history(available_stats))
        opponent_history = histories.get(opponent_name, build_empty_history(available_stats))
        rows.append(
            build_feature_row(
                fixture_row,
                team_history,
                opponent_history,
                available_stats,
                global_means,
                recent_window,
            )
        )
    if not rows:
        return pd.DataFrame([default_numeric_features(global_means, available_stats)])
    return pd.DataFrame(rows)


def poisson_distribution(lam: float, max_goals: int = 10) -> list[float]:
    lam = max(lam, 0.01)
    values = [math.exp(-lam)]
    for k in range(1, max_goals):
        values.append(values[-1] * lam / k)
    tail = max(0.0, 1.0 - float(sum(values)))
    values.append(tail)
    return values


def poisson_outcome_probabilities(team_lambda: float, opponent_lambda: float, max_goals: int = 10) -> tuple[float, float, float]:
    team_probs = poisson_distribution(team_lambda, max_goals=max_goals)
    opponent_probs = poisson_distribution(opponent_lambda, max_goals=max_goals)
    team_win = 0.0
    draw = 0.0
    opponent_win = 0.0
    for team_goals, team_prob in enumerate(team_probs):
        for opponent_goals, opponent_prob in enumerate(opponent_probs):
            joint = team_prob * opponent_prob
            if team_goals > opponent_goals:
                team_win += joint
            elif team_goals == opponent_goals:
                draw += joint
            else:
                opponent_win += joint
    total = team_win + draw + opponent_win
    if total == 0:
        return 0.33, 0.34, 0.33
    return team_win / total, draw / total, opponent_win / total


def build_match_prediction_table(
    fixture_features: pd.DataFrame,
    models: dict[str, dict[str, Any]],
    available_stats: list[str],
) -> pd.DataFrame:
    predictions = fixture_features[["match_id", "match_date", "team", "opponent", "stage_bucket"]].copy()
    for target, model in models.items():
        X = fixture_features[model["feature_columns"]].fillna(0.0).to_numpy(dtype=float)
        raw_pred = predict_ridge(model, X)
        floor = 0.02 if target == "red_cards" else 0.1
        predictions[f"predicted_{target}"] = np.clip(raw_pred, floor, None)
    predictions["predicted_goals"] = predictions["predicted_goals"].round(2)
    opponent_lookup = (
        predictions[["match_id", "team", "predicted_goals"]]
        .rename(columns={"team": "opponent", "predicted_goals": "predicted_opponent_goals"})
    )
    merged = predictions.merge(opponent_lookup, on=["match_id", "opponent"], how="left")
    team_wins: list[float] = []
    draws: list[float] = []
    opponent_wins: list[float] = []
    result_labels: list[str] = []
    winners: list[str] = []
    for _, row in merged.iterrows():
        opponent_goals = float(row["predicted_opponent_goals"]) if pd.notna(row["predicted_opponent_goals"]) else 1.0
        win_prob, draw_prob, lose_prob = poisson_outcome_probabilities(float(row["predicted_goals"]), opponent_goals)
        team_wins.append(round(win_prob, 4))
        draws.append(round(draw_prob, 4))
        opponent_wins.append(round(lose_prob, 4))
        if win_prob >= draw_prob and win_prob >= lose_prob:
            result_labels.append(str(row["team"]))
        elif draw_prob >= win_prob and draw_prob >= lose_prob:
            result_labels.append("Draw")
        else:
            result_labels.append(str(row["opponent"]))
        winners.append(str(row["team"]) if win_prob + (draw_prob * 0.5) >= 0.5 else str(row["opponent"]))
    merged["win_prob_90m"] = team_wins
    merged["draw_prob_90m"] = draws
    merged["loss_prob_90m"] = opponent_wins
    merged["predicted_result_90m"] = result_labels
    merged["predicted_winner"] = winners
    ordered_columns = [
        "match_id",
        "match_date",
        "team",
        "opponent",
        "stage_bucket",
        "predicted_goals",
        "predicted_opponent_goals",
        "win_prob_90m",
        "draw_prob_90m",
        "loss_prob_90m",
        "predicted_result_90m",
        "predicted_winner",
    ]
    ordered_columns.extend(f"predicted_{target}" for target in available_stats if target != "goals")
    return merged[ordered_columns].sort_values(["match_date", "match_id", "team"]).reset_index(drop=True)


def build_team_profile_table(
    histories: dict[str, Any],
    available_stats: list[str],
    global_means: dict[str, float],
    recent_window: int,
) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for team_name, history in histories.items():
        row: dict[str, Any] = {
            "team": team_name,
            "matches_played": int(history["matches"]),
            "recent_points_5": round(mean_last(history["points"], recent_window, 1.0), 3),
        }
        if "goals" in available_stats:
            recent_goals_for = mean_last(history["for"]["goals"], recent_window, global_means["goals"])
            recent_goals_against = mean_last(history["against"]["goals"], recent_window, global_means["goals"])
            row["recent_goals_for"] = round(recent_goals_for, 3)
            row["recent_goals_against"] = round(recent_goals_against, 3)
            row["recent_goal_diff"] = round(recent_goals_for - recent_goals_against, 3)
            row["attack_index"] = round(safe_ratio(recent_goals_for, max(global_means["goals"], 0.1), fallback=1.0), 3)
            row["defense_index"] = round(safe_ratio(recent_goals_against, max(global_means["goals"], 0.1), fallback=1.0), 3)
        if "shots" in available_stats:
            recent_shots_for = mean_last(history["for"]["shots"], recent_window, global_means["shots"])
            recent_shots_against = mean_last(history["against"]["shots"], recent_window, global_means["shots"])
            row["recent_shots_for"] = round(recent_shots_for, 3)
            row["recent_shots_against"] = round(recent_shots_against, 3)
            row["recent_shot_diff"] = round(recent_shots_for - recent_shots_against, 3)
            row["goal_conversion"] = round(
                safe_ratio(row.get("recent_goals_for", global_means.get("goals", 1.0)), max(recent_shots_for, 0.1), fallback=0.1),
                3,
            )
        if "corners" in available_stats:
            row["recent_corners_for"] = round(mean_last(history["for"]["corners"], recent_window, global_means["corners"]), 3)
        if "yellow_cards" in available_stats or "red_cards" in available_stats:
            yellows = mean_last(history["for"].get("yellow_cards", []), recent_window, global_means.get("yellow_cards", 0.0))
            reds = mean_last(history["for"].get("red_cards", []), recent_window, global_means.get("red_cards", 0.0))
            row["discipline_pressure"] = round(yellows + (2.0 * reds), 3)
        form_score = row.get("recent_points_5", 1.0)
        form_score += row.get("recent_goal_diff", 0.0) * 0.45
        form_score += row.get("recent_shot_diff", 0.0) * 0.08
        form_score -= row.get("discipline_pressure", 0.0) * 0.05
        row["form_score"] = round(form_score, 3)
        rows.append(row)
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows).sort_values(["form_score", "recent_points_5", "team"], ascending=[False, False, True]).reset_index(drop=True)


def build_driver_table(
    fixture_features: pd.DataFrame,
    models: dict[str, dict[str, Any]],
    top_k: int,
) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for target, model in models.items():
        feature_columns = model["feature_columns"]
        X = fixture_features[feature_columns].fillna(0.0).to_numpy(dtype=float)
        mean = model["mean"]
        std = model["std"]
        coefficients = model["coefficients"][1:]
        X_scaled = (X - mean) / std
        contributions = X_scaled * coefficients
        predictions = predict_ridge(model, X)
        for row_idx, (_, fixture_row) in enumerate(fixture_features.iterrows()):
            contribution_row = contributions[row_idx]
            nonzero_order = np.where(np.abs(contribution_row) > 1e-6)[0]
            if not len(nonzero_order):
                continue
            order = nonzero_order[np.argsort(np.abs(contribution_row[nonzero_order]))[::-1][:top_k]]
            for rank, feature_idx in enumerate(order, start=1):
                feature_name = feature_columns[feature_idx]
                rows.append(
                    {
                        "match_id": fixture_row["match_id"],
                        "match_date": fixture_row["match_date"],
                        "team": fixture_row["team"],
                        "opponent": fixture_row["opponent"],
                        "target": target,
                        "rank": rank,
                        "feature": feature_name,
                        "feature_value": round(float(X[row_idx, feature_idx]), 4),
                        "contribution": round(float(contributions[row_idx, feature_idx]), 4),
                        "direction": "up" if contributions[row_idx, feature_idx] >= 0 else "down",
                        "predicted_value_raw": round(float(predictions[row_idx]), 4),
                    }
                )
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows).sort_values(["match_date", "match_id", "team", "target", "rank"]).reset_index(drop=True)


def confidence_level(team_win_prob: float, draw_prob: float, opponent_win_prob: float) -> str:
    ordered = sorted([team_win_prob, draw_prob, opponent_win_prob], reverse=True)
    gap = ordered[0] - ordered[1]
    if ordered[0] >= 0.58 and gap >= 0.16:
        return "high"
    if ordered[0] >= 0.46 and gap >= 0.08:
        return "medium"
    return "low"


def format_scoreline_counts(team_samples: np.ndarray, opponent_samples: np.ndarray, top_n: int = 3) -> tuple[str, float]:
    scoreline_counts = pd.Series([f"{int(team)}-{int(opponent)}" for team, opponent in zip(team_samples, opponent_samples)]).value_counts(normalize=True)
    top_scoreline = str(scoreline_counts.index[0])
    top_scoreline_prob = float(scoreline_counts.iloc[0])
    return top_scoreline, top_scoreline_prob


def simulate_match_distribution(
    match_predictions: pd.DataFrame,
    available_stats: list[str],
    simulations: int,
    simulation_seed: int,
) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    rng = np.random.default_rng(simulation_seed)
    for match_id, group in match_predictions.groupby("match_id", sort=False):
        if len(group) != 2:
            continue
        group = group.sort_values("team").reset_index(drop=True)
        team_a = group.iloc[0]
        team_b = group.iloc[1]
        team_a_goals = rng.poisson(max(float(team_a["predicted_goals"]), 0.05), simulations)
        team_b_goals = rng.poisson(max(float(team_b["predicted_goals"]), 0.05), simulations)
        top_scoreline, top_scoreline_prob = format_scoreline_counts(team_a_goals, team_b_goals)
        row: dict[str, Any] = {
            "match_id": match_id,
            "match_date": team_a["match_date"],
            "stage_bucket": team_a["stage_bucket"],
            "team_a": team_a["team"],
            "team_b": team_b["team"],
            "team_a_predicted_goals": round(float(team_a["predicted_goals"]), 3),
            "team_b_predicted_goals": round(float(team_b["predicted_goals"]), 3),
            "team_a_win_prob_90m": round(float(np.mean(team_a_goals > team_b_goals)), 4),
            "draw_prob_90m": round(float(np.mean(team_a_goals == team_b_goals)), 4),
            "team_b_win_prob_90m": round(float(np.mean(team_b_goals > team_a_goals)), 4),
            "over_2_5_prob": round(float(np.mean((team_a_goals + team_b_goals) >= 3)), 4),
            "over_3_5_prob": round(float(np.mean((team_a_goals + team_b_goals) >= 4)), 4),
            "btts_prob": round(float(np.mean((team_a_goals > 0) & (team_b_goals > 0))), 4),
            "team_a_clean_sheet_prob": round(float(np.mean(team_b_goals == 0)), 4),
            "team_b_clean_sheet_prob": round(float(np.mean(team_a_goals == 0)), 4),
            "team_a_goals_p10": int(np.quantile(team_a_goals, 0.10)),
            "team_a_goals_p50": int(np.quantile(team_a_goals, 0.50)),
            "team_a_goals_p90": int(np.quantile(team_a_goals, 0.90)),
            "team_b_goals_p10": int(np.quantile(team_b_goals, 0.10)),
            "team_b_goals_p50": int(np.quantile(team_b_goals, 0.50)),
            "team_b_goals_p90": int(np.quantile(team_b_goals, 0.90)),
            "top_scoreline": top_scoreline,
            "top_scoreline_prob": round(top_scoreline_prob, 4),
        }
        row["confidence_level"] = confidence_level(row["team_a_win_prob_90m"], row["draw_prob_90m"], row["team_b_win_prob_90m"])
        for stat in available_stats:
            if stat == "goals":
                continue
            team_a_samples = rng.poisson(max(float(team_a[f"predicted_{stat}"]), 0.05), simulations)
            team_b_samples = rng.poisson(max(float(team_b[f"predicted_{stat}"]), 0.05), simulations)
            row[f"team_a_{stat}_p50"] = int(np.quantile(team_a_samples, 0.50))
            row[f"team_b_{stat}_p50"] = int(np.quantile(team_b_samples, 0.50))
            row[f"total_{stat}_p90"] = int(np.quantile(team_a_samples + team_b_samples, 0.90))
        rows.append(row)
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows).sort_values(["match_date", "match_id"]).reset_index(drop=True)


def format_percent(value: float) -> str:
    return f"{value * 100:.1f}%"


def format_driver_line(driver_rows: pd.DataFrame) -> str:
    parts = []
    for _, row in driver_rows.iterrows():
        arrow = "+" if row["contribution"] >= 0 else "-"
        parts.append(f"{row['feature']} ({arrow}{abs(float(row['contribution'])):.2f})")
    return "; ".join(parts)


def format_optional_prediction(team_row: pd.Series, column: str) -> str:
    if column not in team_row.index or pd.isna(team_row[column]):
        return "n/d"
    return f"{float(team_row[column]):.2f}"


def build_analysis_markdown(
    match_predictions: pd.DataFrame,
    match_simulations: pd.DataFrame,
    team_profiles: pd.DataFrame,
    driver_table: pd.DataFrame,
    available_stats: list[str],
    simulations: int,
) -> str:
    lines = [
        "# Analisis Predictivo del Mundial",
        "",
        "Este reporte resume el cruce, la forma reciente y los factores que mas empujan cada pronostico.",
        "",
    ]
    team_profile_lookup = team_profiles.set_index("team") if not team_profiles.empty else None
    simulation_lookup = match_simulations.set_index("match_id") if not match_simulations.empty else None
    for match_id, group in match_predictions.groupby("match_id", sort=False):
        if len(group) != 2:
            continue
        group = group.sort_values("team").reset_index(drop=True)
        team_a = group.iloc[0]
        team_b = group.iloc[1]
        sim_row = simulation_lookup.loc[match_id] if simulation_lookup is not None and match_id in simulation_lookup.index else None
        lines.extend(
            [
                f"## {team_a['team']} vs {team_b['team']}",
                "",
                f"- Fecha: {pd.to_datetime(team_a['match_date']).date()}",
                f"- Etapa: {team_a['stage_bucket']}",
                f"- Marcador esperado: {team_a['team']} {float(team_a['predicted_goals']):.2f} - {float(team_b['predicted_goals']):.2f} {team_b['team']}",
                f"- Probabilidades en 90 minutos: {team_a['team']} {format_percent(float(team_a['win_prob_90m']))}, empate {format_percent(float(team_a['draw_prob_90m']))}, {team_b['team']} {format_percent(float(team_b['win_prob_90m']))}",
            ]
        )
        if sim_row is not None:
            lines.extend(
                [
                    f"- Simulacion Monte Carlo ({simulations} corridas): over 2.5 {format_percent(float(sim_row['over_2_5_prob']))}, ambos marcan {format_percent(float(sim_row['btts_prob']))}, scoreline mas probable {sim_row['top_scoreline']} ({format_percent(float(sim_row['top_scoreline_prob']))})",
                    f"- Confianza del cruce: {sim_row['confidence_level']}",
                ]
            )
        lines.append("")
        for team_row in (team_a, team_b):
            team_name = str(team_row["team"])
            opponent_name = str(team_row["opponent"])
            lines.append(f"### {team_name}")
            lines.append("")
            if team_profile_lookup is not None and team_name in team_profile_lookup.index:
                profile = team_profile_lookup.loc[team_name]
                profile_parts = [
                    f"forma {float(profile['form_score']):.2f}",
                    f"puntos recientes {float(profile['recent_points_5']):.2f}",
                ]
                if "recent_goal_diff" in profile.index:
                    profile_parts.append(f"diferencia de gol {float(profile['recent_goal_diff']):.2f}")
                if "recent_shot_diff" in profile.index:
                    profile_parts.append(f"diferencia de remates {float(profile['recent_shot_diff']):.2f}")
                lines.append(f"- Perfil reciente: {', '.join(profile_parts)}")
            lines.append(
                f"- Salida esperada: goles {float(team_row['predicted_goals']):.2f}, corners {format_optional_prediction(team_row, 'predicted_corners')}, tarjetas amarillas {format_optional_prediction(team_row, 'predicted_yellow_cards')}, offsides {format_optional_prediction(team_row, 'predicted_offsides')}"
            )
            goal_drivers = driver_table[
                (driver_table["match_id"] == match_id)
                & (driver_table["team"] == team_name)
                & (driver_table["target"] == "goals")
            ]
            if not goal_drivers.empty:
                lines.append(f"- Factores que mueven los goles: {format_driver_line(goal_drivers.head(3))}")
            if "shots" in available_stats:
                shot_drivers = driver_table[
                    (driver_table["match_id"] == match_id)
                    & (driver_table["team"] == team_name)
                    & (driver_table["target"] == "shots")
                ]
                if not shot_drivers.empty:
                    lines.append(f"- Factores que mueven los remates: {format_driver_line(shot_drivers.head(3))}")
            if "yellow_cards" in available_stats:
                card_drivers = driver_table[
                    (driver_table["match_id"] == match_id)
                    & (driver_table["team"] == team_name)
                    & (driver_table["target"] == "yellow_cards")
                ]
                if not card_drivers.empty:
                    lines.append(f"- Factores que mueven la disciplina: {format_driver_line(card_drivers.head(2))}")
            lines.append(f"- Rival analizado: {opponent_name}")
            lines.append("")
    return "\n".join(lines).strip() + "\n"


def build_player_prediction_table(
    player_stats: pd.DataFrame,
    match_predictions: pd.DataFrame,
    top_players: int,
) -> pd.DataFrame:
    if player_stats.empty:
        return pd.DataFrame()
    recent_player_rows = player_stats.sort_values(["match_date", "match_id"]).groupby(["team", "player_id"]).tail(5)
    summaries: list[dict[str, Any]] = []
    for (team_name, player_id), group in recent_player_rows.groupby(["team", "player_id"]):
        group = group.sort_values(["match_date", "match_id"])
        weights = np.linspace(1.0, 2.0, num=len(group))
        minutes = group["minutes_played"].to_numpy(dtype=float)
        shots = group["shots"].to_numpy(dtype=float)
        shots_per_90 = np.average(np.where(minutes > 0, shots * 90.0 / np.maximum(minutes, 1.0), 0.0), weights=weights)
        expected_minutes = float(np.average(minutes, weights=weights))
        recent_matches = int(len(group))
        summaries.append(
            {
                "team": team_name,
                "player_id": player_id,
                "player_name": str(group.iloc[-1]["player_name"]),
                "expected_minutes": expected_minutes,
                "shots_per_90": float(shots_per_90),
                "recent_matches": recent_matches,
            }
        )
    player_profile = pd.DataFrame(summaries)
    if player_profile.empty:
        return player_profile
    rows: list[dict[str, Any]] = []
    for _, fixture in match_predictions.iterrows():
        team_name = fixture["team"]
        predicted_team_shots = float(fixture["predicted_shots"])
        team_players = player_profile[player_profile["team"] == team_name].copy()
        if team_players.empty:
            continue
        team_players["raw_shot_score"] = team_players["shots_per_90"] * team_players["expected_minutes"] / 90.0
        total_score = float(team_players["raw_shot_score"].sum())
        if total_score <= 0:
            continue
        team_players["predicted_share"] = team_players["raw_shot_score"] / total_score
        team_players["predicted_player_shots"] = team_players["predicted_share"] * predicted_team_shots
        team_players = team_players.sort_values(
            ["predicted_player_shots", "expected_minutes", "recent_matches"], ascending=[False, False, False]
        ).head(top_players)
        for _, player_row in team_players.iterrows():
            rows.append(
                {
                    "match_id": fixture["match_id"],
                    "match_date": fixture["match_date"],
                    "team": team_name,
                    "opponent": fixture["opponent"],
                    "player_id": player_row["player_id"],
                    "player_name": player_row["player_name"],
                    "expected_minutes": round(float(player_row["expected_minutes"]), 1),
                    "predicted_player_shots": round(float(player_row["predicted_player_shots"]), 2),
                    "predicted_share": round(float(player_row["predicted_share"]), 4),
                    "recent_matches": int(player_row["recent_matches"]),
                }
            )
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows).sort_values(
        ["match_date", "match_id", "team", "predicted_player_shots"],
        ascending=[True, True, True, False],
    ).reset_index(drop=True)


def save_outputs(
    outdir: Path,
    match_predictions: pd.DataFrame,
    match_simulations: pd.DataFrame,
    team_profiles: pd.DataFrame,
    driver_table: pd.DataFrame,
    analysis_markdown: str,
    player_predictions: pd.DataFrame,
    models: dict[str, dict[str, Any]],
    metadata: dict[str, Any],
) -> None:
    outdir.mkdir(parents=True, exist_ok=True)
    match_predictions.to_csv(outdir / "match_predictions.csv", index=False)
    match_simulations.to_csv(outdir / "match_simulations.csv", index=False)
    team_profiles.to_csv(outdir / "team_profiles.csv", index=False)
    driver_table.to_csv(outdir / "fixture_drivers.csv", index=False)
    (outdir / "analysis_report.md").write_text(analysis_markdown, encoding="utf-8")
    if not player_predictions.empty:
        player_predictions.to_csv(outdir / "player_predictions.csv", index=False)
    summary = {
        "generated_files": {
            "match_predictions": "match_predictions.csv",
            "match_simulations": "match_simulations.csv",
            "team_profiles": "team_profiles.csv",
            "fixture_drivers": "fixture_drivers.csv",
            "analysis_report": "analysis_report.md",
            "player_predictions": "player_predictions.csv" if not player_predictions.empty else None,
        },
        "model_metrics": {
            target: {
                "train_rows": model["train_rows"],
                "holdout_rows": model["holdout_rows"],
                "mae": round(model["mae"], 4),
                "rmse": round(model["rmse"], 4),
                "mean_target": round(model["mean_target"], 4),
            }
            for target, model in models.items()
        },
        "metadata": metadata,
    }
    (outdir / "model_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")


def main() -> None:
    args = parse_args()
    outdir = Path(args.outdir)
    matches, available_stats = prepare_matches(args.matches)
    fixtures = prepare_fixtures(args.fixtures)
    training_frame, histories, global_means = build_training_frame(matches, available_stats, args.recent_window)
    models: dict[str, dict[str, Any]] = {}
    for target in available_stats:
        feature_columns = numeric_feature_columns(target, available_stats)
        models[target] = fit_ridge_model(training_frame, feature_columns, target, args.ridge_alpha)
    fixture_features = build_fixture_feature_frame(fixtures, histories, available_stats, global_means, args.recent_window)
    match_predictions = build_match_prediction_table(fixture_features, models, available_stats)
    match_simulations = simulate_match_distribution(
        match_predictions,
        available_stats,
        simulations=args.simulations,
        simulation_seed=args.simulation_seed,
    )
    team_profiles = build_team_profile_table(histories, available_stats, global_means, args.recent_window)
    driver_table = build_driver_table(fixture_features, models, args.explain_top)
    analysis_markdown = build_analysis_markdown(
        match_predictions,
        match_simulations,
        team_profiles,
        driver_table,
        available_stats,
        simulations=args.simulations,
    )
    if "predicted_shots" in match_predictions.columns and args.player_stats:
        player_stats = prepare_player_stats(args.player_stats)
        player_predictions = build_player_prediction_table(player_stats, match_predictions, args.top_players)
    else:
        player_predictions = pd.DataFrame()
    metadata = {
        "matches_path": str(args.matches),
        "fixtures_path": str(args.fixtures),
        "player_stats_path": str(args.player_stats) if args.player_stats else None,
        "available_targets": available_stats,
        "recent_window": args.recent_window,
        "ridge_alpha": args.ridge_alpha,
        "simulations": args.simulations,
        "simulation_seed": args.simulation_seed,
        "explain_top": args.explain_top,
        "match_rows": int(len(matches)),
        "fixture_rows": int(len(fixtures)),
    }
    save_outputs(
        outdir,
        match_predictions,
        match_simulations,
        team_profiles,
        driver_table,
        analysis_markdown,
        player_predictions,
        models,
        metadata,
    )
    print(f"Pronosticos guardados en {outdir}")


if __name__ == "__main__":
    main()
