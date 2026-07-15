# BACKEND DE TELEMETRÍA Y SEGURIDAD ACÚSTICA (NESTJS)

## OBJETIVO

Implementar una API REST robusta y centralizada utilizando NestJS. Este sistema actúa como el núcleo de procesamiento y almacenamiento para la aplicación móvil, gestionando la identidad de los usuarios, la persistencia de datos de telemetría GPS en tiempo real en PostgreSQL 16, y orquestando un pipeline de inteligencia artificial. Dicho pipeline recibe ráfagas de audio, las procesa a través del modelo VGGish para extraer características acústicas (embeddings), y las indexa en la base de datos vectorial Qdrant para la detección instantánea de situaciones de pánico.

## DESCRIPCIÓN DE ENDPOINTS Y COMUNICACIÓN

El backend se comunica con la aplicación móvil empleando el protocolo HTTP a través de una arquitectura REST. Utiliza principalmente métodos POST para garantizar el envío seguro de cargas útiles (payloads) estructuradas:

- **Gestión de Identidad:** Los endpoints `/auth/registro` y `/auth/login` (POST) reciben credenciales en formato JSON para registrar nuevos usuarios (conductores o pasajeros) en PostgreSQL y retornar tokens JWT (Json Web Tokens) que aseguran las sesiones.

- **Telemetría GPS:** Un endpoint dedicado (POST) recibe el flujo continuo de coordenadas (latitud y longitud) emitido por el dispositivo móvil, almacenando este histórico de rutas de forma relacional para su posterior consulta y trazabilidad.

- **Seguridad y Pánico:** Un endpoint especializado recibe fragmentos de audio (Multipart/FormData). Este método sirve como puente hacia el modelo VGGish, el cual transforma la señal acústica en vectores matemáticos (espectrogramas de audio) que finalmente se insertan en Qdrant para la búsqueda por similitud de patrones de emergencia.

## REQUISITOS

- **Node.js** instalado en el entorno de desarrollo y gestor de paquetes pnpm activo.

- **Docker y Docker Compose** instalados para levantar los servicios locales (PostgreSQL 16 y Qdrant) sin contaminar el sistema operativo.

- **Entorno de variables** .env configurado en la raíz con credenciales de base de datos, secretos JWT y puertos de los servicios.

- **Microservicio de pyhton para AI acustica:** Descargar el servicio de `https://github.com/pacisnerosi24/bustrack-ai-sonido.git`.

## ARQUITECTURA: MONOLITO MODULAR Y HEXAGONAL

El proyecto no organiza el código por el tipo de archivo (controladores con controladores, servicios con servicios), sino que aplica un patrón avanzado de diseño para garantizar escalabilidad a largo plazo:

- **Monolito Modular:** Toda la aplicación se despliega como un único servidor (monolito), pero internamente está estrictamente dividida por "Dominios de Negocio" (`identidad`, `logistica`, `seguridad`). Si en el futuro el sistema crece, un módulo puede separarse fácilmente para convertirse en un microservicio independiente sin reescribir el código.

- **Arquitectura Hexagonal (Puertos y Adaptadores):** Dentro de cada módulo, el código se divide en tres capas concéntricas. El `Dominio (reglas de negocio)` está aislado en el centro absoluto y no sabe nada de NestJS ni de bases de datos. La capa de `Aplicación contiene los Casos de Uso y define interfaces ("Puertos")`. Finalmente, la capa externa de `Infraestructura implementa esos puertos mediante "Adaptadores" (Controladores REST, repositorios de PostgreSQL, clientes HTTP hacia Qdrant/VGGish)`. Si se cambia o se agrega una nueva tecnologia o herramienta el dominio y la aplicación no sufren ninguna modificación.

## ESTRUCTURA DEL PROYECTO

```bash
BACKEND-TRANSPORTE/
        ├── src/
        │ ├── identidad/                # Módulo modular: Autenticación, Usuarios y Roles
        │ ├── logistica/                # Módulo modular: Telemetría GPS, Rutas y Flotas
        │ └── seguridad/                # Módulo modular: Pánico, Audio y Embeddings (IA)
        │   ├── aplicacion/             # Capa de Orquestación (Hexagonal)
        │   │ ├── casos-uso/            # Lógica de flujo (ej. AnalizarAudioUseCase)
        │   │ └── puertos/              # Interfaces (Contratos para la BD o VGGish)
        │   ├── dominio/                # Capa Central (Hexagonal)
        │   │ ├── entidades/            # Reglas de negocio puras (ej. AlertaPanico)
        │   │ └── value-objects/        # Tipos primitivos validados (ej. CoordenadaGPS)
        │   └── infraestructura/        # Capa Externa (Hexagonal)
        │     ├── adaptadores-entrada/  # Cómo recibe datos el sistema
        │     │ ├── controladores/      # Endpoints REST (Auth, GPS, Audio)
        │     │ └── dto/                # Validadores de carga útil (class-validator)
        │     └── adaptadores-salida/   # Cómo el sistema habla con el exterior
        │       └── (Repositorios PostgreSQL, Clientes Qdrant, etc.)
        ├── docker-compose.yml          # Orquestación de DB (PostgreSQL 16, Qdrant)
        ├── Dockerfile                  # Receta de contenerización de la API
        └── .env                        # Variables de entorno secretas
```