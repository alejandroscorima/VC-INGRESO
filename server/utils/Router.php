<?php
/**
 * Router Simple para VC-INGRESO
 * 
 * Sistema de enrutamiento básico que soporta los métodos HTTP estándar.
 * Inspirado en Laravel y Express.
 */

class Router {
    private $routes = [];
    private $prefix = '';
    
    /**
     * Registrar ruta GET
     */
    public function get($path, $handler) {
        $this->addRoute('GET', $path, $handler);
        return $this;
    }
    
    /**
     * Registrar ruta POST
     */
    public function post($path, $handler) {
        $this->addRoute('POST', $path, $handler);
        return $this;
    }
    
    /**
     * Registrar ruta PUT
     */
    public function put($path, $handler) {
        $this->addRoute('PUT', $path, $handler);
        return $this;
    }
    
    /**
     * Registrar ruta DELETE
     */
    public function delete($path, $handler) {
        $this->addRoute('DELETE', $path, $handler);
        return $this;
    }
    
    /**
     * Añadir prefijo a todas las rutas
     */
    public function prefix($prefix) {
        $this->prefix = $prefix;
        return $this;
    }
    
    /**
     * Registrar ruta interna
     */
    private function addRoute($method, $path, $handler) {
        $fullPath = $this->prefix . $path;
        
        // Convertir parámetros dinámicos :id a regex
        $pattern = preg_replace('/\:([a-zA-Z_]+)/', '(?P<$1>[^/]+)', $fullPath);
        $pattern = '#^' . $pattern . '$#';
        
        $this->routes[] = [
            'method' => $method,
            'path' => $fullPath,
            'pattern' => $pattern,
            'handler' => $handler
        ];
    }
    
    /**
     * Dispatcher la petición actual
     */
    public function dispatch() {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Manejar OPTIONS para CORS
        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
        
        // Buscar ruta coincidente
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            
            if (preg_match($route['pattern'], $uri, $matches)) {
                // Extraer parámetros nombrados
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                // Llamar al handler
                $this->callHandler($route['handler'], $params);
                return;
            }
        }
        
        // Ruta no encontrada
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Ruta no encontrada',
            'method' => $method,
            'uri' => $uri
        ]);
    }
    
    /**
     * Ejecutar el handler de la ruta
     */
    private function callHandler($handler, $params) {
        // El handler puede ser: 'Controller@method' o callable
        if (is_callable($handler)) {
            $handler($params);
            return;
        }
        
        if (str_contains($handler, '@')) {
            list($controllerName, $method) = explode('@', $handler);
            
            // Incluir archivo del controlador
            $controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';
            
            if (!file_exists($controllerFile)) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Controlador no encontrado: ' . $controllerName
                ]);
                return;
            }
            
            require_once $controllerFile;
            
            // Instanciar controlador
            $controllerClass = 'Controllers\\' . $controllerName;
            
            if (!class_exists($controllerClass)) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Clase de controlador no encontrada: ' . $controllerClass
                ]);
                return;
            }
            
            $controller = new $controllerClass();
            
            // Verificar que el método existe
            if (!method_exists($controller, $method)) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Método no encontrado: ' . $method
                ]);
                return;
            }
            
            // Llamar al método del controlador
            $controller->$method($params);
        }
    }
}
