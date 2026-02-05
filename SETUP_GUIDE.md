# Quick Setup Guide - Judge Accounts

## 🚀 Quick Start (3 Steps)

### Step 1: Run the Database Schema
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database_schema.sql`
3. Click "Run"
4. Copy and paste the contents of `judge_credentials_setup.sql`
5. Click "Run"

---

## 📥 How to Import Teams from Excel/CSV
**Instead of adding teams one by one, you can upload them at once!**

1. Prepare your list in Excel with two columns: `team_number` and `team_leader`.
2. Save it as a **CSV (Comma Separated Values)** file. 
   *(You can use `TEAM_IMPORT_TEMPLATE.csv` as a guide)*.
3. Go to **Supabase Dashboard** → **Table Editor** (sidebar).
4. Click on the **`teams`** table.
5. Click **"Insert"** → **"Import data from CSV"**.
6. Drag and drop your CSV file.
7. Click **"Import Data"**.
8. **Done!** All your teams/leaders are now loaded.

---


---

## ⚠️ CRITICAL STEP: Disable Email Confirmation
**You must do this or no one will be able to log in!**

1. Go to your **Supabase Dashboard**.
2. Click on **Authentication** (sidebar) → **Settings**.
3. Scroll down to **"Email Auth"**.
4. **UNCHECK** the box that says **"Confirm email"**.
5. Scroll down to the bottom and click **"Save"**.

*This allows Judges and Users to log in immediately without needing to verify a real email address.*

---


### Step 2: Create Judge Accounts (Choose ONE method)

#### Method A: Using Supabase Dashboard (Recommended) ✅
1. Go to Supabase → Authentication → Users
2. Click "Add User" for each judge with these details:
   - **Chetna Chand**: `chetna.chand@judge.adzapp.com`
   - **Purvi Ramanujan**: `purvi.ramanujan@judge.adzapp.com`
   - **Vashim Qureshi**: `vashim.qureshi@judge.adzapp.com`
   - **Hetal Joshiyara**: `hetal.joshiyara@judge.adzapp.com`
3. Set your desired passwords.
4. Judges can now login immediately with their names.



### Step 3: Create User (Admin) Account
1. Open http://localhost:8000/signup.html
2. Enter any **Gmail** address (`@gmail.com`)
3. Create a password and sign up.
4. This user will have full access to the Administrator dashboard.
5. Done!

---

## 📝 How Judges Login

### Judges (Name-Based)
1. Go to http://localhost:8000/login.html
2. Select **"Judge"**
3. Enter name: **Chetna Chand**
4. Enter password: **chetna123**
5. Click "Sign In"

### Admin (Email-Based)
1. Go to http://localhost:8000/login.html
2. Select **"Administrator"**
3. Enter email: **admin@admin.adzapp.com**
4. Enter password: **admin123**
5. Click "Sign In"

---

## 🎯 Judge Credentials Summary

| Judge Name | Login Name | Password | Auto-Email (Internal) |
|------------|------------|----------|----------------------|
| Chetna Chand | `Chetna Chand` | `chetna123` | chetna.chand@judge.adzapp.com |
| Purvi Ramanujan | `Purvi Ramanujan` | `purvi123` | purvi.ramanujan@judge.adzapp.com |
| Vashim Qureshi | `Vashim Qureshi` | `vashim123` | vashim.qureshi@judge.adzapp.com |
| Hetal Joshiyara | `Hetal Joshiyara` | `hetal123` | hetal.joshiyara@judge.adzapp.com |

**Admin:**
- Email: `admin@admin.adzapp.com`
- Password: `admin123`

---



---

## ✅ Testing Checklist

- [ ] Database schema created (`database_schema.sql`)
- [ ] Judge credentials setup run (`judge_credentials_setup.sql`)
- [ ] Email confirmation disabled in Supabase
- [ ] All 4 judge accounts created
- [ ] Admin account created
- [ ] Test judge signup with one judge
- [ ] Test judge login with name
- [ ] Test admin login with email
- [ ] Test evaluation submission
- [ ] Test admin dashboard

---

## 🔧 Troubleshooting

### "Invalid name/email or password"
- Verify account was created in Supabase Auth
- Check password is correct
- Ensure email confirmation is disabled

- Use the login page with the correct Name and Password.
- If you still can't login, verify the user exists in Supabase.

### Can't access admin dashboard
- Verify email is `admin@admin.adzapp.com`
- Check that you're using email, not name
- Try logging out and back in

---

## 📞 Need Help?

1. Check Supabase Dashboard → Authentication → Users
2. Check browser console for errors (F12)
3. Check Supabase Dashboard → Logs
4. Refer to `CREDENTIALS.md` for detailed documentation
