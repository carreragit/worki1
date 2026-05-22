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