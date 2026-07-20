# BattleQuiz

Plataforma de trivia. Dos partes independientes que se despliegan por separado:

```
BattleQuiz/
├── backend/    API NestJS + Prisma + PostgreSQL (Neon). Se despliega en Render.
├── mobile/     App .NET MAUI (MVVM + Shell). Se compila en APK/IPA e instala en el celular.
└── docs/       Diagramas y notas de arquitectura.
```

## Cómo encaja todo

```
[ App MAUI en el celular ]  ──HTTP──►  [ API NestJS en Render ]  ──►  [ PostgreSQL en Neon ]
        mobile/                              backend/                      (Neon cloud)
```

La app móvil **no** contiene el backend: solo guarda la URL de la API y le pide
datos por HTTP. Por eso cada parte se construye y despliega por su cuenta.

## Backend (empezar por acá)

Es lo que está terminado como base desplegable. Ver:

- `backend/README.md` — arquitectura, cómo correrlo local, pruebas.
- `backend/DEPLOY-RENDER-NEON.md` — desplegar en Render con base Neon, paso a paso.

Estado: dominio + infraestructura + configuración listos; 11 pruebas en verde.
Los endpoints de negocio (Auth, Jugar, Perfil, Ranking, ...) son la siguiente etapa.

## Mobile

Esqueleto MAUI de la etapa 1 (arranque, Shell, MVVM base). Las 12 pantallas se
construyen en una etapa posterior. Consumirá la API del backend por HTTP.

## Historial

La primera versión del backend se diseñó en .NET; se reescribió en NestJS para
desplegarlo en Render junto con Neon. El diseño de dominio, la base de datos y
el frontend MAUI se conservaron.
