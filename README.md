# BrainSAIT OID Badge Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

A modern web application for managing Object Identifier (OID) badges within the BrainSAIT organization. The system provides a sleek, dark-themed UI with LLM-powered assistance to help administrators manage OID allocations.

## 🚀 Features

- **Modern Dark UI**: Sleek, responsive interface designed for optimal user experience
- **OID Tree Visualization**: Interactive hierarchical view of all OIDs in the organization
- **Badge Management**: Create, edit, and revoke OID badges with detailed access control
- **AI-Powered Assistant**: LLM integration for contextual help and recommendations
- **RESTful API**: Backend API for integration with other systems
- **Docker Support**: Complete containerization for easy deployment

## 🛠️ Tech Stack

### Frontend
- React.js with Hooks
- React Router v6 for navigation
- TailwindCSS for styling
- Modern JavaScript (ES6+)

### Backend
- FastAPI (Python)
- PostgreSQL database
- RESTful API architecture
- Docker containerization

## 📋 Requirements

- Docker and Docker Compose
- Node.js v16+ (for local development)
- Python 3.11+ (for local development)

## 🔧 Installation

### Using Docker (Recommended)

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/brainSAIT-oid-system.git
   cd brainSAIT-oid-system
   ```

2. Start the Docker containers
   ```bash
   docker-compose up -d
   ```

3. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup (Development)

#### Backend

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Start the backend server
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend

1. Navigate to the frontend directory
   ```bash
   cd oid-portal
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

## 🧪 Testing

Run our comprehensive test suite to ensure everything is working properly:

```bash
./test.sh
```

This script performs:
- API endpoint testing
- Stress testing with concurrent requests
- Error handling validation
- Frontend accessibility checks

## 📚 API Documentation

The API documentation is available at http://localhost:8000/docs when the backend is running.

Key endpoints:
- `GET /oids` - List all OID badges
- `POST /oids` - Register a new OID badge
- `PUT /oids/{oid}` - Update an existing badge
- `DELETE /oids/{oid}` - Revoke a badge

## 🚢 Deployment

### Production Deployment

For production environments, update the Docker Compose configuration with appropriate environment variables and security settings.

```bash
# Example production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🧩 Project Structure

```
brainSAIT-oid-system/
├── backend/               # FastAPI backend
│   ├── Dockerfile         # Backend container configuration
│   ├── init.sql           # Database initialization script
│   ├── main.py            # Main application entry point
│   └── requirements.txt   # Python dependencies
├── oid-portal/            # React frontend
│   ├── Dockerfile         # Frontend container configuration
│   ├── nginx.conf         # NGINX configuration
│   ├── package.json       # Node.js dependencies
│   ├── tailwind.config.js # TailwindCSS configuration
│   └── src/               # Source files
│       ├── components/    # Reusable React components
│       └── pages/         # Page components
├── docker-compose.yml     # Docker Compose configuration
├── test.sh                # Testing script
└── README.md              # Project documentation
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Security Notice

This application is designed for internal use within the BrainSAIT organization. It contains sensitive OID management capabilities and should be deployed securely.

## 🙏 Acknowledgements

- [TailwindCSS](https://tailwindcss.com/)
- [React](https://reactjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Docker](https://www.docker.com/)
