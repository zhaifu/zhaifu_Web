# ZenNav - Minimalist Navigation Dashboard

A beautiful, minimalist, and highly customizable navigation dashboard.

## 🚀 How to Deploy to Vercel (with Auto-Sync)

To enable the automatic sync where modifying code in GitHub updates your site:

### 1. Push code to GitHub
1.  Initialize git: `git init`
2.  Commit files: `git add .` and `git commit -m "Initial"`
3.  Create a new repo on GitHub.
4.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

### 2. Connect to Vercel
1.  Log in to [Vercel](https://vercel.com).
2.  Click **Add New > Project**.
3.  Select **Continue with GitHub**.
4.  Import your `ZenNav` repository.
5.  Vercel will detect "Vite". Click **Deploy**.

### 🔄 Sync is now active!
Now, whenever you edit a file and **push to GitHub**, Vercel will automatically detect the change, rebuild, and update your website within minutes.

## Local Development
1. `npm install`
2. `npm run dev`
