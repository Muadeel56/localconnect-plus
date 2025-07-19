# LocalConnect+ Frontend

A modern, responsive React application for community building and local connections.

## Features

### 🏠 Home Page
- Welcome section with community statistics
- Feature highlights
- Call-to-action for registration/login

### 📝 Posts System
- **Posts Listing**: View all community posts with filtering and search
- **Post Creation**: Create new posts with categories, status, and location
- **Post Details**: View individual posts with threaded comments
- **Post Editing**: Edit your own posts or posts you have permission to edit
- **Categories**: General, Food & Groceries, Transportation, Medical & Health, Education, Technology, Other
- **Status Management**: Open, In Progress, Closed, Resolved

### 💬 Comments System
- **Threaded Comments**: Nested comment replies
- **Comment Management**: View all comments across posts
- **Moderation**: Admin and volunteer moderation capabilities
- **Real-time Updates**: Dynamic comment loading and updates

### 👤 User Accounts
- **User Registration**: Complete registration with email verification
- **User Login**: Secure authentication with JWT tokens
- **Profile Management**: Edit profile information, bio, location
- **Role-based Access**: User, Volunteer, and Admin roles
- **Password Management**: Change password functionality

### 🎨 Design Features
- **Fully Responsive**: Mobile-first design that works on all devices
- **Dark/Light Theme**: Toggle between themes
- **Modern UI**: Clean, accessible design with smooth animations
- **Accessibility**: WCAG compliant with proper focus management
- **Performance**: Optimized with lazy loading and efficient rendering

## Technology Stack

- **React 19**: Latest React with hooks and modern patterns
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication
- **Vite**: Fast build tool and development server

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Configure environment variables:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

7. Open your browser to `http://localhost:5173`

## API Integration

The frontend integrates with the Django REST API backend:

### Authentication Endpoints
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `POST /api/accounts/logout/` - User logout
- `GET /api/accounts/current-user/` - Get current user
- `PUT /api/accounts/profile/update/` - Update profile

### Posts Endpoints
- `GET /api/posts/` - List all posts
- `POST /api/posts/` - Create new post
- `GET /api/posts/{id}/` - Get post details
- `PUT /api/posts/{id}/` - Update post
- `DELETE /api/posts/{id}/` - Delete post

### Comments Endpoints
- `GET /api/comments/` - List all comments
- `POST /api/comments/` - Create new comment
- `GET /api/comments/by_post/?post_id={id}` - Get comments for post
- `DELETE /api/comments/{id}/` - Delete comment

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navigation.jsx   # Main navigation
│   │   ├── Loading.jsx      # Loading spinner
│   │   └── Toast.jsx        # Toast notifications
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Home page
│   │   ├── Posts.jsx        # Posts listing
│   │   ├── PostDetail.jsx   # Individual post view
│   │   ├── CreatePost.jsx   # Create post form
│   │   ├── EditPost.jsx     # Edit post form
│   │   ├── Comments.jsx     # Comments management
│   │   ├── Profile.jsx      # User profile
│   │   ├── Login.jsx        # Login form
│   │   ├── Register.jsx     # Registration form
│   │   └── Admin.jsx        # Admin dashboard
│   ├── services/            # API services
│   │   └── api.js           # API client and endpoints
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── assets/              # Static assets
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Public assets
├── package.json             # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## Key Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid system
- Touch-friendly interactions

### Theme System
- Light and dark theme support
- CSS custom properties for theming
- Smooth theme transitions
- Persistent theme preference

### State Management
- React Context for global state
- Local state with useState
- API state management with loading/error states

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Toast notifications for feedback
- Graceful fallbacks

### Performance
- Lazy loading for routes
- Optimized bundle splitting
- Efficient re-renders
- Image optimization

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- ESLint configuration for code quality
- Prettier for code formatting
- Consistent component structure
- TypeScript-like prop validation

### Testing

- Component testing with React Testing Library
- API mocking for tests
- Accessibility testing
- Cross-browser testing

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Configure these environment variables for production:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Static Hosting

The built application can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
