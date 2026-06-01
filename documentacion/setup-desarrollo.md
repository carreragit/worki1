# Setup de desarrollo

Pasos necesarios para levantar el proyecto desde cero en un entorno local.

---

## 1. Crear las bases de datos en MySQL

Conectarse a MySQL (XAMPP, puerto 3306) y ejecutar:

```sql
-- BDs de desarrollo
CREATE DATABASE worki_auth_db;
CREATE DATABASE worki_user_db;
CREATE DATABASE worki_interaction_db;

-- BDs de pruebas
CREATE DATABASE worki_user_db_test;
CREATE DATABASE worki_interaction_db_test;
```

`worki_auth_db_test` se crea automaticamente al levantar auth-service con el perfil test.

---

## 2. Generar el JWT secret

El JWT secret debe ser el mismo en auth-service y gateway. Generarlo una sola vez y usarlo en ambos.

**Git Bash:**
```bash
openssl rand -base64 32
```

**PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

Copiar el resultado (ejemplo: `7tuMpniQAJwrJTFffmiEQ+jzercAb2GzdQ02WQf9/Qs=`).

---

## 3. Crear los archivos application-local.properties

Estos archivos NO estan en el repo. Cada integrante los crea manualmente.

**`backend/auth-service/src/main/resources/application-local.properties`:**
```properties
spring.datasource.password=TU_PASSWORD_MYSQL
jwt.secret=EL_SECRET_GENERADO_EN_PASO_2
```

**`backend/gateway/src/main/resources/application-local.properties`:**
```properties
jwt.secret=EL_SECRET_GENERADO_EN_PASO_2
```

El jwt.secret debe ser identico en ambos archivos.

**`backend/user-service/src/main/resources/application-local.properties`:**
```properties
spring.datasource.password=TU_PASSWORD_MYSQL
```

**`backend/interaction-service/src/main/resources/application-local.properties`:**
```properties
spring.datasource.password=TU_PASSWORD_MYSQL
```

---

## 4. Levantar los servicios

Todos los comandos se ejecutan desde `backend/`.

**Entorno de desarrollo (BD real):**
```bash
.\mvnw -pl auth-service spring-boot:run
.\mvnw -pl user-service spring-boot:run
.\mvnw -pl interaction-service spring-boot:run
.\mvnw -pl gateway spring-boot:run
```

**Entorno de pruebas (BD test):**
```bash
.\mvnw -pl auth-service spring-boot:run -Dspring-boot.run.profiles=local,test
.\mvnw -pl user-service spring-boot:run -Dspring-boot.run.profiles=local,test
.\mvnw -pl interaction-service spring-boot:run -Dspring-boot.run.profiles=local,test
.\mvnw -pl gateway spring-boot:run
```

Cada comando bloquea la terminal - usar una terminal por servicio.

---

## 5. Puertos

| Servicio | Puerto |
|---|---|
| Gateway | 8080 |
| auth-service | 8081 |
| user-service | 8082 |
| interaction-service | 8084 |

---

## 6. Probar que funciona

**Swagger (directo al servicio, sin gateway):**
```
http://localhost:8081/swagger-ui/index.html
```

**Postman (flujo real pasando por el gateway):**

1. Registro:
```
POST http://localhost:8080/api/auth/registro
Body: { "nombre": "...", "email": "...", "password": "..." }
```

2. Copiar el link de verificacion que aparece en la consola de auth-service:
```
[EMAIL] Verificacion para xxx@xxx.com: http://localhost:8080/api/auth/verificar-email?token=...
```

3. Abrir ese link en el navegador o hacer GET en Postman.

4. Login:
```
POST http://localhost:8080/api/auth/login
Body: { "email": "...", "password": "..." }
```

El login devuelve el JWT. Para endpoints protegidos agregar el header:
```
Authorization: Bearer EL_JWT_RECIBIDO
```

---

## 7. Levantar la app móvil (Expo)

Desde la carpeta `mobile/`:

```powershell
# Solo la primera vez — instala todas las dependencias
npm install

# Levantar el servidor de desarrollo de Expo
npm start
```

Expo abre una interfaz en el navegador con un QR. Para correr en dispositivo o emulador:

```powershell
npm run android   # emulador Android
npm run ios       # simulador iOS (solo Mac)
npm run web       # navegador
```

> La app móvil requiere los servicios del backend corriendo para funcionar correctamente.

---

## 8. Ejecutar los tests E2E

Los tests E2E prueban el flujo completo del sistema haciendo requests HTTP reales contra los servicios corriendo. Reemplazan las pruebas manuales con Postman para los flujos principales.

### Requisito previo

Los 4 servicios deben estar corriendo en modo test (ver sección 4). Abrir una terminal por servicio desde `backend/`:

```powershell
# Terminal 1
.\mvnw -pl gateway spring-boot:run

# Terminal 2
.\mvnw -pl auth-service spring-boot:run -Dspring-boot.run.profiles=local,test

# Terminal 3
.\mvnw -pl user-service spring-boot:run -Dspring-boot.run.profiles=local,test

# Terminal 4
.\mvnw -pl interaction-service spring-boot:run -Dspring-boot.run.profiles=local,test
```

Esperar a que los 4 digan `Started ... in X seconds` antes de correr los tests.

> En modo test el registro deja el email verificado automáticamente, sin necesitar SMTP ni copiar links de la consola.

### Ejecutar los tests

Desde `backend/`, cada servicio tiene sus propios tests:

```powershell
# Tests de autenticación (registro, login, validaciones)
.\mvnw -pl auth-service test

# Tests de perfiles, trabajadores y oficios
.\mvnw -pl user-service test

# Tests de solicitudes y calificaciones
.\mvnw -pl interaction-service test
```

Si los servicios no están corriendo, los tests se marcan como `SKIPPED` en lugar de `FAILED`.

### Qué cubre cada test

| Servicio | Tests | Qué prueba |
|----------|-------|-----------|
| auth-service | 5 | Registro, login con JWT, email duplicado (409), password incorrecta (401), password débil (400) |
| user-service | 12 | CRUD de perfiles, registro de trabajadores, creación y búsqueda de oficios |
| interaction-service | 15 | Crear solicitud, aceptar, completar, calificar, listar por cliente/trabajador, promedios |

### Cuándo correrlos

- Antes de mergear a `testing` para validar que nada se rompió
- Después de cambios en controllers, services o configuración de rutas