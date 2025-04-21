// Initial empty data
let areas = [];
let calendarData = [];

// Mexican holidays 2025
const holidays2025 = [
    '2025-01-01', // Año Nuevo
    '2025-02-05', // Día de la Constitución
    '2025-03-18', // Natalicio de Benito Juárez
    '2025-05-01', // Día del Trabajo
    '2025-09-16', // Día de la Independencia
    '2025-11-18', // Revolución Mexicana
    '2025-12-25'  // Navidad
];

const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Save data to server
async function saveData() {
    try {
        const response = await fetch('/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                calendarData: calendarData,
                areas: areas
            })
        });

        if (!response.ok) {
            throw new Error('Error al guardar los datos');
        }

        showSaveNotification('Cambios guardados');
    } catch (error) {
        console.error('Error saving data:', error);
        showSaveNotification('Error al guardar cambios', true);
        alert('Error al guardar los cambios. Por favor, intenta de nuevo.');
    }
}

// Default areas data
const defaultAreas = [
    { id: 1, name: 'Calidad', color: 'bg-blue-500', active: true },
    { id: 2, name: 'Recursos Humanos', color: 'bg-green-500', active: true },
    { id: 3, name: 'TI', color: 'bg-yellow-500', active: true },
    { id: 4, name: 'Seguridad Patrimonial', color: 'bg-purple-500', active: true },
    { id: 5, name: 'Seguridad e Higiene', color: 'bg-red-500', active: true },
    { id: 6, name: 'Mantenimiento', color: 'bg-pink-500', active: true },
    { id: 7, name: 'Dirección', color: 'bg-indigo-500', active: true },
    { id: 8, name: 'Logística', color: 'bg-blue-500', active: true },
    { id: 9, name: 'Compras', color: 'bg-green-500', active: true }
];

// Load data from server or localStorage
async function loadData() {
    try {
        // First try to load from localStorage
        const savedData = localStorage.getItem('calendarData');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.areas && Array.isArray(data.areas) && data.calendarData && Array.isArray(data.calendarData)) {
                areas = data.areas;
                calendarData = data.calendarData;
                console.log('Loaded data from localStorage');
                return true;
            }
        }

        // En Vercel, saltamos la carga del servidor
        if (window.location.hostname !== 'localhost') {
            console.log('Running on Vercel, skipping server load');
        } else {
            // If no local data, try to load from server
            try {
                const response = await fetch('/get-data');
                if (response.ok) {
                    const data = await response.json();
                    if (data.areas && Array.isArray(data.areas)) {
                        areas = data.areas;
                        calendarData = data.calendarData || [];
                        await saveData();
                        return true;
                    }
                }
            } catch (error) {
                console.log('Server not available, using default data');
            }
        }

        // If no data available, initialize with defaults
        console.log('Initializing with default data');
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
        await saveData();
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        return false;
    }
}

// Save data to server and localStorage
async function saveData() {
    try {
        const data = {
            calendarData: calendarData,
            areas: areas
        };
        
        // Save to localStorage
        localStorage.setItem('calendarData', JSON.stringify(data));
        
        // En Vercel, solo usamos localStorage
        if (window.location.hostname !== 'localhost') {
            console.log('Running on Vercel, using localStorage only');
        } else {
            // Try to save to server if on localhost
            try {
                const response = await fetch('/save-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    console.log('Could not save to server, saved to localStorage only');
                }
            } catch (error) {
                console.log('Server not available, saved to localStorage only');
            }
        }

        showSaveNotification('Cambios guardados');
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        showSaveNotification('Error al guardar cambios', true);
        return false;
    }
}

// Show save notification
function showSaveNotification(message, isError = false) {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('saveNotification');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'saveNotification';
        notificationContainer.className = 'fixed bottom-4 right-4 z-50 transition-all duration-300 transform translate-y-full opacity-0';
        document.body.appendChild(notificationContainer);
    }

    // Set notification content and style
    const bgColor = isError ? 'bg-red-500' : 'bg-green-500';
    const icon = isError ? 'fa-exclamation-circle' : 'fa-check-circle';
    notificationContainer.innerHTML = `
        <div class="${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <i class="fas ${icon} mr-2"></i>
            <span>${message}</span>
        </div>
    `;

    // Show notification with animation
    setTimeout(() => {
        notificationContainer.classList.remove('translate-y-full', 'opacity-0');
    }, 100);

    // Hide notification after delay
    setTimeout(() => {
        notificationContainer.classList.add('translate-y-full', 'opacity-0');
    }, 3000);
}

// Initialize calendar data
async function initializeCalendarData() {
    console.log('Initializing calendar data...'); // Debug log
    
    try {
        // Try to load saved data
        const dataLoaded = await loadData();
        
        // Si no hay datos de calendario pero sí hay áreas, inicializar el calendario
        if (areas.length > 0 && (!calendarData || calendarData.length === 0)) {
            console.log('Initializing calendar with default data');
            calendarData = months.map((month, index) => {
                // Get active areas
                const activeAreas = areas.filter(a => a.active);
                if (activeAreas.length === 0) {
                    throw new Error('No hay áreas activas disponibles');
                }
                
                const defaultArea = activeAreas[index % activeAreas.length];
                
                // Get first workday as YYYY-MM-DD string
                const firstWorkday = findFirstWorkday(2025, index);
                
                // Create month data
                const monthData = {
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
                
                console.log(`Initialized ${month} with:`, monthData);
                return monthData;
            });

            // Save the initialized data
            await saveData();
        }

        console.log('Calendar data:', calendarData);
        renderCalendar();
        renderAreaLegend();
    } catch (error) {
        console.error('Error initializing calendar:', error);
        alert('Error al inicializar el calendario: ' + error.message);
    }
}

// Helper function to create a new visit
function createNewVisit(monthIndex) {
    // Create date in UTC at noon
    const date = new Date(Date.UTC(2025, monthIndex, 1, 12, 0, 0));
    while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
        date.setUTCDate(date.getUTCDate() + 1);
    }
    // Format as YYYY-MM-DD
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return {
        date: `${year}-${month}-${day}`,
        areas: []
    };
}

// Add visit to month
function addVisit() {
    console.group('Adding new visit'); // Start logging group
    try {
        const monthTitle = document.getElementById('editCardTitle').textContent;
        const monthName = monthTitle.split(' ')[0];
        const monthIndex = months.indexOf(monthName);
        
        console.log(`Current month: ${monthName} (index: ${monthIndex})`);
        
        const visitsContainer = document.getElementById('visitsContainer');
        const newVisitIndex = visitsContainer.children.length;
        console.log(`Current visits count: ${newVisitIndex}`);
        
        const newVisit = createNewVisit(monthIndex);
        console.log('New visit object:', {
            date: newVisit.date.toISOString(),
            areas: newVisit.areas
        });
        
        const visitDiv = document.createElement('div');
        visitDiv.className = 'visit-item border rounded p-4 mb-4';
        visitDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-semibold">Visita ${newVisitIndex + 1}</h4>
                <button onclick="this.closest('.visit-item').remove(); updateVisitNumbers();" 
                        class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                    <input type="date" 
                           class="visit-date w-full border rounded px-3 py-2"
                           value="${newVisit.date}"
                           min="2025-01-01"
                           max="2025-12-31"
                           onchange="validateDate(this)">
                    <p class="text-sm text-red-500 mt-1 hidden">No se pueden seleccionar sábados ni domingos</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Áreas</label>
                    <div class="space-y-2">
                        ${areas.map(area => `
                            <label class="flex items-center">
                                <input type="checkbox" 
                                       class="form-checkbox mr-2"
                                       value="${area.id}">
                                <span>${area.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        visitsContainer.appendChild(visitDiv);
        updateVisitNumbers();
        
        console.log('Visit element created and added to DOM');
        console.groupEnd(); // End logging group
    } catch (error) {
        console.error('Error adding visit:', error);
        console.groupEnd(); // End logging group even if there's an error
        alert('Error al agregar la visita. Por favor, intenta de nuevo.');
    }
}

// Update visit numbers in the modal
function updateVisitNumbers() {
    console.group('Updating visit numbers');
    try {
        const visits = document.querySelectorAll('.visit-item');
        console.log(`Found ${visits.length} visits to update`);
        
        visits.forEach((visit, index) => {
            const title = visit.querySelector('h4');
            title.textContent = `Visita ${index + 1}`;
        });
        
        console.log('Visit numbers updated successfully');
        console.groupEnd();
    } catch (error) {
        console.error('Error updating visit numbers:', error);
        console.groupEnd();
    }
}

// Find first workday of the month (no weekends)
function findFirstWorkday(year, month) {
    // Create date in UTC at noon
    const date = new Date(Date.UTC(year, month, 1, 12, 0, 0));
    while (date.getUTCDay() === 0 || date.getUTCDay() === 6) { // Skip weekends
        date.setUTCDate(date.getUTCDate() + 1);
    }
    // Format as YYYY-MM-DD
    const month_str = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day_str = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month_str}-${day_str}`;
}

// Check if date is a holiday
function isHoliday(date) {
    let dateStr;
    if (typeof date === 'string') {
        dateStr = date;
    } else if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
    } else {
        console.error('Invalid date format:', date);
        return false;
    }
    return holidays2025.includes(dateStr);
}

// Format date for display
function formatDate(date) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let dateObj;
    
    if (typeof date === 'string') {
        // Parse date string and adjust for local timezone
        const [year, month, day] = date.split('-').map(Number);
        dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    } else if (date instanceof Date) {
        // Create new date object at UTC noon
        dateObj = new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            12, 0, 0
        ));
    } else {
        console.error('Invalid date format:', date);
        return 'Fecha inválida';
    }
    
    // Get local date values
    const localDate = new Date(dateObj);
    return `${days[localDate.getDay()]} ${localDate.getDate()}`;
}

// Render the calendar grid
function renderCalendar() {
    try {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';

        const activeAreas = areas.filter(a => a.active);
        if (activeAreas.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500">No hay áreas activas. Agrega áreas en la configuración.</p>';
            return;
        }
        
        calendarData.forEach((data, index) => {
            const card = document.createElement('div');
            card.className = 'area-card bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl';
            card.onclick = () => openEditModal(index);
            
            // Ensure visits array exists and parse dates with UTC
            const visits = Array.isArray(data.visits) ? data.visits.map(visit => {
                if (typeof visit.date === 'string') {
                    const [year, month, day] = visit.date.split('-').map(Number);
                    return {
                        ...visit,
                        date: visit.date // Keep the YYYY-MM-DD string format
                    };
                }
                return visit;
            }) : [];
            
// Generate visits HTML
const visitsHtml = visits.map((visit, visitIndex) => {
    try {
        // Ensure areas array exists and is valid
        const validAreas = Array.isArray(visit.areas) ? visit.areas.filter(area => area && area.color && area.name) : [];
        
        // Use the date string directly since we're maintaining YYYY-MM-DD format
        const visitDate = visit.date;
        if (!visitDate || typeof visitDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
            throw new Error(`Invalid date format for visit ${visitIndex + 1}`);
        }
        
        // Generate areas HTML
        const areasHtml = validAreas.map(area => `
            <span class="inline-flex items-center ${area.color} text-white text-sm px-2 py-1 rounded mr-2 mb-1">
                <i class="fas fa-users mr-1"></i>${area.name}
            </span>
        `).join('');

            // Format date for display
            const displayDate = formatDate(visitDate);
            const isHolidayDate = isHoliday(typeof visitDate === 'string' ? visitDate : 
                `${visitDate.getUTCFullYear()}-${String(visitDate.getUTCMonth() + 1).padStart(2, '0')}-${String(visitDate.getUTCDate()).padStart(2, '0')}`);

            // Create visit element
            return `
                <div class="p-4 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center">
                            <span class="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded mr-3">
                                Visita ${visitIndex + 1}
                            </span>
                            <span class="text-gray-600">
                                <i class="fas fa-calendar-day mr-1"></i>
                                ${displayDate}
                            </span>
                        </div>
                        ${isHolidayDate ? '<span class="text-red-500 text-sm"><i class="fas fa-exclamation-triangle mr-1"></i>Día festivo</span>' : ''}
                    </div>
                    <div class="flex flex-wrap gap-2 mt-3">
                        ${areasHtml}
                    </div>
                </div>
            `;
    } catch (error) {
        console.error(`Error rendering visit ${visitIndex + 1}:`, error);
        return `
            <div class="p-4 bg-red-50">
                <p class="text-red-500">Error al cargar la visita ${visitIndex + 1}</p>
            </div>
        `;
    }
}).join('');

            // Create card content
            card.innerHTML = `
                <div class="bg-gray-800 text-white p-4 rounded-t-lg">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-semibold">${data.month} 2025</h3>
                        <span class="bg-gray-700 text-sm px-3 py-1 rounded-full">
                            <i class="fas fa-list-ul mr-1"></i>
                            ${visits.length} ${visits.length === 1 ? 'visita' : 'visitas'}
                        </span>
                    </div>
                </div>
                <div class="divide-y divide-gray-200">
                    ${visitsHtml}
                </div>
            `;
            
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error rendering calendar:', error);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Error al cargar el calendario. Por favor, recarga la página.</p>';
    }
}

// Render the area legend
function renderAreaLegend() {
    const legend = document.getElementById('areaLegend');
    legend.innerHTML = '';

    areas.filter(area => area.active).forEach(area => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <div class="w-4 h-4 rounded ${area.color} mr-2"></div>
            <span>${area.name}</span>
        `;
        legend.appendChild(div);
    });
}

// Configuration modal functions
function openConfigModal() {
    const modal = document.getElementById('configModal');
    modal.classList.remove('hidden');
    renderAreasConfig();
}

function closeConfigModal() {
    const modal = document.getElementById('configModal');
    modal.classList.add('hidden');
}

// Edit card modal functions
function openEditModal(monthIndex) {
    try {
        const modal = document.getElementById('editCardModal');
        const data = calendarData[monthIndex];
        
        if (!data || !data.month) {
            throw new Error('Invalid month data');
        }
        
        document.getElementById('editCardTitle').textContent = `${data.month} 2025`;
        
        const visitsContainer = document.getElementById('visitsContainer');
        visitsContainer.innerHTML = '';
        
        // Ensure visits is an array and parse dates with UTC
        const visits = Array.isArray(data.visits) ? data.visits.map(visit => {
            if (typeof visit.date === 'string') {
                const [year, month, day] = visit.date.split('-').map(Number);
                return {
                    ...visit,
                    date: visit.date // Keep the YYYY-MM-DD string format
                };
            }
            return visit;
        }) : [];
        
        visits.forEach((visit, visitIndex) => {
            const visitDiv = document.createElement('div');
            visitDiv.className = 'visit-item border rounded p-4 mb-4';
            
            // Ensure areas is an array and all areas are valid
            const visitAreas = Array.isArray(visit.areas) ? 
                visit.areas.filter(area => area && area.id && areas.some(a => a.id === area.id)) : [];
            
            visitDiv.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-lg font-semibold">Visita ${visitIndex + 1}</h4>
                    ${visits.length > 1 ? `
                        <button onclick="this.closest('.visit-item').remove(); updateVisitNumbers();" 
                                class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                        <input type="date" 
                               class="visit-date w-full border rounded px-3 py-2"
                               value="${visit.date}"
                               min="2025-01-01"
                               max="2025-12-31"
                               onchange="validateDate(this)">
                        <p class="text-sm text-red-500 mt-1 hidden">No se pueden seleccionar sábados ni domingos</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Áreas</label>
                        <div class="space-y-2">
                            ${areas.map(area => `
                                <label class="flex items-center">
                                    <input type="checkbox" 
                                           class="form-checkbox mr-2"
                                           value="${area.id}"
                                           ${visitAreas.some(a => a.id === area.id) ? 'checked' : ''}>
                                    <span>${area.name}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            visitsContainer.appendChild(visitDiv);
        });
        
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error opening edit modal:', error);
        alert('Error al abrir el editor. Por favor, intenta de nuevo.');
    }
}

function closeEditModal() {
    const modal = document.getElementById('editCardModal');
    modal.classList.add('hidden');
}

function validateDate(input) {
    try {
        // Parse date string to ensure consistent format
        const [year, month, day] = input.value.split('-').map(Number);
        const newDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        const errorMsg = input.parentElement.querySelector('.text-red-500');
        
        // Reset validation
        errorMsg.classList.add('hidden');
        input.classList.remove('border-red-500');
        
        // Check for invalid date
        if (isNaN(newDate.getTime())) {
            throw new Error('Fecha inválida');
        }
        
        // Check for weekends using UTC day
        if (newDate.getUTCDay() === 0 || newDate.getUTCDay() === 6) {
            errorMsg.classList.remove('hidden');
            input.classList.add('border-red-500');
            return false;
        }
        
        // Format date as YYYY-MM-DD for holiday check
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (isHoliday(dateStr)) {
            if (!confirm('La fecha seleccionada es un día festivo. ¿Deseas continuar?')) {
                return false;
            }
        }
        
        // Store the validated date in UTC format
        input.setAttribute('data-validated-date', dateStr);
        return true;
    } catch (error) {
        console.error('Error validating date:', error);
        alert('Error al validar la fecha. Por favor, selecciona una fecha válida.');
        return false;
    }
}

function addVisit() {
    try {
        const monthTitle = document.getElementById('editCardTitle').textContent;
        const monthName = monthTitle.split(' ')[0];
        const monthIndex = months.indexOf(monthName);
        const visitsContainer = document.getElementById('visitsContainer');
        const newVisitIndex = visitsContainer.children.length;
        
        // Find next available workday using UTC
        const date = new Date(Date.UTC(2025, monthIndex, 1, 12, 0, 0));
        while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
            date.setUTCDate(date.getUTCDate() + 1);
        }
        
        // Format as YYYY-MM-DD
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Get active areas for checkboxes
        const activeAreas = areas.filter(a => a.active).map(area => ({
            id: area.id,
            name: area.name,
            color: area.color
        }));
        
        if (activeAreas.length === 0) {
            throw new Error('No hay áreas activas disponibles');
        }
        
        const visitDiv = document.createElement('div');
        visitDiv.className = 'visit-item border rounded p-4 mb-4';
        visitDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-semibold">Visita ${newVisitIndex + 1}</h4>
                <button onclick="this.closest('.visit-item').remove(); updateVisitNumbers();" 
                        class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                    <input type="date" 
                           class="visit-date w-full border rounded px-3 py-2"
                           value="${dateStr}"
                           min="2025-01-01"
                           max="2025-12-31"
                           onchange="validateDate(this)">
                    <p class="text-sm text-red-500 mt-1 hidden">No se pueden seleccionar sábados ni domingos</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Áreas</label>
                    <div class="space-y-2">
                        ${activeAreas.map(area => `
                            <label class="flex items-center">
                                <input type="checkbox" 
                                       class="form-checkbox mr-2"
                                       value="${area.id}">
                                <span>${area.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        visitsContainer.appendChild(visitDiv);
        updateVisitNumbers();
    } catch (error) {
        console.error('Error adding visit:', error);
        alert('Error al agregar la visita: ' + error.message);
    }
}

function updateVisitNumbers() {
    const visits = document.querySelectorAll('.visit-item');
    visits.forEach((visit, index) => {
        visit.querySelector('h4').textContent = `Visita ${index + 1}`;
    });
}

function saveCardEdit() {
    try {
        // Get month data
        const monthTitle = document.getElementById('editCardTitle').textContent;
        const monthName = monthTitle.split(' ')[0];
        const monthIndex = months.indexOf(monthName);
        
        if (monthIndex === -1) {
            throw new Error('Invalid month name');
        }
        
        // Get all visit items
        const visitItems = document.querySelectorAll('.visit-item');
        const newVisits = [];
        
        // Process each visit
        for (const visitItem of visitItems) {
            // Get and validate date
            const dateInput = visitItem.querySelector('.visit-date');
            if (!dateInput || !dateInput.value) {
                alert('Por favor, selecciona una fecha para cada visita');
                return;
            }
            
            if (!validateDate(dateInput)) {
                return;
            }
            
            // Get the validated UTC date
            const validatedDate = dateInput.getAttribute('data-validated-date');
            if (!validatedDate) {
                throw new Error('No validated date found');
            }
            
            // Get and validate areas
            const areaCheckboxes = visitItem.querySelectorAll('input[type="checkbox"]');
            const selectedAreas = Array.from(areaCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => {
                    const areaId = parseInt(cb.value);
                    const area = areas.find(a => a.id === areaId);
                    if (!area) {
                        throw new Error(`Invalid area selected: ${areaId}`);
                    }
                    return {
                        id: area.id,
                        name: area.name,
                        color: area.color
                    };
                });
                
            if (selectedAreas.length === 0) {
                alert('Debes seleccionar al menos un área para cada visita');
                return;
            }
            
            // Add valid visit to array with validated UTC date
            newVisits.push({
                date: validatedDate,
                areas: selectedAreas
            });
        }
        
        // Update calendar data
        if (monthIndex >= 0 && monthIndex < calendarData.length) {
            // Create new month data object to avoid reference issues
            const updatedMonth = {
                month: monthName,
                visits: newVisits.map(visit => ({
                    ...visit,
                    date: visit.date,
                    areas: [...visit.areas]
                }))
            };
            
            // Update the calendar data
            calendarData[monthIndex] = updatedMonth;
            
            // Save changes to localStorage
            saveData();
            
            // Force a complete re-render
            const grid = document.getElementById('calendarGrid');
            grid.innerHTML = '';
            renderCalendar();
            
            // Close the modal
            closeEditModal();
        } else {
            throw new Error('Invalid month index');
        }
    } catch (error) {
        console.error('Error saving changes:', error);
        alert('Hubo un error al guardar los cambios. Por favor, intenta de nuevo.');
    }
}

// Helper function to parse date string
function parseDate(dateStr) {
    try {
        return new Date(dateStr);
    } catch (error) {
        console.error('Error parsing date:', dateStr, error);
        return new Date();
    }
}

// Render areas in configuration
function renderAreasConfig() {
    const areasList = document.getElementById('areasList');
    areasList.innerHTML = '';

    areas.forEach(area => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-2 border rounded';
        div.innerHTML = `
            <div class="flex items-center">
                <div class="w-4 h-4 rounded ${area.color} mr-2"></div>
                <span>${area.name}</span>
            </div>
            <div class="flex items-center gap-2">
                <input type="checkbox" ${area.active ? 'checked' : ''} 
                       onchange="toggleArea(${area.id})" class="form-checkbox">
                <button onclick="removeArea(${area.id})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        areasList.appendChild(div);
    });
}

// Toggle area active status
function toggleArea(id) {
    const area = areas.find(a => a.id === id);
    if (area) {
        area.active = !area.active;
        renderCalendar();
        renderAreaLegend();
        renderAreasConfig();
        saveData();
    }
}

// Remove area
function removeArea(id) {
    if (areas.length > 1) {
        areas = areas.filter(a => a.id !== id);
        renderCalendar();
        renderAreaLegend();
        renderAreasConfig();
        saveData();
    } else {
        alert('Debe mantener al menos un área activa');
    }
}

// Add new area
function addNewArea() {
    const input = document.getElementById('newAreaInput');
    const name = input.value.trim();
    
    if (name) {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
                       'bg-red-500', 'bg-pink-500', 'bg-indigo-500'];
        const newArea = {
            id: Math.max(...areas.map(a => a.id)) + 1,
            name: name,
            color: colors[areas.length % colors.length],
            active: true
        };
        
        areas.push(newArea);
        input.value = '';
        renderCalendar();
        renderAreaLegend();
        renderAreasConfig();
        saveData();
    }
}

// Save configuration
function saveConfig() {
    renderCalendar();
    renderAreaLegend();
    saveData();
    closeConfigModal();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeCalendarData);
