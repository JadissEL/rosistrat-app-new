# 🎰 European Roulette Strategy Simulator - Deployment Guide

Your roulette simulator is ready to deploy! Here are three **FREE** deployment options:

## 🚀 Option 1: Vercel (Recommended - Easiest)

### Prerequisites:

- GitHub account
- Push your code to GitHub repository

### Steps:

1. **Create GitHub Repository:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit: European Roulette Strategy Simulator"
   git branch -M main
   git remote add origin https://github.com/yourusername/roulette-simulator.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects settings (uses our `vercel.json`)
   - Click "Deploy"
   - ✅ **Done!** Your app will be live in ~2 minutes

### Result:

- **URL**: `https://your-project-name.vercel.app`
- **Features**: SSL, global CDN, auto-deploy on Git push
- **Build time**: ~1-2 minutes

---

## 🌐 Option 2: Netlify

### Steps:

1. **GitHub Setup** (same as above)

2. **Deploy on Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Netlify uses our `netlify.toml` configuration
   - Click "Deploy site"

### Result:

- **URL**: `https://random-name.netlify.app` (customizable)
- **Features**: Forms, functions, edge functions
- **Build time**: ~2-3 minutes

---

## 📄 Option 3: GitHub Pages (Completely Free)

### Steps:

1. **Push code to GitHub** (same as above)

2. **Enable GitHub Pages:**
   - Go to your repository settings
   - Scroll to "Pages" section
   - Source: "GitHub Actions"
   - The workflow in `.github/workflows/deploy.yml` will auto-deploy

### Result:

- **URL**: `https://yourusername.github.io/repository-name`
- **Features**: Free hosting, custom domains supported
- **Build time**: ~3-5 minutes

---

## 🛠️ Build Configuration

All platforms use these optimized settings:

### Build Command:

```bash
npm run build
```

### Output Directory:

```
dist/
```

### Node Version:

```
18.x
```

### Environment Variables:

No environment variables needed - everything runs client-side!

---

## 📱 Features Included in Deployment:

✅ **6 Advanced Betting Strategies**

- Compound Martingale Strategy
- Max Lose Strategy
- Zapping Strategy
- Safe Compound Martingale
- Smart Adaptive Martingale Plus (SAM+)
- Standard Martingale (Red)

✅ **Advanced Analytics**

- 500-spin simulations
- Multi-simulation tracking
- Real-time portfolio management (10,000 Dhs starting)
- Realistic streak simulation
- Comprehensive risk analysis

✅ **Production Optimizations**

- Minified CSS/JS bundles
- Asset caching (1 year)
- Gzip compression
- SEO-friendly routing
- Security headers

---

## 🎯 Recommended Deployment: **Vercel**

**Why Vercel?**

- ⚡ Fastest deployment (2 minutes)
- 🔄 Auto-deploy on every Git push
- 🌍 Global CDN (faster worldwide)
- 🆓 Generous free tier
- 🛠️ Zero configuration needed

---

## 🚨 Quick Deploy Commands

```bash
# 1. Initialize Git (if not done)
git init
git add .
git commit -m "European Roulette Strategy Simulator"

# 2. Push to GitHub
git remote add origin https://github.com/yourusername/roulette-simulator.git
git push -u origin main

# 3. Go to vercel.com → Import → Deploy ✅
```

**Your simulator will be live and ready to test strategies worldwide!** 🌍🎰

---

## 📞 Support

If you encounter any deployment issues:

1. Check the build logs in your chosen platform
2. Ensure Node.js version is 18.x
3. Verify all dependencies are in `package.json`
4. The app is 100% client-side (no backend needed)

**Happy deploying!** 🚀
