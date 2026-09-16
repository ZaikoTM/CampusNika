# Desplegar `verify-admin` — paso a paso

## 0. Prerrequisito: Supabase CLI instalada
```bash
npm install -g supabase
```

## 1. Login y vinculación al proyecto
```bash
supabase login
supabase link --project-ref pswjmouuyaxueaqqglko
```

## 2. Configurar el secreto de la clave maestra
Elegí una clave nueva (no reutilices la vieja `43538879Augusto#` — quedó expuesta en el
código fuente del cliente durante todo el tiempo que estuvo ahí, hay que asumirla comprometida):

```bash
supabase secrets set ADMIN_MASTER_PASSWORD="tu-clave-nueva-y-larga-aca"
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` ya existen automáticamente
como secretos en todo proyecto de Supabase — no hace falta configurarlos a mano.

## 3. Copiar el archivo de la función
Poné `verify-admin/index.ts` en tu repo local, respetando esta estructura de carpetas:
```
supabase/
  functions/
    verify-admin/
      index.ts
```

## 4. Deploy
```bash
supabase functions deploy verify-admin
```

## 5. Probar desde la terminal (opcional, antes de tocar el frontend)
Necesitás un access token válido de un usuario logueado (lo sacás de
`(await supabase.auth.getSession()).data.session.access_token` en la consola del navegador
con tu sesión abierta):

```bash
curl -i -X POST 'https://pswjmouuyaxueaqqglko.supabase.co/functions/v1/verify-admin' \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"masterPassword":"tu-clave-nueva-y-larga-aca"}'
```

Respuesta esperada: `{"success":true,"role":"admin"}` y tu fila en `profiles` debería
quedar con `role = 'admin'`. Confirmalo en el Table Editor de Supabase.

## 6. Rotación futura
Si alguna vez sospechás que la clave se filtró, `supabase secrets set` de nuevo con un
valor nuevo — no requiere volver a hacer deploy del código.
