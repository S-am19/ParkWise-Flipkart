import ast
import hashlib
import json
import logging
import pickle
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

import pandas as pd


logger = logging.getLogger("uvicorn.error")

DATASET_URL = (
    "https://huggingface.co/datasets/S-am19/parkwise-bengaluru-parking-data/"
    "resolve/main/jan%20to%20may%20police%20violation_anonymized791b166%20(1).csv"
)
DATASET_FILENAME = "jan to may police violation_anonymized791b166 (1).csv"
DOWNLOAD_RETRIES = 3
DOWNLOAD_TIMEOUT_SECONDS = 60

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


def find_local_dataset() -> Path | None:
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
        return None

    preferred = [
        path
        for path in candidates
        if "police" in path.name.lower() and "violation" in path.name.lower()
    ]
    return sorted(preferred or candidates, key=lambda p: p.stat().st_size, reverse=True)[0]


def download_dataset() -> Path:
    dataset_directory = backend_root() / "dataset"
    dataset_directory.mkdir(parents=True, exist_ok=True)
    destination = dataset_directory / DATASET_FILENAME
    temporary_destination = destination.with_suffix(destination.suffix + ".part")

    logger.info("Downloading dataset from Hugging Face...")
    last_error: Exception | None = None
    for attempt in range(1, DOWNLOAD_RETRIES + 1):
        try:
            request = urllib.request.Request(
                DATASET_URL,
                headers={"User-Agent": "ParkWise-FastAPI/1.0"},
            )
            with urllib.request.urlopen(
                request,
                timeout=DOWNLOAD_TIMEOUT_SECONDS,
            ) as response, temporary_destination.open("wb") as file:
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    file.write(chunk)

            if temporary_destination.stat().st_size == 0:
                raise RuntimeError("Downloaded dataset is empty.")

            temporary_destination.replace(destination)
            logger.info("Dataset downloaded successfully.")
            return destination
        except (OSError, RuntimeError, urllib.error.URLError) as exc:
            last_error = exc
            temporary_destination.unlink(missing_ok=True)
            if attempt < DOWNLOAD_RETRIES:
                logger.warning(
                    "Dataset download failed on attempt %s/%s: %s. Retrying...",
                    attempt,
                    DOWNLOAD_RETRIES,
                    exc,
                )
                time.sleep(2 ** (attempt - 1))

    raise RuntimeError(
        f"Unable to download dataset from Hugging Face after {DOWNLOAD_RETRIES} attempts."
    ) from last_error


def find_dataset() -> Path:
    dataset_path = find_local_dataset()
    if dataset_path is not None:
        return dataset_path

    logger.info("Dataset not found locally.")
    return download_dataset()


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
