# Dashboard de Gestión de Licencias Microsoft

Sistema de gestión de licencias de Microsoft Office 365 con interfaz web moderna, visualización de datos y almacenamiento en la nube.

## 📋 Características

- 🔑 Seguimiento completo de licencias de Office 365
- 👤 Gestión de asignaciones de usuarios
- 📊 Dashboard visual con estadísticas clave
- 📈 Gráficos de distribución de licencias
- 🔍 Búsqueda y filtrado avanzado
- 📱 Diseño responsivo para todos los dispositivos
- 🔄 Sincronización en tiempo real
- 📝 Historial de cambios en licencias
- 💰 Seguimiento de costos mensuales

## 🚀 Inicio Rápido

1. Clona o descarga este repositorio
2. Ejecuta `start-server.cmd` para iniciar el servidor local
3. Abre tu navegador y ve a `http://localhost:8000`

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML, JavaScript, Tailwind CSS
- **Gráficos:** Chart.js
- **Backend:** Supabase (Base de datos PostgreSQL)
- **Servidor:** Python HTTP Server
- **Iconos:** Font Awesome
- **Fuentes:** Google Fonts (Inter)

## 📋 Gestión de Licencias

El dashboard permite:

- Ver todas las licencias en una tabla ordenada
- Añadir nuevas licencias
- Editar licencias existentes
- Eliminar licencias
- Filtrar licencias por tipo, usuario o estado
- Visualizar la distribución de licencias por tipo y estado

## 🔧 Configuración de Base de Datos

El proyecto utiliza Supabase como backend. Se incluye un archivo `setup.sql` con la estructura de la base de datos.

### Estructura de la Tabla

La tabla `ms_licenses` almacena la siguiente información:

- ID único
- Tipo de licencia
- Nombre de usuario
- Persona asignada
- Fecha de renovación
- Costo mensual
- Estado (Activa, Inactiva, Pendiente)
- Notas
- Timestamps de creación y actualización

## 📊 Dashboard

El dashboard principal muestra:

- Total de licencias
- Licencias asignadas
- Licencias disponibles
- Costo total mensual
- Gráficos de distribución

## 💡 Uso

1. **Ver licencias**: La tabla principal muestra todas las licencias
2. **Añadir licencia**: Haz clic en el botón "Nueva Licencia"
3. **Editar licencia**: Haz clic en el icono de edición en la fila correspondiente
4. **Eliminar licencia**: Haz clic en el icono de eliminar en la fila correspondiente
5. **Buscar**: Usa el campo de búsqueda para filtrar por cualquier criterio
6. **Sincronizar**: Haz clic en "Sincronizar" para actualizar los datos desde el servidor

## 📱 Responsive

El diseño se adapta automáticamente a cualquier tamaño de pantalla:
- Escritorio: Vista completa con todas las funcionalidades
- Tablet: Diseño optimizado para pantallas medianas
- Móvil: Interfaz simplificada para navegación fácil en pantallas pequeñas

## 🔒 Seguridad

- Autenticación gestionada por Supabase
- Políticas de Row Level Security (RLS) implementadas
- Conexión segura mediante HTTPS

## 🤝 Contribuir

Si deseas contribuir a este proyecto, por favor:
1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad
3. Envía un pull request
