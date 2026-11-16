"""Archive ntfy.sh messages (kept only ~12 h there) into data/entries.json + data/istorija.csv."""
import csv, json, urllib.request
from datetime import datetime, timezone, timedelta

TOPIC = "sharan-rinkinys-v3-q9d2x6"
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
                            "name": str(d["name"])[:40], "target": str(d.get("target", "")), "note": str(d.get("note", ""))[:1000],
                            "ip": str(d.get("ip", ""))[:45], "ua": str(d.get("ua", ""))[:300],
                            "iso": datetime.fromtimestamp(m["time"], timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
    except Exception:
        pass

out = sorted(entries.values(), key=lambda e: (e["time"], e["id"]))
with open(PATH, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
with open("data/istorija.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f, delimiter=";")
    w.writerow(["Laikas (UTC)", "Tipas", "Daiktas (id)", "Vardas", "Kam taikoma", "Pastaba / komentaras", "IP", "User-Agent"])
    for e in out:
        w.writerow([datetime.fromtimestamp(e["time"], timezone.utc).strftime("%Y-%m-%d %H:%M:%S"), e["type"], e["item"], e["name"], e.get("target", ""), e["note"], e.get("ip", ""), e.get("ua", "")])
print(len(out), "entries")
