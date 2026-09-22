# Subir el proyecto a GitHub

Repositorio destino: **https://github.com/davybendezu/marlep**

Este documento cubre subir el monorepo completo (`backend/`, `frontend/`, `imagen/`) a ese repositorio por primera vez. El directorio de trabajo actual **no es un repo Git todavia** (`git status` devuelve `fatal: not a git repository`).

## 0. Antes de empezar: no subir secretos

`backend/.env` tiene la contrasena real de la base de datos Neon en texto plano. Ya se agrego un [`.gitignore`](.gitignore) en la raiz que excluye:

- `node_modules/` (backend y frontend)
- `frontend/dist/` (build de produccion)
- `backend/.env` (credenciales)

`backend/.env.example` **si** se sube (no tiene credenciales reales, es la plantilla).

> Verificar antes del primer commit que `backend/.env` no quede incluido (ver paso 3, `git status` debe mostrarlo ausente de la lista de "Changes to be committed").

## 1. Crear el repositorio vacio en GitHub

Si `https://github.com/davybendezu/marlep` todavia no existe:

1. Entrar a [github.com/new](https://github.com/new).
2. **Repository name**: `marlep`.
3. **Visibility**: Private (recomendado — ver nota en [DESPLIEGUE.md](DESPLIEGUE.md), Vercel soporta repos privados sin costo extra).
4. **No** marcar "Add a README", "Add .gitignore" ni "Choose a license" (el repo local ya tiene contenido y `.gitignore` propio; inicializar el repo remoto con archivos genera conflictos al hacer el primer push).
5. Crear el repositorio.

Alternativa con GitHub CLI (`gh`), si esta instalado y autenticado (`gh auth status`):

```bash
gh repo create davybendezu/marlep --private --source=. --remote=origin
```

(Este comando crea el repo remoto y configura el remote `origin` en un solo paso — si se usa, saltar al paso 4.)

## 2. Inicializar Git localmente

Desde la raiz del proyecto (`c:\App_work_2026\renato\marlep`):

```bash
git init
git add .
git status
```

Revisar la salida de `git status`: debe listar `backend/`, `frontend/`, `imagen/`, `CLAUDE.md`, `DESPLIEGUE.md`, `README.md`, `.gitignore`, etc., pero **no** `backend/.env`, ni ningun `node_modules/`. Si aparecen, revisar que el `.gitignore` este en la raiz y volver a correr `git add .`.

```bash
git commit -m "Version inicial de Marlep Cosmetics"
```

## 3. Conectar con el repositorio remoto

Si no se uso `gh repo create` en el paso 1:

```bash
git branch -M main
git remote add origin https://github.com/davybendezu/marlep.git
```

## 4. Subir el codigo

```bash
git push -u origin main
```

Si GitHub pide autenticacion: usar un [Personal Access Token](https://github.com/settings/tokens) como password (GitHub ya no acepta la contrasena de la cuenta directamente para HTTPS), o configurar Git Credential Manager / SSH.

## 5. Verificar

Entrar a `https://github.com/davybendezu/marlep` y confirmar que:

- Estan las carpetas `backend/`, `frontend/`, `imagen/`.
- **No** aparece `backend/.env` en el listado de archivos.
- El repo quedo marcado como **Private** (Settings → General → Danger Zone muestra "This repository is private" o el badge junto al nombre lo indica).

## 6. Siguientes pasos

Con el repo ya en GitHub, continuar con [DESPLIEGUE.md](DESPLIEGUE.md) seccion 2.2 (crear el proyecto backend en Vercel importando `marlep`) y seccion 3.3 (proyecto frontend).

## Cambios futuros

Para subir cambios despues del primer push:

```bash
git add .
git commit -m "Descripcion del cambio"
git push
```
