#!/bin/bash

# LocalConnect+ Labels Creation Script
echo "Creating labels for LocalConnect+ project..."

# Backend labels
gh api repos/Muadeel56/localconnect-plus/labels -f name="backend" -f color="0366d6" -f description="Backend development tasks"
gh api repos/Muadeel56/localconnect-plus/labels -f name="api" -f color="0075ca" -f description="API development"
gh api repos/Muadeel56/localconnect-plus/labels -f name="auth" -f color="d93f0b" -f description="Authentication"
gh api repos/Muadeel56/localconnect-plus/labels -f name="models" -f color="0e8a16" -f description="Database models"
gh api repos/Muadeel56/localconnect-plus/labels -f name="database" -f color="1d76db" -f description="Database tasks"
gh api repos/Muadeel56/localconnect-plus/labels -f name="setup" -f color="5319e7" -f description="Project setup"
gh api repos/Muadeel56/localconnect-plus/labels -f name="cors" -f color="fbca04" -f description="CORS configuration"
gh api repos/Muadeel56/localconnect-plus/labels -f name="crud" -f color="0e8a16" -f description="CRUD operations"
gh api repos/Muadeel56/localconnect-plus/labels -f name="search" -f color="1d76db" -f description="Search functionality"
gh api repos/Muadeel56/localconnect-plus/labels -f name="comments" -f color="0e8a16" -f description="Comment system"
gh api repos/Muadeel56/localconnect-plus/labels -f name="notifications" -f color="fbca04" -f description="Notifications"
gh api repos/Muadeel56/localconnect-plus/labels -f name="permissions" -f color="d93f0b" -f description="Permissions"
gh api repos/Muadeel56/localconnect-plus/labels -f name="analytics" -f color="1d76db" -f description="Analytics"
gh api repos/Muadeel56/localconnect-plus/labels -f name="moderation" -f color="d93f0b" -f description="Moderation"
gh api repos/Muadeel56/localconnect-plus/labels -f name="roles" -f color="5319e7" -f description="User roles"
gh api repos/Muadeel56/localconnect-plus/labels -f name="admin" -f color="d93f0b" -f description="Admin features"
gh api repos/Muadeel56/localconnect-plus/labels -f name="audit" -f color="fbca04" -f description="Audit logging"
gh api repos/Muadeel56/localconnect-plus/labels -f name="communication" -f color="0075ca" -f description="Communication"
gh api repos/Muadeel56/localconnect-plus/labels -f name="security" -f color="d93f0b" -f description="Security"

# Frontend labels
gh api repos/Muadeel56/localconnect-plus/labels -f name="frontend" -f color="0366d6" -f description="Frontend tasks"
gh api repos/Muadeel56/localconnect-plus/labels -f name="react" -f color="61dafb" -f description="React.js"
gh api repos/Muadeel56/localconnect-plus/labels -f name="ui" -f color="fbca04" -f description="User interface"
gh api repos/Muadeel56/localconnect-plus/labels -f name="components" -f color="0e8a16" -f description="Components"
gh api repos/Muadeel56/localconnect-plus/labels -f name="pages" -f color="1d76db" -f description="Pages"
gh api repos/Muadeel56/localconnect-plus/labels -f name="forms" -f color="5319e7" -f description="Forms"
gh api repos/Muadeel56/localconnect-plus/labels -f name="services" -f color="0075ca" -f description="Services"
gh api repos/Muadeel56/localconnect-plus/labels -f name="responsive" -f color="fbca04" -f description="Responsive"
gh api repos/Muadeel56/localconnect-plus/labels -f name="loading" -f color="1d76db" -f description="Loading states"
gh api repos/Muadeel56/localconnect-plus/labels -f name="animations" -f color="5319e7" -f description="Animations"
gh api repos/Muadeel56/localconnect-plus/labels -f name="profiles" -f color="0e8a16" -f description="User profiles"
gh api repos/Muadeel56/localconnect-plus/labels -f name="dashboard" -f color="1d76db" -f description="Dashboard"
gh api repos/Muadeel56/localconnect-plus/labels -f name="users" -f color="0075ca" -f description="User management"

# Testing labels
gh api repos/Muadeel56/localconnect-plus/labels -f name="testing" -f color="0e8a16" -f description="Testing"
gh api repos/Muadeel56/localconnect-plus/labels -f name="quality-assurance" -f color="fbca04" -f description="QA"

# Documentation labels
gh api repos/Muadeel56/localconnect-plus/labels -f name="documentation" -f color="0075ca" -f description="Documentation"
gh api repos/Muadeel56/localconnect-plus/labels -f name="readme" -f color="1d76db" -f description="README"

# Deployment labels
gh api repos/Muadeel56/localconnect-plus/labels -f name="deployment" -f color="5319e7" -f description="Deployment"
gh api repos/Muadeel56/localconnect-plus/labels -f name="render" -f color="1d76db" -f description="Render"
gh api repos/Muadeel56/localconnect-plus/labels -f name="vercel" -f color="000000" -f description="Vercel"
gh api repos/Muadeel56/localconnect-plus/labels -f name="configuration" -f color="fbca04" -f description="Configuration"
gh api repos/Muadeel56/localconnect-plus/labels -f name="production" -f color="d93f0b" -f description="Production"
gh api repos/Muadeel56/localconnect-plus/labels -f name="checklist" -f color="fbca04" -f description="Checklist"

# CI/CD labels
gh api repos/Muadeel56/localconnect-plus/labels -f name="ci-cd" -f color="5319e7" -f description="CI/CD"
gh api repos/Muadeel56/localconnect-plus/labels -f name="automation" -f color="1d76db" -f description="Automation"

# Performance and monitoring labels
gh api repos/Muadeel56/localconnect-plus/labels -f name="performance" -f color="fbca04" -f description="Performance"
gh api repos/Muadeel56/localconnect-plus/labels -f name="optimization" -f color="0e8a16" -f description="Optimization"
gh api repos/Muadeel56/localconnect-plus/labels -f name="monitoring" -f color="1d76db" -f description="Monitoring"

# Error handling labels
gh api repos/Muadeel56/localconnect-plus/labels -f name="error-handling" -f color="d93f0b" -f description="Error handling"

echo "All labels created successfully!" 