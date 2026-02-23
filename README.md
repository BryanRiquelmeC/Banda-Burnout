# BURNOUT CHILE — Sitio Web Oficial

Sitio web de la banda de metal **BURNOUT**, originaria de Chillán, Chile.



## ¿Qué hace el sitio?

- Presenta a la banda (historia, integrantes, música)
- Muestra noticias y fechas de eventos
- Tiene un reproductor de música integrado
- Galería de fotos con lightbox
- Formulario de contacto
- Panel de administrador para gestionar eventos



## Tecnologías usadas

Frontend: HTML, CSS, JavaScript puro 
Hosting: [Netlify](https://netlify.com) 
Base de datos: [Supabase](https://supabase.com) (PostgreSQL) 
Autenticación: Supabase Auth (JWT) 
Fuentes: Google Fonts (Metal Mania, Oswald, Rajdhani) 



## Estructura del proyecto

```
burnout/
    index.html         # Toda la estructura HTML del sitio
    css/
       style.css       # Todos los estilos
    js/
       events.js       # Gestión de eventos + login admin
       ui.js           # Galería, menú, formulario de contacto
       player.js       # Reproductor de música
       slider.js       # Slider de noticias
    img/               # Imágenes y videos
    audio/             # Canciones del reproductor
```



## Base de datos (Supabase)

Hay dos tablas:

**`eventos`** — fechas de tocatas
```
id , fecha , nombre , lugar
```

**`contacto`** — mensajes del formulario de contacto
```
id , nombre , email , asunto , mensaje , fecha
```



## Panel de administrador

El panel permite agregar, editar y eliminar eventos desde la misma página web.

**¿Cómo acceder?**
1. Ir a la sección "Fechas y Eventos" en el sitio
2. Hacer clic en "Modo Administrador"
3. Ingresar el email y contraseña creados en Supabase Auth

**Seguridad:**
- El login usa Supabase Auth (el servidor verifica, nunca el navegador)
- Se genera un token JWT por sesión que expira automáticamente
- Solo usuarios autenticados pueden escribir en la base de datos (RLS)
- La contraseña nunca está en el código ni en GitHub

---

## Cómo correrlo localmente

Solo se necesita abrir el archivo con un servidor local. Con VSCode, se usa la extensión **Live Server** y clic en "Go Live".

> No se necesita instalar nada. Es HTML/CSS/JS puro y duro


## Cómo desplegar cambios

El sitio se despliega automáticamente en Netlify cada vez que se hace push a GitHub.
Netlify detecta el push y publica en `burnoutchile.com` en 1 minuto.



## Contacto del proyecto

- Sitio: [burnoutchile.com](https://burnoutchile.com)
- Instagram: [@burnout.chile](https://instagram.com/burnout.chile)
- GitHub: [BryanRiquelmeC/burnout-chile](https://github.com/BryanRiquelmeC/burnout-chile).
