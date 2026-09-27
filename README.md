# Nódos — Árbol de Habilidades Interactivo del Lenguaje Visual

**Entrega final — Curso de Inteligencia Artificial para Programadores (UTN.BA)**

🔗 **App en producción:** https://tpia.vercel.app/
🔗 **Repositorio:** https://github.com/arossetti3008/TPIA

## Qué es

Nódos es una aplicación web que ayuda a estudiantes de Lenguaje Visual a repasar
conceptos de diseño (Contraste, Ritmo, Jerarquía, Gestalt, Tensión) de forma
autónoma. En vez de un quiz de puntaje fijo, cada concepto tiene un **tutor
conversacional basado en IA (Google Gemini)** que hace preguntas guía,
da feedback en lenguaje natural, y evalúa si el estudiante demuestra dominio
real antes de desbloquear el siguiente nodo del árbol.

## Cómo probarla

1. Entra a [tpia.vercel.app](https://tpia.vercel.app/) y registrate con cualquier email.
2. Vas a ver el árbol de habilidades: el primer nodo (Contraste) está disponible,
   el resto se desbloquea a medida que dominás los anteriores.
3. Entra a un nodo, conversá con el tutor, y cuando te sientas listo apretá
   "Marcar como dominado" para que la IA te evalúe.

## Estructura del repositorio

Este es un monorepo con dos proyectos independientes:

```
TPIA/
├── Backend/     → API REST (Node.js + Express + MongoDB), desplegada en Render
├── Frontend/    → Interfaz web (React + Vite), desplegada en Vercel
└── DEPLOYMENT.md → Cómo está configurado el despliegue (sin secretos)
```

Cada carpeta tiene su propio `README.md` con instrucciones para correrla en local.

## Stack técnico (resumen)

| Componente | Tecnología |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Base de datos | MongoDB Atlas |
| Modelo de IA | Google Gemini API |
| Despliegue | Vercel (frontend) + Render (backend) |

El detalle completo de arquitectura, justificación del stack, evaluación UX/UI
y consideraciones de ciberseguridad está en el informe de la entrega
(`Nodos_Documentacion_Tecnica.pdf`).

## Funcionalidad de administrador

Un usuario con rol `admin` puede dar de alta o editar conceptos nuevos desde
la interfaz (Perfil → Panel de administración), sin tocar código: el tutor de
IA genera preguntas y evaluaciones automáticamente a partir del concepto y la
descripción que se carguen.
