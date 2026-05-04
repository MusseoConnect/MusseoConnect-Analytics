import pandas as pd
from pathlib import Path
from functools import lru_cache

BASE_DIR = Path(__file__).resolve().parents[1]
TRAVELLERS_PATH = BASE_DIR / "data" / "delhi_museum_travelers.csv"


@lru_cache(maxsize=1)
def load_travellers() -> pd.DataFrame:
    """Load and cache the travellers dataset. Cached after first read."""
    df = pd.read_csv(TRAVELLERS_PATH)
    # Pre-compute age once during load
    df["dateOfBirth"] = pd.to_datetime(df["dateOfBirth"], errors="coerce")
    df["age"] = 2026 - df["dateOfBirth"].dt.year
    df["age"] = df["age"].clip(lower=0, upper=120)
    # Normalise phone: treat NaN / empty as missing
    df["phoneNo"] = df["phoneNo"].fillna("").astype(str).str.strip()
    df["has_phone"] = df["phoneNo"].ne("")
    return df


def filter_df(museum: str | None = None) -> pd.DataFrame:
    """Return the full dataframe or filtered by museum name."""
    df = load_travellers()
    if museum and museum.lower() != "all":
        df = df[df["museumName"] == museum]
    return df