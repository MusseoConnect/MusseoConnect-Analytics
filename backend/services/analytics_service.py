import numpy as np
import pandas as pd
from typing import Optional

from utils.data_loader import filter_df


# ── KPIs ─────────────────────────────────────────────────────────────────────

def get_kpis(museum: Optional[str] = None) -> dict:
    df = filter_df(museum)
    if df.empty:
        return {
            "total_visitors": 0, "avg_age": 0, "top_nationality": "N/A",
            "phone_rate": "0%", "intl_rate": "0%", "unique_nationalities": 0,
            "male_pct": "0%", "female_pct": "0%", "median_age": 0,
        }
    intl = df[~df["nationality"].str.strip().str.lower().isin(["india", "indian"])]
    gc = df["gender"].value_counts()
    total = len(df)
    return {
        "total_visitors":      int(total),
        "avg_age":             round(float(df["age"].mean()), 1),
        "median_age":          int(df["age"].median()),
        "top_nationality":     str(df["nationality"].value_counts().idxmax()),
        "phone_rate":          f"{round(df['has_phone'].mean() * 100, 1)}%",
        "intl_rate":           f"{round(len(intl) / total * 100, 1)}%",
        "unique_nationalities": int(df["nationality"].nunique()),
        "male_pct":            f"{round(gc.get('Male', 0) / total * 100, 1)}%",
        "female_pct":          f"{round(gc.get('Female', 0) / total * 100, 1)}%",
    }


# ── Insights engine ───────────────────────────────────────────────────────────

def get_insights(museum: Optional[str] = None) -> list:
    df = filter_df(museum)
    if df.empty:
        return [{"type": "warning", "label": "No Data", "text": "No records found for the selected filter."}]

    total = len(df)
    out = []

    # 1. Top museum
    mc = df["museumName"].value_counts()
    top_name = mc.idxmax().replace(" Delhi", "")
    top_pct  = round(mc.max() / total * 100, 1)
    out.append({
        "type": "highlight",
        "label": "Top Venue",
        "text": f"{top_name} attracts {top_pct}% of total footfall ({mc.max():,} visitors)",
    })

    # 2. Gender
    gc = df["gender"].value_counts()
    dom_g   = gc.idxmax()
    dom_pct = round(gc.max() / total * 100, 1)
    others  = " · ".join(f"{g} {round(c/total*100,1)}%" for g, c in gc.items() if g != dom_g)
    out.append({
        "type": "info",
        "label": "Gender Split",
        "text": f"{dom_g} visitors lead at {dom_pct}%" + (f" — {others}" if others else ""),
    })

    # 3. International reach
    intl = df[~df["nationality"].str.strip().str.lower().isin(["india", "indian"])]
    intl_pct = round(len(intl) / total * 100, 1)
    top_intl  = intl["nationality"].value_counts().index[0] if len(intl) > 0 else "N/A"
    out.append({
        "type": "metric",
        "label": "International Reach",
        "text": f"{intl_pct}% of visitors are international — top source country: {top_intl}",
    })

    # 4. Age profile
    median_age = int(df["age"].median())
    youth_pct  = round(len(df[df["age"] <= 30]) / total * 100, 1)
    out.append({
        "type": "trend",
        "label": "Age Profile",
        "text": f"Median age is {median_age} yrs — Youth (≤30) make up {youth_pct}% of all visitors",
    })

    # 5. Contact opportunity
    phone_pct = round(df["has_phone"].mean() * 100, 1)
    unreachable = round(100 - phone_pct, 1)
    out.append({
        "type": "action",
        "label": "Contact Rate",
        "text": f"{phone_pct}% of visitors shared contact info — {unreachable}% are unreachable for follow-up campaigns",
    })

    # 6. Diversity index
    nat_counts = df["nationality"].value_counts(normalize=True)
    hhi = round(float((nat_counts ** 2).sum()), 3)
    diversity = "High" if hhi < 0.15 else "Moderate" if hhi < 0.25 else "Low"
    out.append({
        "type": "metric",
        "label": "Diversity Index",
        "text": f"Nationality diversity is {diversity} (HHI: {hhi}) — {int(df['nationality'].nunique())} nationalities represented",
    })

    return out


# ── Chart data endpoints (Chart.js JSON) ─────────────────────────────────────

def visitors_per_museum(museum: Optional[str] = None) -> dict:
    df = filter_df(museum)
    counts = df["museumName"].value_counts().sort_values(ascending=True)
    labels = [n.replace(" Delhi", "").replace("National ", "Nat'l ") for n in counts.index]
    return {"labels": labels, "values": counts.values.tolist(), "full_labels": counts.index.tolist()}


def gender_distribution(museum: Optional[str] = None) -> dict:
    df = filter_df(museum)
    counts = df["gender"].value_counts()
    return {"labels": counts.index.tolist(), "values": counts.values.tolist()}


def nationality_distribution(museum: Optional[str] = None) -> dict:
    df = filter_df(museum)
    counts = df["nationality"].value_counts().head(10)
    return {"labels": counts.index.tolist(), "values": counts.values.tolist()}


def age_distribution(museum: Optional[str] = None) -> dict:
    df = filter_df(museum)
    ages = df["age"].dropna()
    hist, edges = np.histogram(ages, bins=15)
    labels = [f"{int(edges[i])}–{int(edges[i+1])}" for i in range(len(hist))]
    return {"labels": labels, "values": hist.tolist()}


def museum_gender_split(museum: Optional[str] = None) -> dict:
    df = filter_df(museum)
    table = pd.crosstab(df["museumName"], df["gender"])
    short = [n.replace(" Delhi", "").replace("National ", "Nat'l ") for n in table.index]
    datasets = [{"label": col, "values": table[col].values.tolist()} for col in table.columns]
    return {"labels": short, "datasets": datasets}


def age_group_distribution(museum: Optional[str] = None) -> dict:
    df = filter_df(museum).copy()
    bins   = [0, 18, 30, 50, 120]
    labels = ["Kids (0–18)", "Youth (19–30)", "Adult (31–50)", "Senior (51+)"]
    df["age_group"] = pd.cut(df["age"], bins=bins, labels=labels)
    counts = df["age_group"].value_counts().reindex(labels).fillna(0)
    return {"labels": labels, "values": [int(v) for v in counts.values.tolist()]}


# ── New analytics endpoints ──────────────────────────────────────────────────

def domestic_vs_international(museum: Optional[str] = None) -> dict:
    df = filter_df(museum)
    total = len(df)
    if total == 0:
        return {"labels": ["Domestic", "International"], "values": [0, 0], "percentages": [0, 0]}
    domestic = df[df["nationality"].str.strip().str.lower().isin(["india", "indian"])]
    intl_count = total - len(domestic)
    return {
        "labels": ["Domestic", "International"],
        "values": [int(len(domestic)), int(intl_count)],
        "percentages": [
            round(len(domestic) / total * 100, 1),
            round(intl_count / total * 100, 1),
        ],
    }


def museum_comparison(museum: Optional[str] = None) -> list:
    """Return a comparison table of key metrics per museum."""
    df = filter_df(None)  # Always use full data for comparison
    museums = df["museumName"].unique()
    rows = []
    for m in museums:
        mdf = df[df["museumName"] == m]
        total = len(mdf)
        intl = mdf[~mdf["nationality"].str.strip().str.lower().isin(["india", "indian"])]
        gc = mdf["gender"].value_counts()
        rows.append({
            "museum": m.replace(" Delhi", "").replace("National ", "Nat'l "),
            "museum_full": m,
            "visitors": int(total),
            "avg_age": round(float(mdf["age"].mean()), 1),
            "male_pct": round(gc.get("Male", 0) / total * 100, 1) if total else 0,
            "female_pct": round(gc.get("Female", 0) / total * 100, 1) if total else 0,
            "intl_pct": round(len(intl) / total * 100, 1) if total else 0,
            "phone_rate": round(mdf["has_phone"].mean() * 100, 1) if total else 0,
            "nationalities": int(mdf["nationality"].nunique()),
        })
    rows.sort(key=lambda r: r["visitors"], reverse=True)
    return rows


def nationality_by_museum(museum: Optional[str] = None) -> dict:
    """Heatmap-style data: nationality breakdown per museum."""
    df = filter_df(museum)
    table = pd.crosstab(df["museumName"], df["nationality"])
    # Take top 8 nationalities overall
    top_nats = df["nationality"].value_counts().head(8).index.tolist()
    table = table[top_nats]
    short_museums = [n.replace(" Delhi", "").replace("National ", "Nat'l ") for n in table.index]
    datasets = []
    for nat in top_nats:
        datasets.append({
            "label": nat,
            "values": table[nat].values.tolist(),
        })
    return {"labels": short_museums, "datasets": datasets}


def engagement_score(museum: Optional[str] = None) -> dict:
    """Compute engagement scores per museum based on phone contact rate and diversity."""
    df = filter_df(None)
    museums = df["museumName"].unique()
    labels = []
    scores = []
    for m in museums:
        mdf = df[df["museumName"] == m]
        phone_score = mdf["has_phone"].mean() * 50  # 0-50 points
        diversity_score = min(mdf["nationality"].nunique() / 10 * 50, 50)  # 0-50 points
        total_score = round(phone_score + diversity_score, 1)
        labels.append(m.replace(" Delhi", "").replace("National ", "Nat'l "))
        scores.append(total_score)
    return {"labels": labels, "values": scores}