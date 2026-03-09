# Despliegue en suempresa.com

Guía paso a paso para poner la aplicación en producción usando Docker + Nginx + Let's Encrypt.

## Requisitos del servidor

- Ubuntu 22.04 LTS (o similar)
- Docker Engine ≥ 24
- Docker Compose ≥ 2.20
- Dominio `suempresa.com` apuntando a la IP del servidor (registros A/AAAA)
- Puertos 80 y 443 abiertos en el firewall

---

## 1. Clonar el repositorio

```bash
git clone <url-del-repo> /opt/sysccom
cd /opt/sysccom
git checkout claude/deploy-suempresa-domain-cctwl
```

## 2. Configurar variables de entorno

```bash
cp .env.production.example .env
nano .env          # rellena todos los valores
```

## 3. Obtener certificado SSL (primera vez)

Antes de levantar Nginx con SSL, obtén el certificado:

```bash
# Levanta sólo certbot y nginx en modo HTTP (sin SSL)
docker compose up -d nginx certbot

# Solicita el certificado
docker compose run --rm certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --email admin@suempresa.com \
  --agree-tos --no-eff-email \
  -d suempresa.com -d www.suempresa.com
```

## 4. Levantar todos los servicios

```bash
docker compose up -d --build
```

## 5. Ejecutar migraciones de base de datos

```bash
docker compose exec app npx prisma migrate deploy
```

## 6. (Opcional) Poblar la base de datos con datos iniciales

```bash
docker compose exec app node --import tsx/esm prisma/seed.ts
```

## 7. Verificar que todo está corriendo

```bash
docker compose ps
docker compose logs -f app
```

Visita `https://suempresa.com` en el navegador.

---

## Comandos útiles

| Acción | Comando |
|--------|---------|
| Ver logs | `docker compose logs -f` |
| Reiniciar app | `docker compose restart app` |
| Actualizar app | `git pull && docker compose up -d --build app` |
| Backup DB | `docker compose exec postgres pg_dump -U sysccom sysccom_db > backup.sql` |
| Restaurar DB | `docker compose exec -T postgres psql -U sysccom sysccom_db < backup.sql` |

---

## Renovación automática de certificados

El servicio `certbot` en `docker-compose.yml` intenta renovar el certificado cada 12 horas automáticamente. Reinicia Nginx después de renovar:

```bash
docker compose exec nginx nginx -s reload
```
