# GitHub Pages Deployment Guide

## Quick Deploy

Your project is now configured for GitHub Pages! Follow these steps:

### 1. Commit Your Changes
```bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main
```

### 2. Deploy to GitHub Pages
```bash
npm run deploy
```

This command will:
- Build your project (`npm run build`)
- Deploy the `dist` folder to the `gh-pages` branch
- Push to GitHub

### 3. Enable GitHub Pages
1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/brain-freeze-bob`
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

### 4. Access Your Site
After a few minutes, your site will be live at:
```
https://YOUR_USERNAME.github.io/brain-freeze-bob/
```

## Updating Your Site

Whenever you make changes:

```bash
# 1. Make your changes
# 2. Test locally
npm run dev

# 3. Deploy
npm run deploy
```

The site will automatically update!

## Troubleshooting

### Site shows 404
- Wait 2-3 minutes after first deployment
- Check that GitHub Pages is enabled in Settings
- Verify the `gh-pages` branch exists

### Assets not loading
- Ensure `base: '/brain-freeze-bob/'` is in `vite.config.js`
- Clear browser cache
- Check browser console for errors

### PWA not installing
- GitHub Pages provides HTTPS automatically ✓
- Wait for service worker to register (check browser console)
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Custom Domain (Optional)

To use a custom domain like `brainfreeze.com`:

1. Create `public/CNAME` file with your domain:
```
brainfreeze.com
```

2. Update `vite.config.js`:
```javascript
base: '/',  // Change from '/brain-freeze-bob/'
```

3. Configure DNS:
   - Add A records pointing to GitHub's IPs, or
   - Add CNAME record pointing to `YOUR_USERNAME.github.io`

4. Deploy: `npm run deploy`

5. In GitHub Settings → Pages, add your custom domain

---

**That's it! Your Brain Freeze app is now live! 🎉**