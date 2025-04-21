// Initial empty data
let areas = [];
let calendarData = [];

// Default areas data
const defaultAreas = [
    { id: 1, name: "Calidad", color: "bg-blue-500", active: true },
    { id: 2, name: "Recursos Humanos", color: "bg-green-500", active: true },
    { id: 3, name: "TI", color: "bg-yellow-500", active: true },
    { id: 4, name: "Seguridad Patrimonial", color: "bg-purple-500", active: true },
    { id: 5, name: "Seguridad e Higiene", color: "bg-red-500", active: true },
    { id: 6, name: "Mantenimiento", color: "bg-pink-500", active: true },
    { id: 7, name: "Dirección", color: "bg-indigo-500", active: true }
];

// Storage keys
const STORAGE_KEY = "calendario_visitas_data";
const UPDATE_KEY = "calendario_visitas_update";

// Mexican months
const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Find first workday of month
function findFirstWorkday(year, monthIndex) {
    const date = new Date(year, monthIndex, 1);
    while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
    }
    return date.toISOString().split("T")[0];
}

// Load data from storage
function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.areas && Array.isArray(data.areas) && 
                data.calendarData && Array.isArray(data.calendarData)) {
                areas = data.areas;
                calendarData = data.calendarData;
                console.log("Loaded data from storage");
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("Error loading data:", error);
        return false;
    }
}

// Save data to storage
function saveData() {
    try {
        const data = {
            calendarData: calendarData,
            areas: areas,
            updated_at: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(UPDATE_KEY, new Date().toISOString());
        
        // Broadcast change to other tabs
        window.dispatchEvent(new StorageEvent("storage", {
            key: UPDATE_KEY,
            newValue: new Date().toISOString()
        }));
        
        showSaveNotification("Cambios guardados");
        return true;
    } catch (error) {
        console.error("Error saving data:", error);
        showSaveNotification("Error al guardar cambios", true);
        return false;
    }
}

// Show save notification
function showSaveNotification(message, isError = false) {
    let notificationContainer = document.getElementById("saveNotification");
    if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.id = "saveNotification";
        notificationContainer.className = "fixed bottom-4 right-4 z-50 transition-all duration-300 transform translate-y-full opacity-0";
        document.body.appendChild(notificationContainer);
    }

    const bgColor = isError ? "bg-red-500" : "bg-green-500";
    const icon = isError ? "fa-exclamation-circle" : "fa-check-circle";
    notificationContainer.innerHTML = `
        <div class="${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <i class="fas ${icon} mr-2"></i>
            <span>${message}</span>
        </div>
    `;

    setTimeout(() => {
        notificationContainer.classList.remove("translate-y-full", "opacity-0");
    }, 100);

    setTimeout(() => {
        notificationContainer.classList.add("translate-y-full", "opacity-0");
    }, 3000);
}

// Initialize calendar data
function initializeCalendarData() {
    console.log("Initializing calendar data...");
    
    try {
        const dataLoaded = loadData();
        if (!dataLoaded) {
            console.log("No data found, initializing with defaults");
            areas = defaultAreas;
            calendarData = months.map((month, index) => {
                const activeAreas = areas.filter(a => a.active);
                const defaultArea = activeAreas[index % activeAreas.length];
                const firstWorkday = findFirstWorkday(2025, index);
                
                return {
                    month: month,
                    visits: [{
                        date: firstWorkday,
                        areas: [{
                            id: defaultArea.id,
                            name: defaultArea.name,
                            color: defaultArea.color
                        }]
                    }]
                };
            });
            saveData();
        }

        console.log("Calendar data:", calendarData);
        renderCalendar();
        renderAreaLegend();
    } catch (error) {
        console.error("Error initializing calendar:", error);
        showSaveNotification("Error al inicializar el calendario", true);
    }
}

// Render area legend
function renderAreaLegend() {
    const legend = document.getElementById("areaLegend");
    legend.innerHTML = areas.map(area => `
        <div class="flex items-center space-x-1">
            <div class="w-4 h-4 ${area.color} rounded"></div>
            <span>${area.name}</span>
        </div>
    `).join("");
}

// Render calendar
function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = calendarData.map(month => `
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
                <h2 class="text-lg font-semibold">${month.month} 2025</h2>
                <span class="text-sm">${month.visits.length} visita${month.visits.length !== 1 ? "s" : ""}</span>
            </div>
            <div class="p-4">
                ${month.visits.map(visit => `
                    <div class="mb-2 last:mb-0">
                        <div class="text-sm text-gray-600 mb-1">
                            <i class="far fa-calendar mr-1"></i>
                            ${new Date(visit.date).toLocaleDateString("es-MX", { weekday: "long", day: "numeric" })}
                        </div>
                        <div class="flex flex-wrap gap-1">
                            ${visit.areas.map(area => `
                                <span class="px-2 py-1 rounded text-sm text-white ${area.color}">
                                    ${area.name}
                                </span>
                            `).join("")}
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `).join("");
}

// Listen for changes from other tabs/windows
window.addEventListener("storage", (e) => {
    if (e.key === UPDATE_KEY) {
        loadData();
        renderCalendar();
        renderAreaLegend();
        showSaveNotification("Calendario actualizado");
    }
});

// Initialize calendar when page loads
document.addEventListener("DOMContentLoaded", initializeCalendarData);
