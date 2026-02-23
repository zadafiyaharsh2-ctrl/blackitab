# Blackitab Backend

Node.js/Express backend with MongoDB database for user authentication.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. MongoDB Setup

You have two options:

#### Option A: Local MongoDB
1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. The app will connect to `mongodb://localhost:27017/blackitab` by default

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Add it to your `.env` file as `MONGODB_URI`

### 3. Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/blackitab
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blackitab?retryWrites=true&w=majority
```

### 4. Run the Server

```bash
npm start
```

or for development:

```bash
npm run dev
```

## API Endpoints

### POST /api/register
Register a new user
- Body: `{ name, email, password }`
- Returns: `{ success, token, user }`

### POST /api/login
Login user
- Body: `{ email, password }`
- Returns: `{ success, token, user }`

### GET /api/me
Get current user (protected)
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, user }`

## Database Schema

### User Model
- `name` (String, required)
- `email` (String, required, unique, lowercase)
- `password` (String, required, min 6 characters, hashed)
- `createdAt` (Date, auto-generated)

/**

Finding a way to host a Python model 24/7 for absolutely free is the holy grail for developers, but it comes with a catch: machine learning models require a lot of RAM and compute power, and cloud providers aren't running charities.

Most "free tiers" will either restrict your memory so much that your model crashes, or they will put your app to "sleep" when no one is using it. However, if you know where to look, you can absolutely get a model running 24/7 without opening your wallet.

Here are the three best ways to do this in 2026, depending on how big your model is and how much setup you want to do.

1. The Easiest Option: Hugging Face Spaces
If you are deploying a machine learning model, this should be your first stop. Hugging Face is designed specifically for AI and offers the most generous free hardware out of the box.

The Free Tier: You get a "CPU Basic" environment with 16 GB of RAM and 2 vCPUs. This is massive for a free tier and enough to run fairly heavy models.

How it works: You can deploy your model as a web app using Gradio or Streamlit, or wrap it in a Docker container to serve it as an API (like FastAPI).

The Catch: It is designed to "sleep" after roughly 48 hours of inactivity to save them money.

The Workaround: If you want it running truly 24/7, you can use a free external pinging service (like UptimeRobot or cron-job.org) to send a request to your Space's URL every 15 minutes. This tricks the server into thinking it's actively being used, keeping it awake forever.

2. The Heavyweight Champion: Oracle Cloud "Always Free"
If you want a traditional, dedicated server that never sleeps and gives you total control, Oracle Cloud is the best-kept secret in the developer world.

The Free Tier: They offer an "Always Free" tier that gives you up to 4 ARM Ampere A1 Compute instances with a staggering 24 GB of RAM and 200 GB of storage.

How it works: You get a blank Linux virtual machine (Ubuntu, etc.). You SSH into it, upload your Python code, install your libraries, and run your model using a framework like Flask or FastAPI via a background manager like systemd or pm2.

The Catch: You do have to enter a credit card upon signup to verify you are a real human (to prevent crypto-mining bots), but as long as you select the "Always Free" resources, you will never be charged. Also, because the processors are ARM architecture (like Apple Silicon), you'll need to make sure your specific Python libraries have ARM-compatible versions (most major ones like PyTorch, TensorFlow, and Scikit-Learn do).

3. The API Route: Render + UptimeRobot
If your model is very lightweight (e.g., a simple scikit-learn regression model or a small text classifier), you can use standard web hosting platforms.

The Free Tier: Render gives you 750 free compute hours per month, which is exactly enough to run one web service 24/7.

How it works: You connect your GitHub repository, and Render automatically builds and hosts your Python API.

The Catch: The free tier only gives you 512 MB of RAM. If your model requires more memory than that to load, the deployment will fail. Furthermore, Render spins down your app after 15 minutes of inactivity. When a new request comes in, it has a "cold start" and takes about 30–60 seconds to wake up.

The Workaround: Just like Hugging Face, you can use UptimeRobot to ping the /health endpoint of your API every 10 minutes to prevent it from ever going to sleep.

My Recommendation
If your model is large and you want a visual interface (or an easy setup without dealing with Linux servers): Go with Hugging Face Spaces.

If your model is large, you want a pure backend API, and you aren't afraid of the Linux command line: Go with Oracle Cloud.

If your model is tiny (< 500MB RAM needed) and you just want a simple API: Go with Render.

Would you like me to write the deployment code (like a FastAPI wrapper or a Gradio interface) so you can get your model ready for whichever platform you choose?


*/