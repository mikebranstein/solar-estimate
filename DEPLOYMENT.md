# Deployment Checklist

Use this checklist when preparing to deploy the Solar Energy Estimator to production.

## Pre-Deployment

### Security

- [ ] **API Key Security**
  - [ ] Add API key restrictions in Google Cloud Console
  - [ ] Restrict Google Maps API key to production domain
  - [ ] Add HTTP referrer restrictions
  - [ ] Never commit `.env` files to version control

- [ ] **CORS Configuration**
  - [ ] Update CORS settings in `backend/server.js` to restrict origins
  - [ ] Change from `cors()` to `cors({ origin: 'https://yourdomain.com' })`

- [ ] **Environment Variables**
  - [ ] Set all environment variables on production server
  - [ ] Use secure environment variable storage (not .env files)
  - [ ] Different API keys for production vs development

### Code Quality

- [ ] **Testing**
  - [ ] Test with multiple addresses
  - [ ] Test in different regions
  - [ ] Test error handling (invalid addresses, API failures)
  - [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - [ ] Mobile responsiveness testing

- [ ] **Performance**
  - [ ] Build production bundle: `cd frontend && npm run build`
  - [ ] Check bundle size
  - [ ] Test with production build locally
  - [ ] Optimize images if any were added

### Configuration

- [ ] **Frontend**
  - [ ] Update `REACT_APP_API_URL` to production API URL
  - [ ] Verify Google Maps API key is correct
  - [ ] Remove any console.log statements
  - [ ] Check that .env is in .gitignore

- [ ] **Backend**
  - [ ] Set `PORT` environment variable
  - [ ] Verify all API keys are configured
  - [ ] Set `NODE_ENV=production`
  - [ ] Configure rate limiting if needed

## Deployment Options

### Option 1: Traditional Server (VPS/Cloud)

#### Backend Deployment

1. **Server Setup**
   - [ ] Install Node.js on server
   - [ ] Install PM2 or similar process manager
   - [ ] Set up nginx or Apache as reverse proxy
   - [ ] Configure SSL/TLS certificate

2. **Deploy Backend**
   ```bash
   # On your server
   git clone <repository-url>
   cd solar-estimate/backend
   npm install --production
   # Set environment variables
   pm2 start server.js --name solar-api
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration Example**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Frontend Deployment

1. **Build**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Web Server**
   - [ ] Upload `build/` folder to server
   - [ ] Configure nginx/Apache to serve static files
   - [ ] Set up redirects for React Router

3. **Nginx Configuration Example**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/solar-estimate/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Option 2: Platform as a Service (PaaS)

#### Heroku

**Backend:**
1. [ ] Create `Procfile` in backend folder:
   ```
   web: node server.js
   ```
2. [ ] Deploy:
   ```bash
   heroku create your-app-name-api
   heroku config:set GOOGLE_MAPS_API_KEY=xxx
   heroku config:set NREL_API_KEY=xxx
   git push heroku main
   ```

**Frontend:**
- [ ] Deploy to Netlify, Vercel, or similar
- [ ] Set environment variables in platform dashboard
- [ ] Configure build command: `npm run build`
- [ ] Configure publish directory: `build`

#### Vercel (Full Stack)

Both frontend and backend can be deployed together:
1. [ ] Create `vercel.json` in root
2. [ ] Configure serverless functions
3. [ ] Deploy: `vercel --prod`

### Option 3: Containerized (Docker)

1. **Create Dockerfiles**

Backend `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

2. **Docker Compose**
```yaml
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Post-Deployment

### Monitoring

- [ ] **Set Up Monitoring**
  - [ ] Application monitoring (New Relic, DataDog, etc.)
  - [ ] Error tracking (Sentry, Rollbar)
  - [ ] Uptime monitoring
  - [ ] API usage monitoring

- [ ] **Logging**
  - [ ] Configure production logging
  - [ ] Set up log aggregation
  - [ ] Monitor error logs

### Performance

- [ ] **CDN**
  - [ ] Serve frontend static assets via CDN
  - [ ] Enable gzip compression
  - [ ] Set appropriate cache headers

- [ ] **Database** (if you add one later)
  - [ ] Set up backups
  - [ ] Configure connection pooling
  - [ ] Index optimization

### Maintenance

- [ ] **Documentation**
  - [ ] Document deployment process
  - [ ] Create runbook for common issues
  - [ ] Document environment variables

- [ ] **Backup**
  - [ ] Backup configuration files
  - [ ] Version control everything
  - [ ] Document rollback procedure

## Cost Optimization

### API Usage

- [ ] **Google Maps/Solar API**
  - [ ] Monitor daily usage
  - [ ] Set up billing alerts
  - [ ] Implement caching for repeated requests
  - [ ] Consider batch requests where possible

- [ ] **NREL API**
  - [ ] Free tier is 1000 requests/hour
  - [ ] Cache irradiance data (changes slowly)
  - [ ] Implement request throttling if needed

### Infrastructure

- [ ] Right-size server resources
- [ ] Use auto-scaling if traffic varies
- [ ] Monitor bandwidth usage
- [ ] Optimize image delivery

## Legal & Compliance

- [ ] **Terms of Service**
  - [ ] Add Google Maps attribution
  - [ ] Include NREL data attribution
  - [ ] Create privacy policy
  - [ ] Add terms of service

- [ ] **Disclaimers**
  - [ ] Add disclaimer about estimate accuracy
  - [ ] Recommend professional assessment
  - [ ] Include data source limitations

- [ ] **GDPR/Privacy** (if applicable)
  - [ ] Cookie consent if tracking users
  - [ ] Privacy policy
  - [ ] Data retention policy

## Launch Checklist

Final checks before going live:

- [ ] All tests passing
- [ ] Production environment variables set
- [ ] SSL certificate installed and working
- [ ] Custom domain configured
- [ ] Google Analytics or similar installed (optional)
- [ ] Favicon and meta tags configured
- [ ] Error pages (404, 500) customized
- [ ] Contact/support information added
- [ ] Monitoring and alerting active
- [ ] Documentation complete
- [ ] Team trained on operations
- [ ] Rollback plan tested

## Post-Launch

- [ ] Monitor for errors in first 24 hours
- [ ] Check API usage and costs
- [ ] Gather user feedback
- [ ] Document any issues encountered
- [ ] Plan for future enhancements

---

Remember: Start small, test thoroughly, and scale gradually!
