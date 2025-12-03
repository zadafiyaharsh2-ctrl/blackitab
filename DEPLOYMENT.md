# 🚀 Deployment Guide for Blackitab (Netlify & Render)

This guide will help you deploy your MERN stack application using **Netlify** (Frontend) and **Render** (Backend).

## 📋 Prerequisites
1.  **GitHub Account**: `zadafiyaharsh2-ctrl`
2.  **MongoDB Atlas Account**: For your cloud database.
3.  **Netlify Account**: For hosting the Frontend.
4.  **Render Account**: For hosting the Backend.

---

## Step 1: Push Code to GitHub

1.  Open your terminal in the root folder (`blackitab`).
2.  Initialize Git (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Ready for deployment"
    ```
3.  Create a new repository on GitHub named `blackitab`.
4.  Link and push:
    ```bash
    git branch -M main
    git remote add origin https://github.com/zadafiyaharsh2-ctrl/blackitab.git
    git push -u origin main
    ```

---

## Step 2: Setup Database (MongoDB Atlas)

1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **New Cluster** (Free Tier).
3.  Create a **Database User** (Username/Password).
4.  **Network Access**: Allow access from anywhere (`0.0.0.0/0`).
5.  **Get Connection String**:
    *   Click "Connect" > "Drivers".
    *   Copy the string (looks like `mongodb+srv://<user>:<password>@cluster...`).
    *   **Save this string**, you will need it for the backend.

---

## Step 3: Deploy Backend (Render)

1.  Log in to [Render](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository (`zadafiyaharsh2-ctrl/blackitab`).
4.  **Settings**:
    *   **Root Directory**: `blackitabbackend` (IMPORTANT: Point to your backend folder).
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
5.  **Environment Variables** (Advanced):
    *   Add `MONGO_URI`: Paste your MongoDB connection string here.
    *   Add `PORT`: `10000`
    *   Add `JWT_SECRET`: Your secret key.
6.  Click **Create Web Service**.
7.  **Wait for it to deploy**. Once done, copy the **Render URL** (e.g., `https://blackitab-api.onrender.com`).

---

## Step 4: Deploy Frontend (Netlify)

1.  Log in to [Netlify](https://www.netlify.com/).
2.  Click **Add new site** -> **Import from existing project**.
3.  Connect **GitHub** and select your `blackitab` repository.
4.  **Build Settings**:
    *   **Base directory**: `blackitabfrontend`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `blackitabfrontend/dist`
5.  **Environment Variables** (Site settings > Environment variables):
    *   Key: `VITE_API_URL`
    *   Value: Your **Render Backend URL** (e.g., `https://blackitab-api.onrender.com`)
6.  Click **Deploy Site**.

---

## 🎉 Done!

*   **Frontend URL**: Provided by Netlify (e.g., `https://blackitab.netlify.app`).
*   **Backend URL**: Provided by Render.

Your app is now live!
