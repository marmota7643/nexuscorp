# NexusCorp · modo híbrido

Los jugadores no crean cuentas ni inician sesión. Cada navegador genera un identificador local aleatorio, guarda la partida localmente y, cuando se habilita la nube, sincroniza una empresa anónima.

## Activar la administración global

1. Crea o abre un proyecto de Supabase y ejecuta [`supabase/schema.sql`](supabase/schema.sql) en el SQL Editor.
2. Instala Supabase CLI, inicia sesión y vincula el proyecto.
3. Configura los secretos de la función. Sustituye los valores por secretos largos y privados:

   ```powershell
   supabase secrets set NEXUS_ADMIN_PASSPHRASE="tu-clave-larga" NEXUS_ADMIN_TOKEN_SECRET="un-secreto-aleatorio-de-32-caracteres-o-mas"
   ```

4. Despliega la función:

   ```powershell
   supabase functions deploy nexus-api
   ```

5. En [`js/cloud-config.js`](js/cloud-config.js), cambia `enabled` a `true` y sustituye `TU-PROYECTO` por el dominio de tu proyecto.

Al abrir **Admin**, introduce la clave una vez. El servidor emite un token asociado a ese navegador, de modo que en aperturas posteriores te reconoce automáticamente como administrador web. El token se valida en el servidor; no hay claves de servicio ni contraseñas de administrador dentro del frontend.

> No uses `SUPABASE_SERVICE_ROLE_KEY` en `cloud-config.js` ni en ningún archivo que se publique al navegador.
