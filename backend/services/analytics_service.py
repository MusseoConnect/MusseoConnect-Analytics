import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
from utils.data_loader import load_travellers


def plot_to_base64():
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    img = base64.b64encode(buf.read()).decode("utf-8")
    plt.close()
    return img


def visitors_per_museum():

    df = load_travellers()

    counts = df["museumName"].value_counts()

    plt.figure()
    counts.plot(kind="bar")

    plt.title("Visitors per Museum")

    return plot_to_base64()


def gender_distribution():

    df = load_travellers()

    counts = df["gender"].value_counts()

    plt.figure()
    counts.plot(kind="pie", autopct="%1.1f%%")

    plt.title("Gender Distribution")

    return plot_to_base64()


def nationality_distribution():

    df = load_travellers()

    counts = df["nationality"].value_counts()

    plt.figure()
    counts.plot(kind="bar")

    plt.title("Visitors by Nationality")

    return plot_to_base64()


def age_distribution():

    df = load_travellers()

    df["dateOfBirth"] = pd.to_datetime(df["dateOfBirth"])
    df["age"] = 2026 - df["dateOfBirth"].dt.year

    plt.figure()
    df["age"].plot(kind="hist", bins=20)

    plt.title("Age Distribution")

    return plot_to_base64()


def museum_gender_split():

    df = load_travellers()

    table = pd.crosstab(df["museumName"], df["gender"])

    plt.figure()
    table.plot(kind="bar", stacked=True)

    plt.title("Gender Split per Museum")

    return plot_to_base64()


def top_nationalities_per_museum():

    df = load_travellers()

    table = df.groupby(["museumName","nationality"]).size().unstack().fillna(0)

    plt.figure()
    table.plot(kind="bar", stacked=True)

    plt.title("Nationality Distribution per Museum")

    return plot_to_base64()


def age_group_distribution():

    df = load_travellers()

    df["dateOfBirth"] = pd.to_datetime(df["dateOfBirth"])
    df["age"] = 2026 - df["dateOfBirth"].dt.year

    bins = [0,18,30,50,100]
    labels = ["Kids","Youth","Adult","Senior"]

    df["age_group"] = pd.cut(df["age"], bins=bins, labels=labels)

    counts = df["age_group"].value_counts()

    plt.figure()
    counts.plot(kind="pie", autopct="%1.1f%%")

    plt.title("Age Group Distribution")

    return plot_to_base64()


def museum_popularity():

    df = load_travellers()

    counts = df["museumName"].value_counts()

    plt.figure()
    counts.plot(kind="pie", autopct="%1.1f%%")

    plt.title("Museum Popularity Share")

    return plot_to_base64()


def phone_availability():

    df = load_travellers()

    df["phoneNo"] = df["phoneNo"].fillna("")

    available = (df["phoneNo"] != "").sum()
    missing = (df["phoneNo"] == "").sum()

    data = [available, missing]

    plt.figure()
    plt.pie(data, labels=["Provided","Missing"], autopct="%1.1f%%")

    plt.title("Phone Number Availability")

    return plot_to_base64()


def museum_age_trend():

    df = load_travellers()

    df["dateOfBirth"] = pd.to_datetime(df["dateOfBirth"])
    df["age"] = 2026 - df["dateOfBirth"].dt.year

    avg_age = df.groupby("museumName")["age"].mean()

    plt.figure()
    avg_age.plot(kind="bar")

    plt.title("Average Visitor Age per Museum")

    return plot_to_base64()