# AdZapp - Judge Evaluation & Total Scoring System

A production-ready web-based judge evaluation system for the **AdZapp – Advertisement Skit Competition**. This system allows any number of judges to evaluate teams, with final scores calculated as the **total sum** of all judges' scores.

## 🎯 Key Features

- ✅ **Dynamic Judge System** - Any number of judges can evaluate any team
- ✅ **Total Sum Scoring** - Final scores are the sum of all judges' scores (no averaging)
- ✅ **One-Time Submission** - Judges can submit only once per team (permanent & read-only)
- ✅ **Secure Authentication** - Powered by Supabase Auth
- ✅ **Row Level Security** - Judges can only see their own evaluations
- ✅ **Admin Dashboard** - Complete rankings, statistics, and CSV export
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Professional UI** - Clean, academic design

## 📋 Scoring Criteria

| Criteria | Max Marks |
|----------|-----------|
| Skit Execution | 20 |
| Slogan / Jingle | 15 |
| Team Coordination | 15 |
| **Total per Judge** | **50** |

### Rule Compliance Checks
- Offensive / Vulgar Content (Yes/No)
- Original Content (Yes/No)
- Time Limit Followed 2-3 min (Yes/No)

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to initialize

### 2. Run Database Schema

1. Open the Supabase SQL Editor
2. Copy the entire contents of `database_schema.sql`
3. Run the SQL script
4. Verify that tables are created: `judges`, `teams`, `evaluations`

### 3. Configure Application

1. Open `config.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
3. Get these values from: Supabase Dashboard → Settings → API

### 4. Create Users

#### Create Admin Users
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Use email ending with `@admin.adzapp.com` (e.g., `admin@admin.adzapp.com`)
4. Set a password
5. Admin users will have access to the admin dashboard

#### Create Judge Users
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Use any email (e.g., `judge1@example.com`)
4. Set a password
5. Judges will automatically be added to the `judges` table on first login

### 5. Deploy Application

#### Option A: Local Development
1. Open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

#### Option B: Deploy to Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Deploy (no build command needed - static site)

#### Option C: Deploy to Vercel
1. Push code to GitHub
2. Import project to Vercel
3. Deploy (no build configuration needed)

## 📖 Usage Guide

### For Judges

1. **Login**
   - Navigate to the login page
   - Enter your email and password
   - You'll be redirected to the evaluation form

2. **Evaluate Teams**
   - Select a team from the dropdown
   - Enter scores for each criteria (auto-validates max marks)
   - Check rule compliance boxes
   - Total score is calculated automatically
   - Click "Submit Evaluation"
   - Confirm submission (this is final and cannot be edited)

3. **View Your Submissions**
   - Scroll down to see all teams you've evaluated
   - Submissions are read-only after submission

### For Admins

1. **Login**
   - Use your admin email (`@admin.adzapp.com`)
   - You'll be redirected to the admin dashboard

2. **View Rankings**
   - Teams are ranked by total score (sum of all judges)
   - See number of judges who evaluated each team
   - View average scores per criteria
   - Offensive content flags are highlighted

3. **View Details**
   - Click "View Details" on any team
   - See individual judge scores
   - View rule compliance for each evaluation

4. **Export Data**
   - Click "Export to CSV"
   - Downloads complete results including:
     - Team rankings
     - Individual evaluations
     - All scores and compliance data

## 🗄️ Database Structure

### Tables

**judges**
- `judge_id` (UUID, primary key)
- `judge_name` (TEXT)
- `email` (TEXT)
- `created_at` (TIMESTAMP)

**teams**
- `team_id` (UUID, primary key)
- `team_number` (INT)
- `team_leader` (TEXT)

**evaluations**
- `evaluation_id` (UUID, primary key)
- `judge_id` (UUID, foreign key)
- `team_id` (UUID, foreign key)
- `skit_execution` (INT, 0-20)
- `slogan_jingle` (INT, 0-15)
- `team_coordination` (INT, 0-15)
- `total_score` (INT, auto-calculated)
- `offensive_content` (BOOLEAN)
- `original_content` (BOOLEAN)
- `time_limit_followed` (BOOLEAN)
- `created_at` (TIMESTAMP)
- **UNIQUE constraint on (judge_id, team_id)**

### Security (RLS Policies)

- ✅ Judges can only view their own evaluations
- ✅ Judges can insert evaluations (one per team)
- ❌ Judges cannot update evaluations
- ❌ Judges cannot delete evaluations
- ✅ Admins can view all evaluations

## 🔧 Customization

### Change Team Leaders
Edit `database_schema.sql` and modify the INSERT statements:
```sql
INSERT INTO teams (team_number, team_leader) VALUES
(1, 'Your Team Leader'),
(2, 'Another Team Leader'),
...
```

### Change Scoring Criteria
1. Update `database_schema.sql` with new max values
2. Update `judge.html` with new input max attributes
3. Update `judge.js` validation logic
4. Update total score calculation

### Change Admin Email Domain
Edit RLS policies in `database_schema.sql`:
```sql
-- Change @admin.adzapp.com to your domain
WHERE email LIKE '%@yourdomain.com'
```

## 🐛 Troubleshooting

### "Invalid login credentials"
- Verify user exists in Supabase Authentication
- Check email and password are correct
- Ensure email is confirmed (if email confirmation is enabled)

### "Error loading teams"
- Verify database schema is created
- Check RLS policies are enabled
- Ensure teams are inserted in database

### "You have already evaluated this team"
- This is expected - judges can only evaluate each team once
- Check "Your Submitted Evaluations" section to see previous submissions

### Admin can't see all data
- Verify admin email contains `@admin.adzapp.com`
- Check RLS policies are correctly configured
- Try logging out and back in

### Scores not calculating correctly
- Ensure all score inputs are numbers
- Check browser console for JavaScript errors
- Verify total_score validation trigger is created

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Notes

- All data is stored in Supabase with Row Level Security
- Passwords are hashed by Supabase Auth
- HTTPS is enforced in production
- No sensitive data in client-side code
- Unique constraints prevent duplicate submissions

## 📊 Sample Data

The database schema includes 15 sample teams (Team Alpha through Team Omicron). You can modify these or add more teams as needed.

## 🎨 Design Philosophy

- **Professional & Academic** - Clean, minimal design suitable for formal competitions
- **Fast Data Entry** - Table-based forms for quick evaluation
- **Mobile-First** - Responsive design works on all devices
- **Accessible** - Proper labels, semantic HTML, keyboard navigation

## 📄 File Structure

```
ADZAP/
├── index.html              # Landing page
├── login.html              # Login page
├── login.js                # Login logic
├── judge.html              # Judge evaluation form
├── judge.js                # Judge evaluation logic
├── admin.html              # Admin dashboard
├── admin.js                # Admin dashboard logic
├── config.js               # Supabase configuration
├── styles.css              # Global styles
├── database_schema.sql     # Database setup
└── README.md               # This file
```

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Verify database schema is correctly applied

## 📝 License

© 2026 AdZapp. All rights reserved.

---

**Built with:**
- HTML5, CSS3, JavaScript (Vanilla)
- Supabase (Database + Authentication)
- No heavy frameworks - lightweight and fast!
