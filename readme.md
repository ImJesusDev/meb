# Tecnologia
  - NodeJS / ExpressJs
  - Typescript
  - MongoDB
  - JWT
  - Docker / Kubernetes
  - Nats Streaming Server

# General

Este proyecto fue desarrollado siguiendo los principios basicos de microservicios. Los diferentes servidores (microservicios) se comunican en forma de eventos usando el servidor NATS, ejemplo:
 
 - Cuando un usuario se registra, se emite el evento `UserCreatedPublisher` (auth/src/events/publishers/user-created-publisher.ts)
 - Los microservicios interesados en procesar este evento se subscriben al mismo con un listener `UserCreatedListener`(notifications/src/events/listeners/user-created-listener.ts)
 - El evento es procesado y se hace el `acknowledge` del mismo (`msg.ack();`)
 - En caso de que el evento no sea procesado exitosamente, se seguira reintentando.


# Estructura del proyecto
  - auth: Microservicio de autenticacion / usuarios
  - clients: Microservicio encargado de los clientes
  - locations: Microservicio encargado de las ubicaciones
  - notifications: Microservicio encargado del envio de notificaciones 
  - resources: Microservicio encargado del manejo de recursos
  - travels: Microservicio encargado de los viajes
  - infra: Directorio donde se encuentra la configuracion de despliegue en kubernetes
  - common: Repositorio independiente donde se encuentra codigo que es comun para los proyectos, publicado como paquete de NPM
  - .github/workflows: Directorio en el que se encuentran las acciones de GitHub para el despliegue automatico de los microservicios

# Estructura de los microservicios

Cada microservicio cuenta con la siguiente estructura:

  - `Dockerfile` Configuracion Docker
  - `src/nats.ts` Singleton encargado de la conexion con el servidor NATS
  - `src/index.ts` Punto de entrada, conexion NATS, Mongo, Listeners
  - `src/app.ts` Configuracion de middlewares / rutas.
  - `src/routers` Directorio donde se encuentran todas las rutas del microservicio
  - `src/models` Directorio donde se encuentran los modelos Mongo
  - `src/events` Directorio donde se encuentran los eventos que maneja el microservicios, se dividen en `Publisher` (Eventos que emite) y `Listener` eventos que escucha o recibe.
  - `src/test` Configuracion de pruebas unitarias
  - `__mocks__` Mocks para la realizacion de pruebas unitarias.
  - `__test__` Directorio en los que se definen pruebas unitarias.


# Infraestructura

La configuracion de la infraestructura se encuentra en el directorio `infra`, y se encuentra dividida de la siguientemaneta:

  - `infra/k8s` Configuracion base de Kubernetes, debe de aplicarse ya sea en entorno de prueba o de produccion, se encarga del despliegue de cada uno de los microservicios y las bases de datos asociadas.
  - `infra/k8s-dev` Configuracion que debe aplicarse unicamente en entorno local. Se encarga de configurar nginx localmente
  - `infra/k8s-prod` Configuracion que debe aplicarse unicamente en entorno de produccion: Se en carga de configurar nginx para produccion con certificado SSL generado con LetsEncrypt.

## Ejecutando el proyecto localmente

La forma mas sencilla de ejecutar el proyecto localmente es con la ayuda de [Skaffold](https://skaffold.dev/). En la raiz del proyecto se encuentra el archivo de configuracion `skaffold.yaml` en el que basicamente se definen los manifest de kubernetes que se desean desplegar localmente. En el cluster de kubernetes deben de estar creados los secrets mencionados mas adelante, y debe de estar habilitado el Ingress de Nginx: https://kubernetes.github.io/ingress-nginx/deploy/


Una vez instalado skaffold, se debe de ejecutar el comando `skaffold dev` el cual se encargara de desplegar todos los servicios de los manifest especificados.

# IMPORTANTE
AL MOMENTO DE EJECUTAR EL COMANDO `skaffold dev`, ES IMPORTANTE VALIDAR QUE NOS ENCONTRAMOS CONECTADOS A EL CLUSTER LOCAL DE KUBERNETES (context) Y NO AL DE PRODUCCION, DE LO CONTRARIO SE PODRIAN ELIMINAR LOS SERVICIOS DESPLEGADOS Y TODA LA INFORMACION DE LAS BASES DE DATOS.

Se puede validar el context actual con el comando `kubectl config get-contexts`
### Secrets K8S

Los siguentes secrets deben de estar configurados en el cluster de kubernetes
`kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf`
`kubectl create secret generic spaces-key --from-literal=SPACES_KEY=asd`
`kubectl create secret generic spaces-secret --from-literal=SPACES_SECRET=asdasd`
`kubectl create secret generic email-password --from-literal=EMAIL_PASSWORD=asdasd`