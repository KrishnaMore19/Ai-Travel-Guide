AI Travel Guide 🌍✨
An intelligent travel planning application powered by AI that creates personalized itineraries, provides destination suggestions, and integrates real-time weather data. Built with Next.js and FastAPI.

Features:
AI-Powered Itinerary Generation: Create personalized travel plans based on your preferences, budget, and interests
Real-Time Streaming: Watch your itinerary being generated in real-time with AI thought process visibility
Weather Integration: Get current weather information for your destinations
Destination Discovery: Browse curated travel suggestions with filtering options
Modern UI/UX: Beautiful, responsive interface with smooth animations
MongoDB Storage: Persistent storage for itineraries and suggestions

Tech Stack
Frontend

Next.js 14 - React framework with App Router
TypeScript - Type-safe development
Tailwind CSS - Utility-first styling
Framer Motion - Smooth animations
Lucide React - Modern icon library

Backend

FastAPI - High-performance Python web framework
MongoDB - NoSQL database for data storage
OpenRouter/LLaMA - AI model integration
OpenWeather API - Real-time weather data
Uvicorn - ASGI server

Getting Started
Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v18 or higher)
Python (v3.8 or higher)
MongoDB (v5.0 or higher)
Git

Clone the Repository
bashgit clone <repository-url>
cd ai-travel-guide
Backend Setup

Navigate to the backend directory:

bashcd backend

Create a virtual environment:

bashpython -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

Install dependencies:

bashpip install -r requirements.txt

Create environment file:
Create a .env file in the backend directory with the following configuration:

env# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=travel_guide_db

# AI Configuration
LLAMA_MODEL=meta-llama/llama-3.3-70b-instruct:free
LLAMA_API_KEY=your_openrouter_api_key_here

# Weather API
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

Start the backend server:

bashpython main.py
The API will be available at http://localhost:8000
Frontend Setup

Navigate to the frontend directory (open a new terminal):

bashcd frontend

Install dependencies:

bashnpm install

Create environment file:
Create a .env.local file in the frontend directory:

env# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME="AI Travel Guide"
NEXT_PUBLIC_APP_URL=http://localhost:3000

Start the development server:

bashnpm run dev
```

The application will be available at `http://localhost:3000`

## API Keys Setup

### OpenRouter API Key
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key and add it to your backend `.env` file as `LLAMA_API_KEY`

### OpenWeather API Key
1. Visit [OpenWeather](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key and add it to your backend `.env` file as `OPENWEATHER_API_KEY`

## MongoDB Setup

### Local Installation
1. Download MongoDB from [official website](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. The default connection URL is `mongodb://localhost:27017`

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URL` in backend `.env` file

## Project Structure
```
ai-travel-guide/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
└── README.md
Available Scripts
Frontend

npm run dev - Start development server
npm run build - Build for production
npm start - Start production server
npm run lint - Run ESLint

Backend

python main.py - Start development server
uvicorn main:app --reload - Alternative way to start server

API Documentation
Once the backend is running, you can access:

Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc
Health Check: http://localhost:8000/health

Key Features Explained
Itinerary Generation

Fill out the form with your travel preferences
AI generates a personalized itinerary in real-time
View AI's thought process as it plans your trip
Get weather information for your destination

Destination Discovery

Browse curated travel suggestions
Filter by budget, duration, and travel type
View detailed information about each destination
Paginate through results

Troubleshooting
Backend Issues

MongoDB Connection Error: Ensure MongoDB is running on port 27017
API Key Error: Verify your OpenRouter and OpenWeather API keys are valid
Port Already in Use: Change the PORT in backend .env file

Frontend Issues

API Connection Error: Verify backend is running on port 8000
Build Error: Delete node_modules and .next folders, then run npm install
Environment Variables Not Loading: Ensure .env.local file exists and restart dev server

Environment Variables
Backend Required Variables

MONGODB_URL - MongoDB connection string
LLAMA_API_KEY - OpenRouter API key for AI model
OPENWEATHER_API_KEY - OpenWeather API key

Frontend Required Variables

NEXT_PUBLIC_API_URL - Backend API URL

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
License
This project is open source and available under the MIT License.