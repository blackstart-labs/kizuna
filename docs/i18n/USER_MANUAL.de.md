# Kizuna (絆) Benutzerhandbuch

Willkommen bei **Kizuna**, der schlanken und einheitlichen Control Plane für dein Homelab.

---

## 📑 Inhaltsverzeichnis
1. [Übersicht & Dashboard](#1-übersicht--dashboard)
2. [Befehlspalette (⌘K / Ctrl+K)](#2-befehlspalette)
3. [Dienste-Katalog](#3-dienste-katalog)
4. [Physische Hosts & Hypervisor](#4-physische-hosts--hypervisor)
5. [Container-Workloads & Aktionen](#5-container-workloads--aktionen)
6. [Topologie & Auswirkungsradius (Blast Radius)](#6-topologie--auswirkungsradius)
7. [Alarm- & Vorfallsverwaltung](#7-alarm---vorfallsverwaltung)
8. [Ressourcen-Optimierer & Simulationsmodus](#8-ressourcen-optimierer--simulationsmodus)

---

## 1. Übersicht & Dashboard
Erfahre sofort den aktuellen Gesundheitszustand deines Homelabs:
- **Aktive Dienste**: Verfügbarkeit aller registrierten Anwendungen.
- **24-Stunden-Telemetrie**: Historische CPU-, RAM-, ZFS- und Latenz-Kurven.
- **Speicher-Analyse**: Rückgewinnbarer Speicherplatz durch veraltete Docker-Images.

---

## 2. Befehlspalette
Drücke `⌘K` (macOS) oder `Ctrl+K` (Linux/Windows) für die globale Suche:
- Schnelle Suche nach Diensten, Kategorien oder URLs.
- Tastaturgesteuerte Navigation ohne Maus.

---

## 3. Dienste-Katalog
Strukturierte Übersicht aller Homelab-Anwendungen geordnet nach Kategorien.

---

## 4. Physische Hosts & Hypervisor
Überwachung von Bare-Metal- und Proxmox VE-Knoten mit Temperaturmessung (°C) und RAM-Auslastung.

---

## 5. Container-Workloads & Aktionen
- **Neustart**: Sicherer Container-Neustart mit Live-Statusanzeige.
- **Stoppen**: Sicherheitsabfrage verhindert versehentliches Beenden kritischer Dienste.
- **Starten**: Startet gestoppte Container zuverlässig.

---

## 6. Topologie & Auswirkungsradius
Visualisiert Abhängigkeiten zwischen Hosts, Datenbanken und Webdiensten und berechnet den Ausfallradius bei Störungen.

---

## 7. Alarm- & Vorfallsverwaltung
Fasst zusammenhängende Fehlermeldungen in einer chronologischen Zeitleiste zusammen.

---

## 8. Ressourcen-Optimierer & Simulationsmodus
- **Dry-Run Modus**: Vorab-Simulation zeigt bereinigbaren Speicherplatz ohne Risiko.
- **Sichere Bereinigung**: Entfernt ungenutzte Docker-Layer und Logdateien mit einem Klick.
