# BrainSAIT OID Enterprise Platform
## IANA PEN 61026 — Enterprise Namespace Infrastructure

The OID Enterprise Platform provides a complete infrastructure for deploying
and managing BrainSAIT OID namespaces at organizational scale.

## Architecture

```
                    ┌─────────────────────────────┐
                    │  BrainSAIT OID Enterprise    │
                    │  Platform                    │
                    │  1.3.6.1.4.1.61026           │
                    └──────────┬──────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  Healthcare  │    │  AI Agents  │    │   IoT/Edge  │
    │  .3.*        │    │  .3.3.*     │    │   .4.*      │
    └─────────────┘    └─────────────┘    └─────────────┘
```

## Quick Deploy

```bash
git clone https://github.com/brainsait/oid-enterprise-platform
cp enterprise-config.yaml.example enterprise-config.yaml
docker-compose up -d
curl http://localhost:8080/oid/1.3.6.1.4.1.61026
```
