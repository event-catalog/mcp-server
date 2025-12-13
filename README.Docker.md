# Docker Deployment Guide

This guide explains how to run the EventCatalog MCP Server using Docker.

## Quick Start

### 1. Build the Docker Image

```bash
docker build -f Dockerfile.server -t eventcatalog-mcp-server:latest .
```

### 2. Run the Container

```bash
docker run -d \
  --name eventcatalog-mcp-server \
  -p 3000:3000 \
  -e EVENTCATALOG_URL="https://your-eventcatalog.com" \
  -e EVENTCATALOG_SCALE_LICENSE_KEY="your-license-key" \
  -e MCP_TRANSPORT="http" \
  -e PORT="3000" \
  eventcatalog-mcp-server:latest
```

### 3. View Logs

```bash
docker logs -f eventcatalog-mcp-server
```

### 4. Stop the Container

```bash
docker stop eventcatalog-mcp-server
docker rm eventcatalog-mcp-server
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EVENTCATALOG_URL` | Yes | - | URL to your EventCatalog instance |
| `EVENTCATALOG_SCALE_LICENSE_KEY` | Yes | - | Your EventCatalog Scale license key |
| `MCP_TRANSPORT` | No | `http` | Transport mode: `stdio` or `http` |
| `PORT` | No | `3000` | Port for HTTP server (when using http transport) |
| `BASE_PATH` | No | `/` | Base path for the server |
| `NODE_ENV` | No | `production` | Node environment |

### Transport Modes

#### HTTP Mode (Recommended for Docker)
- Default mode for Docker deployments
- Exposes REST API endpoints
- Includes health checks
- Easy to integrate with load balancers and reverse proxies

```bash
docker run -d \
  -p 3000:3000 \
  -e MCP_TRANSPORT=http \
  -e EVENTCATALOG_URL="https://your-eventcatalog.com" \
  -e EVENTCATALOG_SCALE_LICENSE_KEY="your-key" \
  eventcatalog-mcp-server:latest
```

#### STDIO Mode
- Uses standard input/output for communication
- Useful for local development or CLI integrations
- No port exposure needed

```bash
docker run -it \
  -e MCP_TRANSPORT=stdio \
  -e EVENTCATALOG_URL="https://your-eventcatalog.com" \
  -e EVENTCATALOG_SCALE_LICENSE_KEY="your-key" \
  eventcatalog-mcp-server:latest
```

## Health Checks

The Docker container includes a built-in health check for HTTP mode:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' eventcatalog-mcp-server

# Using curl
curl http://localhost:3000/health
```

## Production Deployment

### With Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name mcp.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### With Docker Swarm

```bash
# Deploy as a service
docker service create \
  --name eventcatalog-mcp-server \
  --replicas 3 \
  --publish 3000:3000 \
  -e EVENTCATALOG_URL="https://your-eventcatalog.com" \
  -e EVENTCATALOG_SCALE_LICENSE_KEY="your-key" \
  eventcatalog-mcp-server:latest
```

### With Kubernetes

Create a deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eventcatalog-mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: eventcatalog-mcp-server
  template:
    metadata:
      labels:
        app: eventcatalog-mcp-server
    spec:
      containers:
      - name: eventcatalog-mcp-server
        image: eventcatalog-mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: EVENTCATALOG_URL
          valueFrom:
            secretKeyRef:
              name: eventcatalog-secrets
              key: url
        - name: EVENTCATALOG_SCALE_LICENSE_KEY
          valueFrom:
            secretKeyRef:
              name: eventcatalog-secrets
              key: license-key
        - name: MCP_TRANSPORT
          value: "http"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 3
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: eventcatalog-mcp-server
spec:
  selector:
    app: eventcatalog-mcp-server
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Troubleshooting

### View Logs

```bash
docker logs -f eventcatalog-mcp-server
```

### Check Container Status

```bash
docker ps -a | grep eventcatalog-mcp-server
```

### Enter Container Shell

```bash
docker exec -it eventcatalog-mcp-server sh
```

### Rebuild Image

```bash
docker build -f Dockerfile.server --no-cache -t eventcatalog-mcp-server:latest .
```

## Security Best Practices

The Dockerfile follows industry security best practices. For detailed security information, see [SECURITY.md](./SECURITY.md).

**Quick Security Checklist:**

1. ✅ **Runs as non-root user** - Container uses `nodejs` user (UID 1001)
2. ✅ **Pinned base image** - Uses `node:22.21.1-alpine3.21` (not `latest`)
3. ✅ **Multi-stage build** - Minimizes final image size to ~208MB
4. ✅ **Security updates** - Alpine packages updated during build
5. ✅ **No secrets in image** - Uses environment variables
6. ✅ **Health checks** - Built-in monitoring support
7. ✅ **Minimal attack surface** - Only production dependencies included

**Production Recommendations:**

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Use secrets management** - Docker secrets, Kubernetes secrets, or vault
3. **Limit resources** - Configure CPU and memory limits
4. **Use HTTPS** - Always use a reverse proxy with SSL/TLS in production
5. **Scan for vulnerabilities** - Use `docker scout` or `trivy` regularly
6. **Keep updated** - Rebuild images regularly with security patches

## Updating

```bash
# Pull latest changes
git pull

# Rebuild the image
docker build -f Dockerfile.server -t eventcatalog-mcp-server:latest .

# Stop and remove old container
docker stop eventcatalog-mcp-server
docker rm eventcatalog-mcp-server

# Start new container with updated image
docker run -d \
  --name eventcatalog-mcp-server \
  -p 3000:3000 \
  -e EVENTCATALOG_URL="https://your-eventcatalog.com" \
  -e EVENTCATALOG_SCALE_LICENSE_KEY="your-license-key" \
  -e MCP_TRANSPORT="http" \
  eventcatalog-mcp-server:latest
```

## Support

For issues and questions:
- GitHub: https://github.com/event-catalog/mcp-server
- EventCatalog Cloud: https://eventcatalog.cloud

