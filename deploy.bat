@echo off
echo ============================================
echo   Autobacs Training - Deploy to Vercel
echo ============================================
echo.

cd /d "%~dp0"

:: Step 1: Initialize Git
echo [1/5] Initializing Git repository...
git init
git add -A
git commit -m "Initial commit: Autobacs Training Management"
git branch -M main

:: Step 2: Create GitHub repo and push
echo.
echo [2/5] Creating GitHub repository...
gh repo create autobacs-training --public --source=. --remote=origin --push

:: Step 3: Install Vercel CLI
echo.
echo [3/5] Installing Vercel CLI...
npm install -g vercel

:: Step 4: Deploy to Vercel (production)
echo.
echo [4/5] Deploying to Vercel...
echo (A browser window may open for login - please authorize)
vercel --yes --prod

:: Done
echo.
echo ============================================
echo [5/5] DONE! Your site is live on Vercel!
echo ============================================
pause
