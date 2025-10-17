# Database Keepalive Setup

## Problem

Supabase free tier databases pause after 24 hours of inactivity. This document explains how to implement automated keepalive pings to prevent database pausing.

## Solution Overview

The application includes a keepalive endpoint (`/api/keepalive`) that performs a simple database query every 12 hours to keep the database active.

**Two implementation options:**
1. **Vercel Cron Jobs** (Recommended for Vercel Pro users)
2. **GitHub Actions** (Recommended for free tier / any plan)

---

## API Endpoint

### `GET /api/keepalive`

**Location:** `src/app/api/keepalive/route.ts`

**What it does:**
- Performs a lightweight query to the `clients` table
- Returns success status and timestamp
- Protected by `CRON_SECRET` environment variable

**Response:**
```json
{
  "success": true,
  "message": "Database keepalive successful",
  "timestamp": "2024-08-25T12:00:00.000Z",
  "clientCount": 5
}
```

---

## Option 1: Vercel Cron Jobs (Vercel Pro Required)

### Setup Steps

1. **Add CRON_SECRET to Vercel**
   ```bash
   # Generate a random secret
   openssl rand -base64 32
   ```

   Go to your Vercel project → Settings → Environment Variables:
   - **Key:** `CRON_SECRET`
   - **Value:** Your generated secret
   - **Environments:** Production, Preview, Development

2. **Deploy the changes**
   ```bash
   git add .
   git commit -m "Add database keepalive cron job"
   git push
   ```

3. **Verify cron configuration**
   - File `vercel.json` is already configured
   - Cron runs every 12 hours: `0 */12 * * *` (00:00 and 12:00 UTC)
   - Vercel will automatically detect and register the cron job

4. **Monitor execution**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on a deployment → Logs
   - Filter by `/api/keepalive` to see cron execution logs

### Limitations

- **Requires Vercel Pro plan** ($20/month per user)
- Cron jobs not available on Hobby (free) plan in production
- Development mode cron works on all plans (for testing)

---

## Option 2: GitHub Actions (Free, Any Vercel Plan)

This is the **recommended approach for free tier** users.

### Setup Steps

1. **Add CRON_SECRET to GitHub**

   Go to your GitHub repository → Settings → Secrets and variables → Actions:
   - Click **New repository secret**
   - **Name:** `CRON_SECRET`
   - **Value:** Same secret value you generated (or generate a new one)
   - Click **Add secret**

2. **Add CRON_SECRET to Vercel** (for API authentication)

   Go to your Vercel project → Settings → Environment Variables:
   - **Key:** `CRON_SECRET`
   - **Value:** Same secret as GitHub
   - **Environments:** Production (required), Preview/Development (optional)

3. **Enable GitHub Actions**

   The workflow file is already created at `.github/workflows/keepalive.yml`

   ```bash
   git add .
   git commit -m "Add GitHub Actions keepalive workflow"
   git push
   ```

4. **Verify workflow is enabled**

   Go to GitHub repository → Actions tab:
   - You should see "Database Keepalive" workflow
   - Click on it to view scheduled runs
   - Click **Run workflow** to test immediately

5. **Monitor execution**

   - Actions tab → Database Keepalive → Click on any run
   - View logs to confirm successful pings
   - Workflow runs every 12 hours automatically

### Schedule

The workflow runs:
- **Automatically:** Every 12 hours at 00:00 and 12:00 UTC
- **Manually:** Click "Run workflow" in GitHub Actions tab for on-demand testing

### Advantages

- ✅ **Free** - GitHub Actions provides generous free tier
- ✅ **Works with any Vercel plan** (including Hobby/free)
- ✅ **Reliable** - GitHub's infrastructure handles scheduling
- ✅ **Manual trigger** - Test anytime via GitHub UI
- ✅ **Visible logs** - Easy to monitor and debug

---

## Testing the Keepalive Endpoint

### Local Testing

1. **Add CRON_SECRET to `.env.local`**
   ```bash
   CRON_SECRET=your_test_secret
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Test the endpoint**
   ```bash
   curl -X GET \
     -H "Authorization: Bearer your_test_secret" \
     http://localhost:3000/api/keepalive
   ```

   Expected response:
   ```json
   {
     "success": true,
     "message": "Database keepalive successful",
     "timestamp": "2024-08-25T14:30:00.000Z",
     "clientCount": 5
   }
   ```

### Production Testing

```bash
# Replace YOUR_SECRET with your actual CRON_SECRET
curl -X GET \
  -H "Authorization: Bearer YOUR_SECRET" \
  https://sous-v1.vercel.app/api/keepalive
```

---

## Security

The endpoint is protected by the `CRON_SECRET` environment variable:

- Requests must include `Authorization: Bearer <CRON_SECRET>` header
- Without valid secret, returns `401 Unauthorized`
- Secret should be a strong random string (32+ characters)

### Generate a Strong Secret

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# https://www.random.org/strings/ (32 characters, alphanumeric)
```

---

## Troubleshooting

### Endpoint returns 401 Unauthorized

- Verify `CRON_SECRET` is set in environment variables (Vercel and/or GitHub)
- Check that secrets match between GitHub and Vercel
- Ensure the `Authorization` header is correctly formatted: `Bearer <secret>`

### Endpoint returns 500 Database query failed

- Check Supabase is running (visit Supabase dashboard)
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Check Vercel function logs for detailed error messages

### GitHub Action workflow not running

- Verify workflow file is in `.github/workflows/keepalive.yml`
- Check Actions tab → Enable workflows if disabled
- Ensure `CRON_SECRET` is added to GitHub repository secrets

### Vercel Cron not executing

- Confirm you have Vercel Pro plan (required for production crons)
- Check `vercel.json` is in repository root
- View deployment logs in Vercel dashboard
- Cron jobs may take up to 1 hour to register after deployment

---

## Monitoring Recommendations

### GitHub Actions Notifications

Enable notifications for failed workflow runs:
- GitHub → Settings → Notifications
- Check "Actions" under "Email" or "Web and Mobile"
- Get alerted if keepalive fails

### Uptime Monitoring (Optional)

For additional monitoring, use free services like:
- **UptimeRobot** - Free tier includes 50 monitors
- **Better Uptime** - Free tier with status pages
- **Cronitor** - Dedicated cron monitoring

Set them to monitor: `https://sous-v1.vercel.app/api/keepalive`

---

## Schedule Modification

To change the keepalive frequency:

### Vercel Cron (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/keepalive",
      "schedule": "0 */6 * * *"  // Every 6 hours
    }
  ]
}
```

### GitHub Actions (`.github/workflows/keepalive.yml`)

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
```

**Cron syntax:** `minute hour day-of-month month day-of-week`

Common examples:
- Every 6 hours: `0 */6 * * *`
- Every 12 hours: `0 */12 * * *`
- Daily at midnight: `0 0 * * *`
- Every 8 hours: `0 */8 * * *`

**Note:** Keep interval under 24 hours to prevent database pausing.

---

## Recommendation

**For most users:** Use **GitHub Actions** (Option 2)
- Free and reliable
- Works with Vercel free tier
- Easy to monitor and debug

**Upgrade to Vercel Cron if:**
- You already have Vercel Pro
- You prefer integrated Vercel monitoring
- You want everything in one platform
