# cdtKitchenKlock

En fullskärms köksklocka för Raspberry Pi med HDMI-skärm — digital, analog, väder och mer.

> **Läs dokumentationen på ditt språk:**
> - [Svenska → README-SV.md](README-SV.md)
> - [English → README-EN.md](README-EN.md)

---

## Quick start

```bash
cd frontend && npm install && npm run build && cd ..
cd backend && sbt assembly && cd ..
./start.sh
# → http://localhost:8080
```

**Stack:** Scala 3 + ZIO 2 · React 18 + TypeScript + Vite · Fat JAR · Port 8080
