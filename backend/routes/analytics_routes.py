from typing import Optional
from fastapi import APIRouter
from services.analytics_service import (
    get_kpis,
    get_insights,
    visitors_per_museum,
    gender_distribution,
    nationality_distribution,
    age_distribution,
    museum_gender_split,
    age_group_distribution,
    domestic_vs_international,
    museum_comparison,
    nationality_by_museum,
    engagement_score,
)

router = APIRouter()

# ── KPIs ─────────────────────────────────────────────────────────────────────

@router.get("/kpis")
def kpis(museum: Optional[str] = None):
    return get_kpis(museum)


# ── Insights ─────────────────────────────────────────────────────────────────

@router.get("/insights")
def insights(museum: Optional[str] = None):
    return get_insights(museum)


# ── Chart data ───────────────────────────────────────────────────────────────

@router.get("/visitors_per_museum")
def visitors(museum: Optional[str] = None):
    return visitors_per_museum(museum)


@router.get("/gender_distribution")
def gender(museum: Optional[str] = None):
    return gender_distribution(museum)


@router.get("/nationality_distribution")
def nationality(museum: Optional[str] = None):
    return nationality_distribution(museum)


@router.get("/age_distribution")
def age(museum: Optional[str] = None):
    return age_distribution(museum)


@router.get("/museum_gender_split")
def museum_gender(museum: Optional[str] = None):
    return museum_gender_split(museum)


@router.get("/age_group_distribution")
def age_group(museum: Optional[str] = None):
    return age_group_distribution(museum)


@router.get("/domestic_international")
def dom_intl(museum: Optional[str] = None):
    return domestic_vs_international(museum)


@router.get("/museum_comparison")
def comparison(museum: Optional[str] = None):
    return museum_comparison(museum)


@router.get("/nationality_by_museum")
def nat_museum(museum: Optional[str] = None):
    return nationality_by_museum(museum)


@router.get("/engagement_score")
def engagement(museum: Optional[str] = None):
    return engagement_score(museum)