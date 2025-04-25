# BrainSAIT OID System - Deployment Guide

This document provides step-by-step instructions for deploying your BrainSAIT OID Badge Management System to GitHub and then to a production environment.

## 1. Setting Up GitHub Repository

We've already prepared the `setup_github.sh` script to automate this process. Follow these steps:

1. Open your terminal and navigate to the project root:
   ```bash
   cd /Users/fadil369/brainSAIT-oid-system01
   ```

2. Run the setup script:
   ```bash
   ./setup_github.sh
   ```

3. Follow the prompts to:
   - Configure Git identity if needed
   - Create a GitHub repository (either through the website or GitHub CLI)
   - Push your code to GitHub

## 2. Testing the Application

Before deploying to production, it's essential to test thoroughly:

1. Run the included test script:
   ```bash
   ./test.sh
   ```

2. This will:
   - Start the Docker containers
   - Test the backend API endpoints
   - Test the frontend
   - Run stress tests
   - Verify error handling

3. Review the test results and fix any issues before proceeding.

## 3. Production Deployment Options

### Option A: Docker-based Deployment

1. On your production server, clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/brainSAIT-oid-system.git
   cd brainSAIT-oid-system
   ```

2. Create production environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your production settings
   ```

3. Start the containers:
   ```bash
   docker-compose up -d
   ```

### Option B: Cloud Deployment (AWS Example)

1. AWS Elastic Beanstalk:
   - Set up an Elastic Beanstalk environment with Docker platform
   - Deploy using the EB CLI:
     ```bash
     eb init
     eb create production
     eb deploy
     ```

2. AWS ECS/EKS:
   - Configure ECS task definitions or Kubernetes manifests
   - Deploy using AWS CLI or kubectl

### Option C: CI/CD Pipeline

1. GitHub Actions:
   - We've included a workflow file in `.github/workflows/`
   - It will automatically test your code on push
   - Extend it to deploy to your production environment

2. Jenkins/GitLab CI:
   - Configure your preferred CI/CD tool to:
     - Build and test the application
     - Deploy to staging for verification
     - Deploy to production after approval

## 4. Post-Deployment Verification

After deploying to production:

1. Verify all endpoints are working:
   ```bash
   curl -v https://your-production-domain.com/oids
   ```

2. Test the frontend through a browser:
   - Navigate to https://your-production-domain.com
   - Verify the UI renders correctly
   - Test key functionality

3. Set up monitoring:
   - Configure log aggregation
   - Set up alerts for API failures
   - Monitor database performance

## 5. Maintaining the Application

1. Regular updates:
   ```bash
   git pull
   docker-compose up -d --build
   ```

2. Database backups:
   ```bash
   docker exec -t db pg_dump -U oid_admin oid_registry > backup.sql
   ```

3. Scaling (if needed):
   - Add more backend instances behind a load balancer
   - Scale the database with read replicas

---

For any questions or issues, refer to the README.md or contact the development team.
