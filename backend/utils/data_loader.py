import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

travellers_path = BASE_DIR / "data" / "delhi_museum_travelers.csv"
museums_path = BASE_DIR / "data" / "museums.csv"

def load_travellers():
    return pd.read_csv(travellers_path)

def load_museums():
    return pd.read_csv(museums_path)