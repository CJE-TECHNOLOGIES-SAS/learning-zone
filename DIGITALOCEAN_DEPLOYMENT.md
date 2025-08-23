# DigitalOcean App Platform Deployment Guide

## Prerequisites
1. DigitalOcean account with billing enabled
2. GitHub repository with your code
3. doctl CLI installed and authenticated

## Deployment Steps

### 1. Install doctl (if not already installed)
```bash
# Windows (using winget)
winget install --id DigitalOcean.doctl

# Authenticate
doctl auth init
```

### 2. Deploy the App
```bash
# Create the app from spec file
doctl apps create --spec .do/app.yaml

# Or update existing app
doctl apps update YOUR_APP_ID --spec .do/app.yaml
```

### 3. Set Environment Variables
After creating the app, you need to set the secret environment variables through the DigitalOcean web interface or via doctl:

```bash
# Get your app ID
doctl apps list

# Set environment variables (replace YOUR_APP_ID with actual ID)
doctl apps update YOUR_APP_ID --spec .do/app.yaml
```

### 4. Environment Variables to Set in DigitalOcean Dashboard

Navigate to your app in the DigitalOcean dashboard and add these environment variables to the **backend** service:

**Database:**
- `DATABASE_URL`: `mysql+aiomysql://username:password@host:port/database_name`

**Email (SendGrid):**
- `EMAIL_FROM`: `learning-zone@cjetechnology.org`
- `EMAIL_FROM_SUGGESTION`: `sugerencias@cjetechnology.org`
- `SENDGRID_API_KEY`: `[Your SendGrid API Key]`
- `SENDGRID_TEMPLATE_SUGGESTION_ID`: `d-1ef653a4633e4e21b22305c9669f615e`
- `SENDGRID_TEMPLATE_REGISTER_ID`: `d-952dc2b9f994497db6b2bc95a4605a85`
- `SENDGRID_TEMPLATE_PASSWORD_ID`: `d-f4179efbb8c64064a587ea23e4152b75`
- `SENDGRID_TEMPLATE_NOTIFICATION_ID`: `d-d7b31470c0bd4a45aa661faa7823d0b7`

**Authentication:**
- `TOKEN_KEY`: `[Your secret key for JWT tokens]`

**AI Service:**
- `GEMINI_API_KEY`: `[Your Google Gemini API Key]`

**File Storage (Cloudinary):**
- `CLOUD_NAME`: `[Your Cloudinary cloud name]`
- `CLOUDINARY_API_KEY`: `[Your Cloudinary API key]`
- `CLOUDINARY_API_SECRET`: `[Your Cloudinary API secret]`

**Admin User:**
- `ADMIN_EMAIL`: `admin@learning-zone.com`
- `ADMIN_PASSWORD`: `[Your secure admin password]`

### 5. Database Setup

The app spec includes a MySQL database. After deployment:

1. Get database connection details from DigitalOcean dashboard
2. Update the `DATABASE_URL` environment variable with the correct connection string
3. Run database migrations (if needed)

### 6. Monitor Deployment

```bash
# Check app status
doctl apps get YOUR_APP_ID

# View app logs
doctl apps logs YOUR_APP_ID --follow

# View specific service logs
doctl apps logs YOUR_APP_ID --component backend --follow
```

### 7. Access Your App

Once deployed, your app will be available at:
- Main app: `https://your-app-name.ondigitalocean.app`
- API endpoints: `https://your-app-name.ondigitalocean.app/api`
- Chat service: `https://your-app-name.ondigitalocean.app/chat`

## Troubleshooting

### Common Issues:

1. **Build failures**: Check logs and ensure all dependencies are listed correctly
2. **Runtime errors**: Verify environment variables are set correctly
3. **Database connection**: Ensure DATABASE_URL format is correct for your database

### Useful Commands:

```bash
# List all apps
doctl apps list

# Get app details
doctl apps get YOUR_APP_ID

# View deployments
doctl apps list-deployments YOUR_APP_ID

# Restart app
doctl apps create-deployment YOUR_APP_ID

# Delete app (careful!)
doctl apps delete YOUR_APP_ID
```

## Alternative: Manual Environment Setup

If you prefer to set environment variables via the web interface:

1. Go to https://cloud.digitalocean.com/apps
2. Select your app
3. Go to "Settings" > "App-level environment variables"
4. Add each environment variable with appropriate scope (BUILD_TIME or RUN_TIME)
5. Mark sensitive variables as "Secret"
6. Trigger a new deployment

## Security Notes

- Never commit API keys or secrets to your repository
- Use DigitalOcean's secret management for sensitive environment variables
- Regularly rotate API keys and passwords
- Monitor your app logs for any security issues
