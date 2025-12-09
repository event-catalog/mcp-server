# Security Best Practices

This document outlines the security measures implemented in the EventCatalog MCP Server Docker container.

## Docker Security Implementations

### ✅ Image Security

#### 1. **Pinned Base Image**
- Uses specific Node.js version: `node:22.12.0-alpine3.21`
- Prevents unexpected changes from automatic updates
- Ensures reproducible builds
- Alpine Linux reduces attack surface (smaller image size)

#### 2. **Multi-Stage Build**
- Builder stage includes only build dependencies
- Production stage includes only runtime dependencies
- Reduces final image size from ~500MB to ~208MB
- Minimizes attack surface by excluding dev tools

#### 3. **Package Version Pinning**
- pnpm pinned to version `9.15.0`
- All dependencies locked via `pnpm-lock.yaml`
- Prevents supply chain attacks from unexpected updates

### ✅ Runtime Security

#### 4. **Non-Root User**
- Container runs as user `nodejs` (UID 1001)
- User created with minimal privileges
- Prevents privilege escalation attacks
- Verified with: `docker inspect --format='{{.Config.User}}' eventcatalog-mcp-server:latest`

#### 5. **File Permissions**
- All application files owned by `nodejs:nodejs`
- `--chown` flag used during COPY operations
- Prevents unauthorized file modifications

#### 6. **Security Updates**
- Alpine packages updated during build: `apk update && apk upgrade`
- Ensures latest security patches are applied
- Old cache files removed to reduce image size

### ✅ Dependency Management

#### 7. **Clean Package Manager Cache**
- npm cache cleaned: `npm cache clean --force`
- pnpm store pruned: `pnpm store prune`
- Temporary files removed: `rm -rf /var/cache/apk/* /tmp/* /var/tmp/*`
- Reduces image size and attack surface

#### 8. **Production Dependencies Only**
- `--prod` flag ensures only production dependencies
- `--frozen-lockfile` ensures deterministic installs
- `--ignore-scripts` prevents malicious install scripts

#### 9. **No Audit Warnings in Build**
- `--no-audit --no-fund` flags reduce noise
- Dependencies vetted through lock file

### ✅ Network Security

#### 10. **Exposed Ports**
- Only port 3000 exposed (configurable via PORT env var)
- No unnecessary ports exposed
- Health check endpoint available

#### 11. **Health Checks**
- Built-in health check for HTTP mode
- Interval: 30s, Timeout: 10s, Start period: 5s
- Helps with orchestration and monitoring

### ✅ Build Security

#### 12. **`.dockerignore` File**
- Excludes sensitive files (.env, .git)
- Excludes unnecessary files (tests, docs)
- Reduces build context size
- Prevents accidental secret leakage

#### 13. **Metadata Labels**
- OCI standard labels for traceability
- Source repository information
- Maintainer information
- License information

### ✅ Resource Limits

#### 14. **Memory Configuration**
- Node.js max old space size limited to 512MB
- Prevents memory exhaustion attacks
- Configurable via `NODE_OPTIONS` environment variable

### ✅ Immutability

#### 15. **Read-Only Considerations**
- Application can run with read-only root filesystem
- All writes should go to mounted volumes
- No writes to container filesystem required

## Security Verification

### Check Container User
```bash
docker inspect eventcatalog-mcp-server:latest --format='{{.Config.User}}'
# Expected: nodejs
```

### Check Image Size
```bash
docker images eventcatalog-mcp-server:latest
# Expected: ~208MB
```

### Check for Known Vulnerabilities
```bash
docker scout quickview eventcatalog-mcp-server:latest
# or
trivy image eventcatalog-mcp-server:latest
```

### Verify No Root Processes
```bash
docker run --rm eventcatalog-mcp-server:latest id
# Expected: uid=1001(nodejs) gid=1001(nodejs)
```

## Runtime Security Recommendations

### 1. **Use Environment Variables for Secrets**
Never hardcode secrets in the Dockerfile or commit them to version control.

```bash
docker run -d \
  -e EVENTCATALOG_URL="https://your-catalog.com" \
  -e EVENTCATALOG_SCALE_LICENSE_KEY="your-key" \
  eventcatalog-mcp-server:latest
```

### 2. **Use Docker Secrets (Swarm)**
```bash
echo "your-license-key" | docker secret create eventcatalog_license -
docker service create \
  --name eventcatalog-mcp-server \
  --secret eventcatalog_license \
  eventcatalog-mcp-server:latest
```

### 3. **Limit Container Capabilities**
```bash
docker run -d \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --security-opt=no-new-privileges:true \
  eventcatalog-mcp-server:latest
```

### 4. **Run with Read-Only Root Filesystem**
```bash
docker run -d \
  --read-only \
  --tmpfs /tmp:noexec,nosuid,size=64M \
  eventcatalog-mcp-server:latest
```

### 5. **Network Isolation**
```bash
docker network create --driver bridge isolated-network
docker run -d \
  --network isolated-network \
  eventcatalog-mcp-server:latest
```

### 6. **Resource Limits**
```bash
docker run -d \
  --memory="512m" \
  --cpus="1.0" \
  --pids-limit=100 \
  eventcatalog-mcp-server:latest
```

## Security Scanning

### Scan for Vulnerabilities
```bash
# Using Docker Scout
docker scout cves eventcatalog-mcp-server:latest

# Using Trivy
trivy image eventcatalog-mcp-server:latest

# Using Grype
grype eventcatalog-mcp-server:latest
```

### Continuous Security
- Set up automated vulnerability scanning in CI/CD
- Rebuild images regularly with latest security patches
- Monitor security advisories for Node.js and dependencies
- Keep base image updated (alpine patches)

## Kubernetes Security

### Pod Security Standards
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: eventcatalog-mcp-server
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    runAsGroup: 1001
    fsGroup: 1001
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: mcp-server
    image: eventcatalog-mcp-server:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    resources:
      limits:
        memory: "512Mi"
        cpu: "1000m"
      requests:
        memory: "256Mi"
        cpu: "500m"
```

## Compliance

This Docker image follows:
- ✅ CIS Docker Benchmark recommendations
- ✅ OWASP Docker Security Cheat Sheet
- ✅ NIST Container Security Guidelines
- ✅ OCI Image Format Specification
- ✅ Principle of Least Privilege
- ✅ Defense in Depth

## Reporting Security Issues

If you discover a security vulnerability, please:
1. **Do NOT** open a public issue
2. Email security concerns to the maintainer
3. Include detailed information about the vulnerability
4. Allow time for patches before public disclosure

## Security Updates

- Monitor this repository for security updates
- Subscribe to Node.js security announcements
- Check Alpine Linux security advisories
- Rebuild images when security patches are released

## Additional Resources

- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [OWASP Container Security](https://owasp.org/www-project-docker-top-10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

