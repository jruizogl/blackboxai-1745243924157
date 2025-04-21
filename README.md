# Calendario de Visitas - Open Gate Logistics

Aplicación web para gestionar el calendario de visitas a Silao, con persistencia de datos y gestión de áreas.

## Características

- Calendario interactivo para el año 2025
- Gestión de visitas por mes
- Gestión de áreas (agregar, eliminar, activar/desactivar)
- Persistencia de datos usando almacenamiento JSON
- Interfaz moderna y responsive con Tailwind CSS

## Requisitos

- Python 3.7 o superior
- Navegador web moderno

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/calendario-visitas.git
cd calendario-visitas
```

2. Inicia el servidor:
```bash
python server.py
```

3. Abre tu navegador y visita:
```
http://localhost:8000
```

## Estructura de Archivos

- `index.html` - Interfaz principal del calendario
- `script.js` - Lógica del calendario y manipulación de datos
- `server.py` - Servidor Python para persistencia de datos
- `data.json` - Almacenamiento de datos del calendario

## Uso

1. El calendario muestra las visitas programadas por mes
2. Haz clic en un mes para ver/editar sus visitas
3. Usa el botón de Configuración para gestionar las áreas
4. Los cambios se guardan automáticamente

## Tecnologías

- HTML5
- JavaScript (ES6+)
- Tailwind CSS
- Python (Servidor HTTP)
- Font Awesome (Iconos)
- Google Fonts

## Licencia

© 2025 Open Gate Logistics. Todos los derechos reservados.
