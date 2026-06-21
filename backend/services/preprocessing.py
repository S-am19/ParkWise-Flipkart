import ast
import hashlib
import json
import pickle
from pathlib import Path
from typing import Any

import pandas as pd


EXPECTED_COLUMNS = {
    "latitude",
    "longitude",
    "location",
    "vehicle_type",
    "violation_type",
    "created_datetime",
    "police_station",
    "junction_name",
    "validation_status",
    "device_id",
}


def project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def backend_root() -> Path:
    return Path(__file__).resolve().parents[1]


def cache_dir() -> Path:
    path = backend_root() / "cache"
    path.mkdir(parents=True, exist_ok=True)
    return path


def find_dataset() -> Path:
    search_dirs = [
        backend_root() / "dataset",
        backend_root(),
        project_root(),
    ]
    candidates: list[Path] = []
    for directory in search_dirs:
        if directory.exists():
            candidates.extend(directory.glob("*.csv"))
            candidates.extend(directory.glob("*.CSV"))

    if not candidates:
        raise FileNotFoundError(
            "No CSV dataset found. Place the police violation CSV in backend/dataset/ "
            "or the project root."
        )

    preferred = [
        path
        for path in candidates
        if "police" in path.name.lower() and "violation" in path.name.lower()
    ]
    return sorted(preferred or candidates, key=lambda p: p.stat().st_size, reverse=True)[0]


def dataset_fingerprint(path: Path) -> str:
    stat = path.stat()
    raw = f"{path.resolve()}:{stat.st_size}:{stat.st_mtime_ns}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:16]


def cache_path(name: str, fingerprint: str) -> Path:
    return cache_dir() / f"{name}_{fingerprint}.pkl"


def load_cache(name: str, fingerprint: str) -> Any | None:
    path = cache_path(name, fingerprint)
    if not path.exists():
        return None
    with path.open("rb") as file:
        return pickle.load(file)


def save_cache(name: str, fingerprint: str, value: Any) -> None:
    with cache_path(name, fingerprint).open("wb") as file:
        pickle.dump(value, file, protocol=pickle.HIGHEST_PROTOCOL)


def parse_violation_types(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip().upper() for item in value if str(item).strip()]
    if pd.isna(value):
        return ["UNKNOWN"]

    text = str(value).strip()
    if not text or text.upper() in {"NULL", "NAN", "NONE"}:
        return ["UNKNOWN"]

    parsed: Any
    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, TypeError):
        try:
            parsed = ast.literal_eval(text)
        except (ValueError, SyntaxError):
            parsed = text

    if isinstance(parsed, list):
        result = [str(item).strip().upper() for item in parsed if str(item).strip()]
        return result or ["UNKNOWN"]

    return [str(parsed).strip().upper() or "UNKNOWN"]


def first_violation_type(types: list[str]) -> str:
    return types[0] if types else "UNKNOWN"


def load_raw_dataset(path: Path) -> pd.DataFrame:
    try:
        df = pd.read_csv(path, low_memory=False)
    except UnicodeDecodeError:
        df = pd.read_csv(path, low_memory=False, encoding="latin1")

    df.columns = [str(column).strip() for column in df.columns]
    missing = EXPECTED_COLUMNS - set(df.columns)
    for column in missing:
        df[column] = pd.NA
    return df


def preprocess_dataset() -> tuple[pd.DataFrame, Path, str]:
    dataset_path = find_dataset()
    fingerprint = dataset_fingerprint(dataset_path)
    cached = load_cache("processed_dataset", fingerprint)
    if cached is not None:
        return cached, dataset_path, fingerprint

    df = load_raw_dataset(dataset_path)
    df = df.copy()

    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df = df.dropna(subset=["latitude", "longitude"])

    text_defaults = {
        "location": "Unknown Location",
        "vehicle_type": "UNKNOWN",
        "police_station": "UNKNOWN",
        "junction_name": "No Junction",
        "validation_status": "unknown",
        "device_id": "UNKNOWN_DEVICE",
    }
    for column, default in text_defaults.items():
        df[column] = df[column].fillna(default).replace({"NULL": default, "": default})
        df[column] = df[column].astype(str).str.strip()

    df["junction_name"] = df["junction_name"].replace({"": "No Junction", "nan": "No Junction"})
    df["validation_status"] = df["validation_status"].str.lower()
    df["created_datetime"] = pd.to_datetime(df["created_datetime"], errors="coerce", utc=True)
    df = df.dropna(subset=["created_datetime"])
    df["created_date"] = df["created_datetime"].dt.date
    df["hour"] = df["created_datetime"].dt.hour.astype(int)

    df["violation_types"] = df["violation_type"].apply(parse_violation_types)
    df["primary_violation_type"] = df["violation_types"].apply(first_violation_type)
    df["lat_grid"] = df["latitude"].round(3)
    df["lon_grid"] = df["longitude"].round(3)
    df["hotspot_id"] = df["lat_grid"].astype(str) + "_" + df["lon_grid"].astype(str)
    df["has_named_junction"] = (
        df["junction_name"].fillna("No Junction").astype(str).str.strip().str.lower()
        != "no junction"
    )

    save_cache("processed_dataset", fingerprint, df)
    return df, dataset_path, fingerprint
