# Deployment Guide

Follow these steps to deploy your modern Subscription Management Dashboard on Vercel, Render, and Aiven!

## 1. Push to GitHub
First, make sure all the recent changes are pushed to your GitHub repository.
```bash
git add .
git commit -m "chore: add deployment configurations"
git push origin main
```

## 2. Setup MySQL Database (TiDB Serverless)
Aiven has recently restricted their free tier in many regions. We will use **TiDB Serverless** instead, which provides a highly-available, free MySQL-compatible database.

1. Go to [TiDB Cloud](https://tidbcloud.com/) and create a free account (you can sign up with Google or GitHub).
2. Click **Create Cluster**.
3. Select the **Serverless** tier (which is free forever for up to 5GB).
4. Choose a region close to you (e.g., AWS Mumbai) and click **Create**.
5. Once your cluster is created, you will be prompted to generate a password. **Save this password!**
6. Click on **Connect** in the top right corner.
7. Select **Node.js** as your environment, and you will see your connection details. Note down the **Host**, **Port** (usually 4000), **User**, **Password**, and **Database** (usually `test`).
8. Connect to this remote database using your favorite SQL client (like DBeaver or MySQL Workbench) and run the initialization script:
   ```sql
   CREATE DATABASE IF NOT EXISTS submanager_db;
   ```

## 3. Setup Render (Backend)
Render will automatically detect the `render.yaml` file we created and set up the service!
1. Go to [Render](https://render.com/) and create a free account.
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will read the `render.yaml` file and create a Web Service named `sub-manager-api`.
5. Once created, go to the **Environment** tab of the new service and fill in the variables:
   - `DB_HOST`: Your Aiven MySQL hostname
   - `DB_USER`: Your Aiven MySQL username (e.g., `avnadmin`)
   - `DB_PASS`: Your Aiven MySQL password
   - `DB_NAME`: `submanager_db` (or whatever you named it)
   - `CLIENT_URL`: **(Leave this blank for now, we will update it after Vercel deployment)**
   - `GOOGLE_CLIENT_ID`: Your exact Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `SESSION_SECRET`: Random string (e.g., `super_secret_session_key_123`)

## 4. Setup Vercel (Frontend)
1. Go to [Vercel](https://vercel.com/) and create a free account (sign in with GitHub).
2. Click **Add New Project** and import your repository.
3. Once imported, click **Edit** in the "Root Directory" section and select `sub-manager-ui`.
4. In the **Environment Variables** section, add:
   - Name: `VITE_API_URL`
   - Value: The Render URL from Step 3 (e.g., `https://sub-manager-api-xxxx.onrender.com`)
5. Click **Deploy**.

## 5. Finalize the Connection
Now that both the UI and API are deployed, we need to complete the loop:

1. **Update Render CLIENT_URL**:
   - Go back to Render's **Environment** tab.
   - Set `CLIENT_URL` to your new Vercel frontend URL (e.g., `https://sub-manager-ui.vercel.app`).
   - *Note: Make sure not to include a trailing slash!*
2. **Update Google Cloud Console**:
   - Go to your Google Cloud Console where you created the OAuth credentials.
   - Add your Vercel URL to **Authorized JavaScript origins** (e.g., `https://sub-manager-ui.vercel.app`).
   - Add your Render callback URL to **Authorized redirect URIs** (e.g., `https://sub-manager-api-xxxx.onrender.com/auth/google/callback`).

That's it! Your application is now live and talking to a remote database.
