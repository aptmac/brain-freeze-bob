# Brain Freeze - Deployment Guide

## Quick Start

### Development
```bash
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
```
The production-ready files will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

---

## Deployment Options

### 1. GitHub Pages

1. **Update `vite.config.js`** to set the base path:
```javascript
export default defineConfig({
  base: '/brain-freeze-bob/',  // Replace with your repo name
  // ... rest of config
})
```

2. **Build the project:**
```bash
npm run build
```

3. **Deploy to GitHub Pages:**
```bash
# Install gh-pages if you haven't
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

npm run deploy
```

4. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`

### 2. Netlify

1. **Connect your repository** to Netlify
2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Deploy!** Netlify will automatically deploy on every push

### 3. Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Follow the prompts** to link your project

### 4. Self-Hosted (Apache/Nginx)

1. **Build the project:**
```bash
npm run build
```

2. **Copy `dist/` contents** to your web server directory

3. **Configure server** for SPA routing:

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## PWA Installation

### Desktop (Chrome/Edge)
1. Visit the deployed site
2. Look for the install icon in the address bar
3. Click "Install"

### Android
1. Open the site in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home screen"
4. Confirm installation

### iOS (Limited PWA Support)
1. Open the site in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

---

## Environment Variables

This project doesn't require environment variables, but if you add API integrations:

1. Create `.env` file:
```env
VITE_API_URL=https://api.example.com
```

2. Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

3. **Never commit `.env` to git!** (already in `.gitignore`)

---

## Custom Domain

### GitHub Pages
1. Add `CNAME` file to `public/` directory:
```
yourdomain.com
```

2. Configure DNS:
   - Add A records pointing to GitHub's IPs
   - Or add CNAME record pointing to `yourusername.github.io`

### Netlify/Vercel
1. Go to domain settings in dashboard
2. Add your custom domain
3. Follow DNS configuration instructions

---

## HTTPS

All modern deployment platforms (GitHub Pages, Netlify, Vercel) provide free HTTPS automatically.

For self-hosted:
- Use [Let's Encrypt](https://letsencrypt.org/) with Certbot
- Or use Cloudflare for free SSL

**Note:** HTTPS is required for PWA features to work!

---

## Performance Optimization

The build is already optimized, but for additional improvements:

1. **Enable compression** on your server (gzip/brotli)
2. **Set cache headers** for static assets
3. **Use a CDN** for global distribution
4. **Monitor with Lighthouse** for PWA score

---

## Troubleshooting

### PWA not installing
- Ensure site is served over HTTPS
- Check browser console for service worker errors
- Verify `manifest.webmanifest` is accessible

### Icons not showing
- Ensure PNG icons exist in `public/icons/`
- Check manifest.webmanifest paths
- Clear browser cache and reinstall

### Build fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (requires 18+)

---

## Updating the App

1. Make your changes
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Deploy using your chosen method
5. Users will get updates automatically (PWA service worker)

---

## Analytics (Optional)

To add Google Analytics or similar:

1. Add tracking script to `index.html`
2. Or use a React analytics library
3. Respect user privacy and add cookie consent if needed

---

## Support

For issues or questions:
- Check the [README.md](README.md)
- Open an issue on GitHub
- Review Vite documentation: https://vitejs.dev/

---

**Happy deploying! ⚡**