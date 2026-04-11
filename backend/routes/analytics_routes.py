from fastapi import APIRouter
from services.analytics_service import *

router = APIRouter()


@router.get("/visitors_per_museum")
def visitors():
    return {"chart": visitors_per_museum()}


@router.get("/gender_distribution")
def gender():
    return {"chart": gender_distribution()}


@router.get("/nationality_distribution")
def nationality():
    return {"chart": nationality_distribution()}


@router.get("/age_distribution")
def age():
    return {"chart": age_distribution()}


@router.get("/museum_gender_split")
def museum_gender():
    return {"chart": museum_gender_split()}


@router.get("/top_nationalities_per_museum")
def nationality_museum():
    return {"chart": top_nationalities_per_museum()}


@router.get("/age_group_distribution")
def age_group():
    return {"chart": age_group_distribution()}


@router.get("/museum_popularity")
def popularity():
    return {"chart": museum_popularity()}


@router.get("/phone_availability")
def phone():
    return {"chart": phone_availability()}


@router.get("/museum_age_trend")
def age_trend():
    return {"chart": museum_age_trend()}