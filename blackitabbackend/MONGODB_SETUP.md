# MongoDB Atlas Connection Guide

## Step-by-Step Instructions to Connect to MongoDB Atlas

### Step 1: Get Your MongoDB Atlas Connection String

1. **Log in to MongoDB Atlas**
   - Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign in to your account

2. **Select Your Cluster**
   - Click on your cluster (or create a new one if you don't have one)

3. **Click "Connect" Button**
   - Click the "Connect" button on your cluster

4. **Choose Connection Method**
   - Select "Connect your application"

5. **Copy the Connection String**
   - You'll see a connection string like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Replace Placeholders**
   - Replace `<username>` with your MongoDB username
   - Replace `<password>` with your MongoDB password
   - Add your database name at the end (before the `?`)
   
   **Example:**
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/blackitab?retryWrites=true&w=majority
   ```

### Step 2: Configure Network Access

1. **Go to Network Access**
   - In MongoDB Atlas, click "Network Access" in the left sidebar

2. **Add IP Address**
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP address
   - Click "Confirm"

### Step 3: Create Database User (if not already created)

1. **Go to Database Access**
   - Click "Database Access" in the left sidebar

2. **Add New User**
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter username and password
   - Set user privileges (for development, "Atlas admin" or "Read and write to any database")
   - Click "Add User"

### Step 4: Update Your .env File

1. **Open/Create `.env` file**
   - Location: `blackitab/blackitabbackend/.env`

2. **Add Your Connection String**
   ```env
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/blackitab?retryWrites=true&w=majority
   ```

   **Important:**
   - Replace `yourusername` with your actual MongoDB username
   - Replace `yourpassword` with your actual MongoDB password
   - Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
   - Keep `/blackitab` as your database name (or change it if you want a different name)

### Step 5: Test the Connection

1. **Start your backend server**
   ```bash
   cd blackitab/blackitabbackend
   npm start
   ```

2. **Check the console output**
   - You should see: `MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net`
   - If you see an error, check:
     - Your connection string is correct
     - Your IP address is whitelisted
     - Your username and password are correct
     - Your cluster is running

### Example .env File

```env
PORT=5000
JWT_SECRET=my-super-secret-jwt-key-12345
MONGODB_URI=mongodb+srv://john:MyPassword123@cluster0.abc123.mongodb.net/blackitab?retryWrites=true&w=majority
```

### Troubleshooting

**Error: "Authentication failed"**
- Check your username and password in the connection string
- Make sure the database user exists in MongoDB Atlas

**Error: "IP not whitelisted"**
- Go to Network Access in MongoDB Atlas
- Add your IP address or allow access from anywhere (0.0.0.0/0)

**Error: "Connection timeout"**
- Check if your cluster is running
- Verify your connection string is correct
- Check your internet connection

**Error: "Invalid connection string"**
- Make sure the connection string format is correct
- Don't forget to add the database name before the `?`
- Make sure special characters in password are URL-encoded

### URL Encoding Special Characters in Password

If your password contains special characters, you need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- `&` becomes `%26`
- `+` becomes `%2B`
- `=` becomes `%3D`

Example:
- Password: `MyP@ss#123`
- Encoded: `MyP%40ss%23123`
- Connection string: `mongodb+srv://user:MyP%40ss%23123@cluster0.xxxxx.mongodb.net/blackitab?retryWrites=true&w=majority`

