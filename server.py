from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os

class CalendarHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Agregar headers CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/get-data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            try:
                with open('data.json', 'r', encoding='utf-8') as f:
                    data = f.read()
                self.wfile.write(data.encode())
            except:
                # Si no existe el archivo, devolver datos por defecto
                default_data = {
                    "calendarData": [],
                    "areas": [
                        { "id": 1, "name": "Calidad", "color": "bg-blue-500", "active": True },
                        { "id": 2, "name": "Recursos Humanos", "color": "bg-green-500", "active": True },
                        { "id": 3, "name": "TI", "color": "bg-yellow-500", "active": True },
                        { "id": 4, "name": "Seguridad Patrimonial", "color": "bg-purple-500", "active": True },
                        { "id": 5, "name": "Seguridad e Higiene", "color": "bg-red-500", "active": True },
                        { "id": 6, "name": "Mantenimiento", "color": "bg-pink-500", "active": True },
                        { "id": 7, "name": "Dirección", "color": "bg-indigo-500", "active": True }
                    ]
                }
                self.wfile.write(json.dumps(default_data).encode())
        else:
            # Servir archivos estáticos
            return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path == '/save-data':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # Validar que los datos son JSON válido
                json.loads(post_data)
                
                # Guardar los datos
                with open('data.json', 'wb') as f:
                    f.write(post_data)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            return SimpleHTTPRequestHandler.do_POST(self)

def run(server_class=HTTPServer, handler_class=CalendarHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Servidor iniciado en puerto {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
