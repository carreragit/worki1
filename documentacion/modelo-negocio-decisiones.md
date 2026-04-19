# Modelo de Negocio y Decisiones de Arquitectura

## 1. Decisión: No existe Publication Service

### ¿Por qué se eliminó?

Inicialmente se consideró un `publication-service` separado para gestionar publicaciones de servicios. Se eliminó porque **la publicación no es una entidad independiente** — es simplemente el perfil de oficio del trabajador visto desde la perspectiva del cliente.

### ¿Cómo se reemplaza?

Cada `PerfilOficio` dentro de `user-service` **es** la publicación. Cuando un trabajador configura su perfil de gasfiter, ese perfil aparece automáticamente como resultado en las búsquedas.

```
Usuario
 ├── PerfilCliente       ← busca servicios
 └── PerfilTrabajador
      ├── PerfilOficio: Gasfiter
      │    ├── precioBase: $10.000
      │    ├── experiencia, descripción, ubicación
      │    └── Servicios específicos:
      │         ├── "Cambio de calefón"  — $40.000
      │         ├── "Destape de cañerías" — $25.000
      │         └── "Instalación de llave" — $15.000
      └── PerfilOficio: Electricista
           ├── precioBase: $12.000
           └── Servicios específicos: ...
```

`BusquedaService` en `user-service` lista los `PerfilOficio` como si fueran publicaciones, aplicando filtros por oficio, ubicación y disponibilidad.

---

## 2. Modelo de cobro: comisión sobre mano de obra

Worki opera bajo el mismo modelo que Uber, Airbnb y Fiverr: **retener un porcentaje de cada transacción**.

### Precio base = mano de obra únicamente

Los materiales y repuestos **siempre corren por cuenta del cliente** y se cotizan aparte. Esto es como funciona en la práctica real — el gasfiter cobra su trabajo, no las piezas.

El precio publicado siempre debe ser explícito:

```
Cambio de calefón
$40.000 · Solo mano de obra
⚠️ Repuestos y materiales no incluidos, se cotizan aparte
```

### ¿Por qué solo sobre mano de obra?

- Es el único valor controlable y conocido antes de ejecutar el trabajo
- Elimina ambigüedad de "salió más caro de lo esperado"
- Las piezas varían según el caso específico y no pueden fijarse de antemano

### Flujo de pago

```
Trabajador define precio de mano de obra (ej: $40.000)
        ↓
Worki aplica markup internamente (ej: 15%)
        ↓
Cliente ve precio final ($46.000) — etiquetado como "mano de obra"
        ↓
Cliente paga $46.000 a Worki
        ↓
Worki transfiere $40.000 al trabajador
```

### Alcance académico

Integrar pagos reales implica complejidad fuera del scope del proyecto de título (Transbank requiere afiliación comercial, Mercado Pago/Stripe requieren cuenta empresarial, implicancias tributarias bajo **Ley 21.431**).

**Solución:** implementar el flujo completo en **ambiente sandbox** de Mercado Pago o Stripe (gratuito), demostrando que se entiende el modelo sin mover dinero real.

---

## 3. Modelo freemium: perfil destacado

Worki tiene dos fuentes de ingreso:

| Fuente | Descripción |
|---|---|
| Comisión por transacción | % sobre cada trabajo completado |
| Suscripción destacado | Pago mensual por mayor visibilidad |

### ¿Dónde vive esta lógica?

En `user-service`, directamente en `Perfil` o `PerfilTrabajador`:

```java
destacado: boolean
fechaVencimientoDestacado: LocalDate
```

`BusquedaService` ordena los resultados priorizando perfiles destacados. No requiere microservicio separado.

### Representación visual

```
[⭐ DESTACADO]  Juan Pérez — Gasfiter
$40.000 · Cambio de calefón · 4.9★ (47 reseñas)
```

---

## 4. Retención de usuarios en la plataforma

### El problema

Nada técnico impide que cliente y trabajador se contacten directamente después de conocerse en Worki, saltándose la comisión.

### La solución no es técnica, es de valor

El incentivo para seguir usando la plataforma viene del valor que entrega, no de restricciones:

**Para el cliente:**
- Trabajadores verificados con historial real
- Sistema de calificaciones — sabe con quién trata antes de contratar
- Respaldo ante problemas — Worki intermedia en conflictos
- Facilidad de pago — sin transferencias ni efectivo

**Para el trabajador:**
- Flujo constante de nuevos clientes
- Reputación acumulada — 50 reseñas de 5 estrellas son valiosas y costosas de perder
- Cobro gestionado — no tiene que perseguir pagos

### Mitigación conocida

Este es un riesgo inherente al modelo de marketplace y es reconocido en la industria. La retención a largo plazo depende de que la plataforma entregue más valor del que cuesta la comisión. Para Worki, la reputación acumulada es el principal activo que retiene a los trabajadores.

---

## 5. Sistema de comprobación y resolución de disputas

Ante cualquier reclamo sobre materiales (precio, calidad, o si realmente fueron necesarios), tanto el cliente como el trabajador pueden subir comprobantes asociados a una solicitud específica.

### ¿Por qué es necesario?

- El precio publicado es solo mano de obra — los materiales se acuerdan aparte
- Sin evidencia, cualquier disputa queda en "mi palabra contra la tuya"
- Worki necesita respaldo documental para intermediar con criterio

### ¿Dónde vive?

Módulo `comprobante` dentro de `interaction-service`, asociado a una `Solicitud`:

```
Solicitud
 └── Comprobante
      ├── tipo: BOLETA / FACTURA / FOTO_MATERIAL
      ├── archivoUrl: string          ← imagen o PDF subido
      ├── montoMaterial: int          ← monto declarado
      ├── descripcion: string
      └── subidoPor: TRABAJADOR / CLIENTE
```

### Flujo ante un reclamo

```
Trabajo completado
        ↓
Cliente o trabajador abre disputa
        ↓
Ambas partes suben comprobantes (boletas, fotos)
        ↓
Admin de Worki revisa evidencia
        ↓
Resolución documentada
```

### En el frontend

- Page `Comprobantes/` — vista por solicitud con lista de archivos subidos
- Componente `SubirComprobante/` — formulario de carga con tipo y monto

---

## 6. Resumen de arquitectura resultante

| Decisión | Resultado |
|---|---|
| Publication Service | Eliminado — reemplazado por `PerfilOficio` en `user-service` |
| Modelo de cobro | Comisión sobre mano de obra + suscripción destacado |
| Precio de materiales | Siempre por cuenta del cliente, fuera del flujo de pago |
| Perfil destacado | Campo en `user-service`, sin microservicio separado |
| Pagos | Sandbox académico (Mercado Pago / Stripe) |
| Retención | Modelo de reputación acumulada, no restricción técnica |
| Comprobantes | Módulo en `interaction-service`, asociado a `Solicitud` |
