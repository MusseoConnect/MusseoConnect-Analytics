const API = "http://127.0.0.1:8000"

const museums = [
"All",
"National Museum Delhi",
"National Gallery of Modern Art Delhi",
"Red Fort Archaeological Museum",
"Gandhi Smriti Museum",
"National Rail Museum Delhi"
]

function populateMuseums(){

const select = document.getElementById("museumSelect")

museums.forEach(m => {

const opt = document.createElement("option")
opt.value = m
opt.text = m

select.appendChild(opt)

})

select.addEventListener("change",loadCharts)

}

async function loadCharts(){

await fetchChart("/analytics/visitors_per_museum","visitors_chart")
await fetchChart("/analytics/gender_distribution","gender_chart")
await fetchChart("/analytics/nationality_distribution","nationality_chart")
await fetchChart("/analytics/age_distribution","age_chart")
await fetchChart("/analytics/museum_gender_split","museum_gender_chart")
await fetchChart("/analytics/age_group_distribution","age_group_chart")

}

async function fetchChart(endpoint,id){

const res = await fetch(API + endpoint)
const data = await res.json()

document.getElementById(id).src =
`data:image/png;base64,${data.chart}`

}

/* MOCK KPI DATA (can connect backend later) */

function loadKPIs(){

document.getElementById("totalVisitors").innerText = "2500"
document.getElementById("avgAge").innerText = "32"
document.getElementById("topNationality").innerText = "Indian"
document.getElementById("phoneRate").innerText = "82%"

}

populateMuseums()
loadCharts()
loadKPIs()