# Manual de Usuario de Kizuna (絆)

Bienvenido a **Kizuna**, el plano de control unificado y ultraligero para tu homelab.

---

## 📑 Tabla de Contenidos
1. [Panel Principal y Métricas](#1-panel-principal-y-métricas)
2. [Paleta de Comandos (⌘K / Ctrl+K)](#2-paleta-de-comandos)
3. [Catálogo de Servicios](#3-catálogo-de-servicios)
4. [Nodos Físicos e Hipervisores](#4-nodos-físicos-e-hipervisores)
5. [Contenedores y Acciones](#5-contenedores-y-acciones)
6. [Topología y Radio de Impacto](#6-topología-y-radio-de-impacto)
7. [Gestión de Alertas e Incidentes](#7-gestión-de-alertas-e-incidentes)
8. [Optimizador de Recursos y Modo Simulación](#8-optimizador-de-recursos)

---

## 1. Panel Principal y Métricas
Obtén una respuesta instantánea al estado global de tu homelab:
- **Servicios en Línea**: Disponibilidad de tus aplicaciones y servicios web.
- **Gráficos Sparkline de 24 Horas**: Tendencias de CPU, memoria RAM, almacenamiento ZFS y latencia de respuesta.
- **Barra de Almacenamiento Inteligente**: Espacio ocupado y capacidad recuperable de imágenes Docker obsoletas.

---

## 2. Paleta de Comandos
Presiona `⌘K` (macOS) o `Ctrl+K` (Linux/Windows) para abrir la búsqueda global instantánea:
- Busca por nombre de servicio, categoría o URL.
- Salta directamente a nodos físicos, contenedores o alertas sin usar el ratón.

---

## 3. Catálogo de Servicios
Organiza tus aplicaciones por categorías (*Multimedia, Nube, Automatización, Productividad, Monitoreo*).

---

## 4. Nodos Físicos e Hipervisores
Monitorea servidores dedicados y nodos Proxmox VE con lecturas térmicas (°C), presión de memoria RAM y núcleos de CPU.

---

## 5. Contenedores y Acciones
Controla tus cargas de trabajo Docker y LXC:
- **Reiniciar (Restart)**: Reinicio seguro con retroalimentación visual en tiempo real.
- **Detener (Stop)**: Incluye protección con doble confirmación para evitar interrupciones accidentales.
- **Iniciar (Start)**: Levanta contenedores inactivos o caídos.

---

## 6. Topología y Radio de Impacto
Visualiza la infraestructura en 3 niveles y calcula automáticamente el **Radio de Impacto** en caso de caída de un nodo o base de datos.

---

## 7. Gestión de Alertas e Incidentes
Agrupa alertas correlacionadas en líneas de tiempo para evitar fatiga de alertas.

---

## 8. Optimizador de Recursos
- **Modo Simulación (Dry-Run)**: Comprueba cuánto espacio se liberará antes de aplicar cambios en el disco.
- **Liberación Segura**: Elimina capas Docker huérfanas y registros JSON acumulados con un solo clic.
