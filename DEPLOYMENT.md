# Vercel Deployment Guide

## Frontend Deployment (Vercel)

### 1. Environment Variables

Add these environment variables in your Vercel dashboard:

```
VITE_API_URL=https://your-backend-url.com/api
```

### 2. Deploy Steps

1. Connect your GitHub repository to Vercel
2. Set the build command: `npm run build`
3. Set the output directory: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy!

## Backend Deployment

### Option 1: Railway (Recommended)

1. Create account on railway.app
2. Connect your GitHub repository
3. Set environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
4. Deploy the server folder

### Option 2: Render

1. Create account on render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `cd server && npm install`
5. Set start command: `cd server && npm start`
6. Add environment variables
7. Deploy!

### Option 3: Heroku

1. Create account on heroku.com
2. Install Heroku CLI
3. Create new app
4. Set environment variables
5. Deploy using Git

## Environment Variables Needed

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Important Notes

1. **CORS**: The backend is configured to accept requests from Vercel domains
2. **MongoDB**: Use MongoDB Atlas for production database
3. **Environment Variables**: Make sure to set them in your deployment platform
4. **Build**: The frontend will build automatically on Vercel

## Troubleshooting

- If API calls fail, check CORS configuration
- If build fails, check Node.js version (use 18+)
- If environment variables don't work, restart the deployment
