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
    grid.innerHTML = calendarData.map((month, monthIndex) => `
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
                <h2 class="text-lg font-semibold">${month.month} 2025</h2>
                <span class="text-sm">${month.visits.length} visita${month.visits.length !== 1 ? "s" : ""}</span>
            </div>
            <div class="p-4">
                ${month.visits.map((visit, visitIndex) => `
                    <div class="mb-2 last:mb-0 cursor-pointer hover:bg-gray-50 p-2 rounded" 
                         onclick="openEditModal(${monthIndex}, ${visitIndex})">
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

// Modal functions
function createModal(title, content) {
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div class="flex justify-between items-center px-6 py-4 border-b">
                <h3 class="text-xl font-semibold">${title}</h3>
                <button onclick="closeModal(this)" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6">${content}</div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeModal(button) {
    button.closest(".fixed").remove();
}

// Configuration modal
function openConfigModal() {
    const content = `
        <div class="space-y-4">
            <div class="flex flex-wrap gap-4">
                ${areas.map(area => `
                    <div class="flex items-center space-x-2">
                        <input type="checkbox" id="area-${area.id}" 
                               ${area.active ? "checked" : ""}
                               onchange="toggleArea(${area.id})">
                        <div class="w-4 h-4 ${area.color} rounded"></div>
                        <label for="area-${area.id}">${area.name}</label>
                        ${areas.length > 1 ? `
                            <button onclick="removeArea(${area.id})" 
                                    class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ""}
                    </div>
                `).join("")}
            </div>
            <div class="flex gap-2 mt-4">
                <input type="text" id="newAreaInput" placeholder="Nueva área" 
                       class="border rounded px-2 py-1 flex-1">
                <button onclick="addNewArea()" 
                        class="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                    Agregar
                </button>
            </div>
            <div class="flex justify-end gap-2 mt-4">
                <button onclick="closeModal(this)" 
                        class="px-4 py-2 border rounded hover:bg-gray-50">
                    Cancelar
                </button>
                <button onclick="saveConfig()" 
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Guardar Cambios
                </button>
            </div>
        </div>
    `;
    createModal("Configuración", content);
}

// Edit visit modal
function openEditModal(monthIndex, visitIndex) {
    const visit = calendarData[monthIndex].visits[visitIndex];
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Fecha</label>
                <input type="date" value="${visit.date}" 
                       onchange="updateVisitDate(${monthIndex}, ${visitIndex}, this.value)"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Áreas</label>
                <div class="mt-2 space-y-2">
                    ${areas.map(area => `
                        <div class="flex items-center">
                            <input type="checkbox" id="visit-area-${area.id}" 
                                   ${visit.areas.some(a => a.id === area.id) ? "checked" : ""}
                                   onchange="toggleVisitArea(${monthIndex}, ${visitIndex}, ${area.id})">
                            <div class="w-4 h-4 ${area.color} rounded ml-2"></div>
                            <label for="visit-area-${area.id}" class="ml-2">${area.name}</label>
                        </div>
                    `).join("")}
                </div>
            </div>
            <div class="flex justify-end gap-2 mt-4">
                <button onclick="closeModal(this)" 
                        class="px-4 py-2 border rounded hover:bg-gray-50">
                    Cancelar
                </button>
                <button onclick="saveVisit(${monthIndex}, ${visitIndex})" 
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Guardar Cambios
                </button>
            </div>
        </div>
    `;
    createModal(`Visita ${visitIndex + 1} - ${calendarData[monthIndex].month}`, content);
}

// Area management
function toggleArea(id) {
    const area = areas.find(a => a.id === id);
    if (area) {
        area.active = !area.active;
        saveData();
        renderCalendar();
        renderAreaLegend();
    }
}

function removeArea(id) {
    if (areas.length > 1) {
        areas = areas.filter(a => a.id !== id);
        saveData();
        renderCalendar();
        renderAreaLegend();
        closeModal(document.querySelector(".fixed button"));
    }
}

function addNewArea() {
    const input = document.getElementById("newAreaInput");
    const name = input.value.trim();
    
    if (name) {
        const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", 
                       "bg-red-500", "bg-pink-500", "bg-indigo-500"];
        const newArea = {
            id: Math.max(...areas.map(a => a.id)) + 1,
            name: name,
            color: colors[areas.length % colors.length],
            active: true
        };
        
        areas.push(newArea);
        input.value = "";
        saveData();
        renderCalendar();
        renderAreaLegend();
        closeModal(document.querySelector(".fixed button"));
    }
}

// Visit management
function updateVisitDate(monthIndex, visitIndex, date) {
    calendarData[monthIndex].visits[visitIndex].date = date;
}

function toggleVisitArea(monthIndex, visitIndex, areaId) {
    const visit = calendarData[monthIndex].visits[visitIndex];
    const areaIndex = visit.areas.findIndex(a => a.id === areaId);
    const area = areas.find(a => a.id === areaId);
    
    if (areaIndex >= 0) {
        visit.areas.splice(areaIndex, 1);
    } else if (area) {
        visit.areas.push({
            id: area.id,
            name: area.name,
            color: area.color
        });
    }
}

function saveVisit(monthIndex, visitIndex) {
    saveData();
    renderCalendar();
    closeModal(document.querySelector(".fixed button"));
}

// Configuration
function saveConfig() {
    saveData();
    renderCalendar();
    renderAreaLegend();
    closeModal(document.querySelector(".fixed button"));
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
