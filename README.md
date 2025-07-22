# 🏘️ LocalConnect+ - Community Building Platform

A modern, full-stack web application for building and managing local communities. Built with Django REST Framework backend and React frontend.

## 🎯 **Project Status**

### ✅ **Milestone 1: Setup & Authentication - COMPLETED**
- **Status**: 100% Complete (12/12 issues)
- **Date**: December 2024
- **Details**: [View Complete Report](./MILESTONE_1_COMPLETION_REPORT.md)

### 🚧 **Milestone 2: Core Features - IN PROGRESS**
- Posts and Comments CRUD operations
- Search and filtering functionality
- Role-based features
- Notification system

## 🏗️ **Technology Stack**

### **Backend**
- **Django 5.2.4** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **JWT Authentication** - Security
- **djangorestframework-simplejwt** - Token management

### **Frontend**
- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

## 🚀 **Features**

### ✅ **Completed (Milestone 1)**
- **User Authentication**
  - Registration with email verification
  - Login/logout with JWT tokens
  - Password reset functionality
  - Password change for authenticated users
  - Role-based access control (Admin, Volunteer, User)

- **User Management**
  - User profiles with bio, location, phone
  - Profile editing and management
  - Role-based permissions

- **Security**
  - JWT token authentication
  - Email verification with secure tokens
  - Password reset with secure tokens
  - CORS configuration for frontend integration

### 🚧 **In Progress (Milestone 2)**
- **Posts System**
  - Create, read, update, delete posts
  - Post categories and status management
  - Location-based filtering
  - Search functionality

- **Comments System**
  - Threaded comments
  - Comment moderation
  - Real-time updates

- **Advanced Features**
  - Search and filtering
  - Notification system
  - Role-based features

## 📦 **Installation**

### **Prerequisites**
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Git

### **Backend Setup**
```bash
# Clone the repository
git clone https://github.com/Muadeel56/localconnect-plus.git
cd localconnect-plus

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Environment variables
cp .env.example .env
# Edit .env with your database credentials

# Database setup
python manage.py migrate
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### **Frontend Setup**
```bash
# Frontend setup
cd frontend
npm install

# Environment variables
cp .env.example .env
# Edit .env with your API endpoint

# Run development server
npm run dev
```

## 🔧 **Development**

### **Backend Development**
```bash
cd backend
python manage.py runserver
```

### **Frontend Development**
```bash
cd frontend
npm run dev
```

### **Database Migrations**
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## 📚 **API Documentation**

### **Authentication Endpoints**
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `POST /api/accounts/logout/` - User logout
- `POST /api/accounts/verify-email/` - Email verification
- `POST /api/accounts/request-password-reset/` - Password reset request
- `POST /api/accounts/reset-password/` - Password reset
- `POST /api/accounts/change-password/` - Password change

### **User Management Endpoints**
- `GET /api/accounts/profile/` - Get user profile
- `PUT /api/accounts/profile/update/` - Update user profile
- `GET /api/accounts/current-user/` - Get current user

## 🧪 **Testing**

### **Backend Testing**
```bash
cd backend
python manage.py test
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

## 📊 **Project Structure**

```
localconnect-plus/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication
│   ├── posts/              # Posts and comments
│   ├── notifications/      # Notification system
│   └── localconnect_backend/  # Django settings
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static files
├── docs/                   # Documentation
└── README.md              # This file
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 **Roadmap**

### **Phase 1: Setup & Authentication** ✅ **COMPLETED**
- [x] Django project setup with PostgreSQL
- [x] User model with role-based authentication
- [x] JWT authentication system
- [x] Email verification and password reset
- [x] React frontend setup
- [x] Authentication UI components
- [x] API service layer

### **Phase 2: Core Features** 🚧 **IN PROGRESS**
- [ ] Posts CRUD operations
- [ ] Comments system with threading
- [ ] Search and filtering
- [ ] Role-based features
- [ ] Notification system

### **Phase 3: Admin Dashboard** 📋 **PLANNED**
- [ ] Admin dashboard with analytics
- [ ] Moderation tools
- [ ] User management interface
- [ ] Content reporting system

### **Phase 4: Deployment & Polish** 📋 **PLANNED**
- [ ] Production deployment
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation

## 📞 **Contact**

- **Project Link**: [https://github.com/Muadeel56/localconnect-plus](https://github.com/Muadeel56/localconnect-plus)
- **Issues**: [GitHub Issues](https://github.com/Muadeel56/localconnect-plus/issues)

---

**LocalConnect+** - Building stronger communities, one connection at a time. 🏘️✨
