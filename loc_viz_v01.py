# -*- coding: utf-8 -*-
"""
Created on Sat Aug 30 22:49:31 2025
@author: amrit
"""

import streamlit as st
import pandas as pd
import folium
from folium.plugins import MarkerCluster
from streamlit_folium import st_folium
import math
from io import BytesIO
import requests
from openai import OpenAI

# ---------------- Page Config ----------------
st.set_page_config(page_title="Regional Office Location Density Analysis", layout="wide")

# ---------------- AI Client (OpenRouter) ----------------
OPENROUTER_API_KEY = st.secrets.get("OPENROUTER_API_KEY", "")
client = None
if OPENROUTER_API_KEY:
    client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)

# ---------------- Utilities ----------------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2)
    c = 2 * math.asin(math.sqrt(a))
    return R * c

def parse_coords(coord_str):
    try:
        lat, lon = map(float, str(coord_str).split(","))
        return lat, lon
    except Exception:
        return None, None

# ---------------- APIs ----------------
NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
WIKIDATA_SPARQL = "https://query.wikidata.org/sparql"

def reverse_geocode(lat, lon):
    try:
        r = requests.get(NOMINATIM_REVERSE, params={
            "format":"jsonv2","lat":lat,"lon":lon,"zoom":14,"addressdetails":1},
            headers={"User-Agent":"LocationDensityApp/1.0"},timeout=15)
        if r.ok:
            j = r.json()
            addr = j.get("address", {})
            display = j.get("display_name","")
            city = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("county")
            return {"display_name":display, "city":city,
                    "state":addr.get("state"), "country":addr.get("country")}
    except: pass
    return {}

def overpass_nearest_rail_station(lat, lon, radius_m=30000):
    q=f"""[out:json][timeout:25];node(around:{radius_m},{lat},{lon})["railway"="station"];out body;"""
    try:
        r=requests.post(OVERPASS_URL,data={"data":q},timeout=30)
        if r.ok:
            data=r.json().get("elements",[])
            if not data: return {}
            best=min(data,key=lambda n:haversine(lat,lon,n["lat"],n["lon"]))
            return {"name":best.get("tags",{}).get("name","Unnamed"),"lat":best["lat"],
                    "lon":best["lon"],"distance_km":round(haversine(lat,lon,best["lat"],best["lon"]),2)}
    except: pass
    return {}

def overpass_nearest_airport(lat, lon, radius_m=150000):
    q=f"""[out:json][timeout:25];node(around:{radius_m},{lat},{lon})["aeroway"="aerodrome"];out body;"""
    try:
        r=requests.post(OVERPASS_URL,data={"data":q},timeout=30)
        if r.ok:
            data=r.json().get("elements",[])
            if not data: return {}
            best=min(data,key=lambda n:haversine(lat,lon,n["lat"],n["lon"]))
            return {"name":best.get("tags",{}).get("name","Unnamed Aerodrome"),"lat":best["lat"],
                    "lon":best["lon"],"distance_km":round(haversine(lat,lon,best["lat"],best["lon"]),2)}
    except: pass
    return {}

def overpass_nearby_highways(lat, lon, radius_m=50000, limit=5):
    q = f"""
    [out:json][timeout:25];
    way(around:{radius_m},{lat},{lon})["highway"~"trunk|primary"]["ref"~"^NH"];
    out tags center;
    """
    try:
        r = requests.post(OVERPASS_URL, data={"data": q}, timeout=30)
        if r.ok:
            ways = r.json().get("elements", [])
            results = []
            for w in ways:
                tags = w.get("tags", {})
                ref = tags.get("ref")
                name = tags.get("name")
                center = w.get("center", {})
                clat, clon = center.get("lat"), center.get("lon")
                if clat and clon:
                    d = haversine(lat, lon, clat, clon)
                    results.append({"NH Ref": ref, "Name": name, "Distance (km)": round(d, 2)})
            # Sort and unique by NH Ref
            results.sort(key=lambda x: x["Distance (km)"])
            seen, unique = set(), []
            for r_ in results:
                if r_["NH Ref"] not in seen:
                    unique.append(r_)
                    seen.add(r_["NH Ref"])
                if len(unique) >= limit:
                    break
            return unique
    except: pass
    return []

def geonames_population(city, country="IN", username="amritpvre"):
    if not city: return {}
    try:
        url=f"http://api.geonames.org/searchJSON?q={city}&country={country}&maxRows=1&username={username}"
        r=requests.get(url,timeout=15)
        if r.ok:
            data=r.json().get("geonames",[])
            if data:
                entry=data[0]
                return {"city":entry.get("name"),"country":entry.get("countryName"),
                        "population":entry.get("population")}
    except: pass
    return {}

def wikidata_population(city_label):
    if not city_label: return {}
    query=f"""
    SELECT ?population ?pointInTime WHERE {{
      ?city rdfs:label "{city_label}"@en.
      ?city p:P1082 ?pop.
      ?pop ps:P1082 ?population.
      OPTIONAL {{ ?pop pq:P585 ?pointInTime. }}
    }}
    ORDER BY DESC(?pointInTime) LIMIT 1
    """
    try:
        r=requests.get(WIKIDATA_SPARQL,params={"query":query,"format":"json"},
                       headers={"User-Agent":"LocationDensityApp/1.0"},timeout=30)
        if r.ok:
            binds=r.json()["results"]["bindings"]
            if binds:
                b=binds[0]
                pop=int(float(b["population"]["value"]))
                as_of=b.get("pointInTime",{}).get("value","")
                return {"city":city_label,"population":pop,"as_of":as_of}
    except: pass
    return {}

# ---------------- AI Helpers ----------------
def ai_recommendation(ranking_df, context):
    if not client:
        return "⚠️ AI not configured. Add your OpenRouter API key in Streamlit secrets."
    prompt = f"""
    You are an expert business analyst.

    Office ranking by supplier density:
    {ranking_df.to_string(index=False)}

    Contextual info:
    {context}

    Please recommend the best regional office, with reasoning and tradeoffs.
    """
    try:
        resp = client.chat.completions.create(
            model="deepseek/deepseek-chat-v3.1:free",
            messages=[{"role":"user","content":prompt}]
        )
        return resp.choices[0].message.content
    except Exception as e:
        return f"AI error: {e}"

def ai_swot_analysis(ranking_df, context, office_name):
    if not client:
        return "⚠️ AI not configured."
    prompt = f"""
    Perform a brief SWOT analysis for the office: {office_name}.

    Supplier coverage ranking data:
    {ranking_df.to_string(index=False)}

    Contextual information:
    {context}

    Provide a concise SWOT with Strengths, Weaknesses, Opportunities, Threats.
    """
    try:
        resp = client.chat.completions.create(
            model="deepseek/deepseek-chat-v3.1:free",
            messages=[{"role":"user","content":prompt}]
        )
        return resp.choices[0].message.content
    except Exception as e:
        return f"AI error: {e}"

# ---------------- UI ----------------
st.title("Regional Office Location Density Analysis")

st.markdown("""
**Quick Guide**  
1. Upload Excel with `supplier_name`, `supplier_coords` (`lat, lon`).  
2. Add up to 6 potential offices.  
3. Use sidebar to adjust radius and select office for map.  
4. See ranking table + download.  
5. Enable contextual info.  
6. Use AI Recommendation and SWOT Analysis.
""")

# File upload
uploaded_file=st.file_uploader("Upload B2B Customers Excel File",type=["xlsx"])

if uploaded_file:
    df=pd.read_excel(uploaded_file)
    if "supplier_name" not in df.columns or "supplier_coords" not in df.columns:
        st.error("Excel must have supplier_name, supplier_coords")
        st.stop()
    df["supplier_lat"],df["supplier_lon"]=zip(*df["supplier_coords"].map(parse_coords))

    # Dynamic offices
    st.subheader("Enter Potential Regional Office Locations (max 6)")
    if "num_offices" not in st.session_state: st.session_state.num_offices=1
    c1,c2=st.columns([1,1])
    if c1.button("+ Add office") and st.session_state.num_offices<6: st.session_state.num_offices+=1
    if c2.button("− Remove office") and st.session_state.num_offices>1: st.session_state.num_offices-=1

    offices=[]
    for i in range(st.session_state.num_offices):
        o1,o2=st.columns(2)
        name=o1.text_input(f"Office {i+1} Name",key=f"off_name_{i}")
        coord=o2.text_input(f"Office {i+1} Coordinates (lat, lon)",key=f"off_coord_{i}")
        if name and coord:
            lat,lon=parse_coords(coord)
            if lat and lon: offices.append({"office_name":name,"lat":lat,"lon":lon})

    if offices:
        with st.sidebar:
            st.header("Controls")
            radius_km=st.slider("Radius (km)",10,500,50,10)
            sel_off_name=st.selectbox("Select office for map",[o["office_name"] for o in offices])
            enrich=st.checkbox("Fetch contextual info",value=False)

        # Compute coverage
        results=[]
        for o in offices:
            cnt=0; within=[]
            for _,s in df.iterrows():
                d=haversine(o["lat"],o["lon"],s["supplier_lat"],s["supplier_lon"])
                if d<=radius_km:
                    cnt+=1; within.append(s["supplier_name"])
            results.append({"Office":o["office_name"],"Suppliers within radius":cnt,
                            "Supplier Names":", ".join(within)})
        res_df=pd.DataFrame(results).sort_values(by="Suppliers within radius",ascending=False)

        st.subheader("🏆 Office Ranking")
        st.dataframe(res_df,use_container_width=True)

        # Downloads
        c1,c2=st.columns(2)
        c1.download_button("📥 CSV",res_df.to_csv(index=False).encode(),
            "office_ranking.csv","text/csv")
        buf=BytesIO()
        with pd.ExcelWriter(buf,engine="xlsxwriter") as w: res_df.to_excel(w,index=False)
        c2.download_button("📥 Excel",buf.getvalue(),
            "office_ranking.xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

        # Map
        sel_off=next(o for o in offices if o["office_name"]==sel_off_name)
        m=folium.Map(location=[df["supplier_lat"].mean(),df["supplier_lon"].mean()],zoom_start=7)
        folium.Marker([sel_off["lat"],sel_off["lon"]],
                      popup=f"Office: {sel_off['office_name']}",
                      icon=folium.Icon(color="red",icon="building")).add_to(m)
        folium.Circle([sel_off["lat"],sel_off["lon"]],radius=radius_km*1000,
                      color="red",fill=True,fill_opacity=0.1).add_to(m)
        cl=MarkerCluster().add_to(m)
        for _,s in df.iterrows():
            d=haversine(sel_off["lat"],sel_off["lon"],s["supplier_lat"],s["supplier_lon"])
            folium.Marker([s["supplier_lat"],s["supplier_lon"]],
                          popup=f"{s['supplier_name']}<br>{d:.1f} km",
                          icon=folium.Icon(color="green" if d<=radius_km else "blue",icon="user")
                          ).add_to(cl)
            folium.PolyLine([[sel_off["lat"],sel_off["lon"]],
                             [s["supplier_lat"],s["supplier_lon"]]],
                            color="gray",weight=1,dash_array="5,5").add_to(m)
        st.subheader(f"📍 Map — {sel_off_name}")
        st_folium(m,width=1100,height=600)

        # Contextual info
        context_info=""
        if enrich:
            st.subheader("📚 Contextual Information")
            with st.spinner("Fetching info..."):
                rg=reverse_geocode(sel_off["lat"],sel_off["lon"])
                rail=overpass_nearest_rail_station(sel_off["lat"],sel_off["lon"])
                air=overpass_nearest_airport(sel_off["lat"],sel_off["lon"])
                nhs=overpass_nearby_highways(sel_off["lat"],sel_off["lon"])
                pop=geonames_population(rg.get("city")) or wikidata_population(rg.get("city"))

            context_info = f"Place: {rg}\nRail: {rail}\nAirport: {air}\nHighways: {nhs}\nPopulation: {pop}"

            st.markdown("### 📍 Reverse-geocoded Place")
            if rg:
                st.markdown(f"**Address:** {rg['display_name']}  \n**City:** {rg.get('city','')}  "
                            f"\n**State:** {rg.get('state','')}  \n**Country:** {rg.get('country','')}")
            else: st.info("No reverse-geocode data.")

            st.markdown("### 🚉 Nearest Railway Station")
            if rail: st.markdown(f"**{rail['name']}** — {rail['distance_km']} km")
            else: st.info("Not found.")

            st.markdown("### ✈️ Nearest Airport")
            if air: st.markdown(f"**{air['name']}** — {air['distance_km']} km")
            else: st.info("No airport found.")

            st.markdown("### 🛣️ Connecting National Highways")
            if nhs: st.dataframe(pd.DataFrame(nhs), use_container_width=True)
            else: st.info("No NH found nearby.")

            st.markdown("### 🧑 Population")
            if pop and pop.get("population"): st.markdown(f"**{pop['city']}** — {pop['population']:,}")
            else: st.info("No population data found.")

        # AI Section
        st.subheader("🤖 AI Insights")
        if st.button("Generate AI Recommendation"):
            ai_text = ai_recommendation(res_df, context_info)
            st.write(ai_text)

        if st.button("Generate SWOT Analysis"):
            ai_text = ai_swot_analysis(res_df, context_info, sel_off_name)
            st.write(ai_text)
