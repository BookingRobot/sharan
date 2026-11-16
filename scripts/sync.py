"""Archive ntfy.sh messages (kept only ~12 h there) into data/entries.json + data/istorija.csv."""
import csv, json, urllib.request
from datetime import datetime, timezone, timedelta

TOPIC = "sharan-rinkinys-k7m3p9q2"
PATH = "data/entries.json"

with open(PATH, encoding="utf-8") as f:
    entries = {e["id"]: e for e in json.load(f)}

req = urllib.request.Request(f"https://ntfy.sh/{TOPIC}/json?poll=1&since=all", headers={"User-Agent": "sharan-sync"})
for line in urllib.request.urlopen(req, timeout=30).read().decode("utf-8").splitlines():
    try:
        m = json.loads(line)
        if m.get("event") != "message" or m["id"] in entries:
            continue
        d = json.loads(m["message"])
        if not d.get("type") or not d.get("name"):
            continue
        entries[m["id"]] = {"id": m["id"], "time": m["time"], "type": str(d["type"]), "item": str(d.get("item", "")),
                            "name": str(d["name"])[:40], "note": str(d.get("note", ""))[:1000]}
    except Exception:
        pass

out = sorted(entries.values(), key=lambda e: (e["time"], e["id"]))
with open(PATH, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
with open("data/istorija.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f, delimiter=";")
    w.writerow(["Laikas (UTC)", "Tipas", "Daiktas (id)", "Vardas", "Pastaba / komentaras"])
    for e in out:
        w.writerow([datetime.fromtimestamp(e["time"], timezone.utc).strftime("%Y-%m-%d %H:%M"), e["type"], e["item"], e["name"], e["note"]])
print(len(out), "entries")
