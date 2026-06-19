# World Cup Predictor

Modelo predictivo reproducible para proyectar partidos del Mundial con `pandas` y `numpy`, sin depender de `scikit-learn`.

## Que estima

- Goles por equipo.
- Probabilidad de ganar, empatar o perder en 90 minutos.
- Ganador proyectado.
- Corners por equipo.
- Tarjetas amarillas y rojas por equipo.
- Fueras de juego por equipo.
- Remates de equipo.
- Remates esperados por jugador, si se entrega un CSV de estadisticas individuales.

## Enfoque

El modelo trabaja con una fila por equipo-partido y arma variables previas al encuentro:

- Forma reciente del equipo y del rival.
- Promedios historicos a favor y en contra.
- Descanso entre partidos.
- Ranking relativo, si el CSV lo incluye.
- Etapa del torneo.
- Diferenciales recientes de gol, remates, corners y disciplina.
- Conversion reciente de goles por remate, cuando existe la variable `shots`.

Sobre esas variables entrena un `ridge regression` independiente por objetivo. Para el ganador usa las predicciones de goles y una capa Poisson para estimar `win/draw/loss` en 90 minutos.

Ademas genera:

- Simulacion Monte Carlo por partido.
- Perfiles dinamicos por seleccion.
- Factores explicativos por objetivo y por fixture.
- Reporte Markdown de lectura rapida.

## Archivos esperados

### 1. `matches.csv`

Una fila por equipo y partido historico.

Columnas minimas:

- `match_id`
- `match_date`
- `team`
- `opponent`
- `stage`
- `goals`
- `opponent_goals`
- `corners`
- `opponent_corners`
- `yellow_cards`
- `opponent_yellow_cards`
- `red_cards`
- `opponent_red_cards`
- `offsides`
- `opponent_offsides`

Columnas opcionales:

- `shots`
- `opponent_shots`
- `team_rank`
- `opponent_rank`
- `competition`

### 2. `fixtures.csv`

Mismo formato basico, pero solo con los partidos futuros a proyectar:

- `match_id`
- `match_date`
- `team`
- `opponent`
- `stage`
- `team_rank` opcional
- `opponent_rank` opcional

### 3. `player_match_stats.csv`

Opcional. Sirve para distribuir los remates del equipo entre jugadores.

- `match_id`
- `match_date`
- `team`
- `player_id`
- `player_name`
- `minutes_played`
- `shots`

## Plantillas

En `templates/` tienes CSV base para rellenar.

## Ejecucion

```powershell
python .\models\world-cup-predictor\predict_world_cup.py `
  --matches .\models\world-cup-predictor\templates\matches_template.csv `
  --fixtures .\models\world-cup-predictor\templates\fixtures_template.csv `
  --player-stats .\models\world-cup-predictor\templates\player_match_stats_template.csv `
  --simulations 4000 `
  --outdir .\tmp\world-cup-predictions
```

## Salidas

- `match_predictions.csv`
- `match_simulations.csv`
- `team_profiles.csv`
- `fixture_drivers.csv`
- `analysis_report.md`
- `player_predictions.csv` si se entrego archivo de jugadores y existe el objetivo `shots`
- `model_summary.json`

## Como leer las nuevas salidas

- `match_predictions.csv`: prediccion por equipo-partido, incluyendo goles, ganador y estadisticas de equipo.
- `match_simulations.csv`: resumen probabilistico del cruce con scoreline mas probable, over/under, ambos marcan y percentiles.
- `team_profiles.csv`: radiografia reciente de cada seleccion, con forma, indices de ataque/defensa y presion disciplinaria.
- `fixture_drivers.csv`: factores que mas empujan cada prediccion segun el modelo lineal.
- `analysis_report.md`: narracion corta por partido para revisar rapidamente que esta viendo el modelo.

## Limitaciones importantes

- Este modelo predice mejor si el historico mezcla partidos del Mundial actual con amistosos, eliminatorias y torneos recientes del mismo ciclo.
- Para tarjetas, corners, offsides y remates de jugadores, la calidad del dato manda mucho mas que el algoritmo.
- La salida de `predicted_winner` es una aproximacion; en fase KO conviene complementarla con una capa para tiempo extra y penales.
- Los remates por jugador se reparten segun cuota historica y minutos recientes; sin alineaciones confirmadas no capturan lesiones, rotaciones ni sanciones.
- Si el dataset es muy pequeno, la explicacion de drivers puede quedar dominada por pocas variables como el ranking relativo.

## Siguiente paso recomendado

Conectar una fuente real de datos del Mundial 2026. Para historicos ricos de eventos, el repositorio abierto de StatsBomb es un buen respaldo para mundiales pasados:

- [StatsBomb Open Data](https://github.com/statsbomb/open-data)
