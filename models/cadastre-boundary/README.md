# Cadastre Boundary CV Adapter

Coloca aqui el modelo entrenado como `model.onnx`.

El endpoint `/api/cadastre/segment` revisa esta carpeta:

- Si existe `model.onnx`, reporta `cv-model-ready`.
- Si no existe, usa el fallback geometrico orientado por soporte territorial.

El modelo esperado debe segmentar linderos prediales visibles usando ortofoto o imagen satelital local, con apoyo opcional de catastro, vias, rios, quebradas, acequias, cerramientos y cercas vivas.

El resultado debe ser un poligono GeoJSON candidato, un puntaje de confianza y banderas de calidad para revision tecnica.
