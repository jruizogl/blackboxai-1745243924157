// Configuración para el Dashboard de Licencias Microsoft
// Este archivo centraliza las configuraciones y permite usar variables de entorno en Vercel

// Función para obtener variables de entorno en Vercel o valores por defecto
function getConfig() {
    // Para entorno de desarrollo local
    if (typeof window !== 'undefined') {
        // Valores por defecto para desarrollo local
        return {
            supabaseUrl: window.SUPABASE_URL || 'https://tperggrkgjexpsibgmtb.supabase.co',
            supabaseKey: window.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZXJnZ3JrZ2pleHBzaWJnbXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTAxODYsImV4cCI6MjA2MDgyNjE4Nn0.7ackU8djT7cNvNzznjfHU52USlFulpkub6xnMUq8DyQ',
            demoModeKey: 'ms_licenses_demo_data',
            version: '1.0.0'
        };
    }
    
    // Para Vercel con variables de entorno
    return {
        supabaseUrl: process.env.SUPABASE_URL || 'https://tperggrkgjexpsibgmtb.supabase.co',
        supabaseKey: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZXJnZ3JrZ2pleHBzaWJnbXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTAxODYsImV4cCI6MjA2MDgyNjE4Nn0.7ackU8djT7cNvNzznjfHU52USlFulpkub6xnMUq8DyQ',
        demoModeKey: 'ms_licenses_demo_data',
        version: '1.0.0'
    };
}

// Exportar la configuración
const config = getConfig();

// Para uso en el navegador
if (typeof window !== 'undefined') {
    window.appConfig = config;
}

// Para uso con módulos ES
export default config;
