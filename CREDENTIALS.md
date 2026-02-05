# AdZapp Judge Credentials - Updated

## 🔐 Judge Login Credentials (Name-Based)

Judges log in using **only their name and password**. 
You don't need real emails! We use "Placeholder IDs" to set them up in Supabase.

### How Judges Login

1. Go to `login.html`
2. Select **"Judge"** in the "Login As" section
3. Enter your name: e.g., "Chetna Chand"
4. Enter your password
5. Click "Sign In"

---

## 👨‍⚖️ Judge Accounts

### Judge 1: Chetna Chand
- **Login Name:** `Chetna Chand`
- **ID to put in Supabase Email field:** `chetna.chand@judge.adzapp.com`
- **Password:** (Your choice, e.g., `chetna123`)

### Judge 2: Purvi Ramanujan
- **Login Name:** `Purvi Ramanujan`
- **ID to put in Supabase Email field:** `purvi.ramanujan@judge.adzapp.com`
- **Password:** (Your choice, e.g., `purvi123`)

### Judge 3: Vashim Qureshi
- **Login Name:** `Vashim Qureshi`
- **ID to put in Supabase Email field:** `vashim.qureshi@judge.adzapp.com`
- **Password:** (Your choice, e.g., `vashim123`)

### Judge 4: Hetal Joshiyara
- **Login Name:** `Hetal Joshiyara`
- **ID to put in Supabase Email field:** `hetal.joshiyara@judge.adzapp.com`
- **Password:** (Your choice, e.g., `hetal123`)

---

## 👔 User (Admin) Account

Users (who are also administrators) can sign up themselves.

### How to Register as a User
1. Go to `signup.html`
2. Register with any **Gmail** address (`@gmail.com`) or `@admin.adzapp.com`
3. Once signed up, log in as **User (Admin)** on the login page.
4. **Access**: Full administration dashboard.

---

## 🚀 Setup Instructions

### Method 1: Using Supabase Dashboard (For Judges & Admin)

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Create users** for judges and admin:
   - **Admin**: `admin@admin.adzapp.com`
   - **Judge 1**: `chetna.chand@judge.adzapp.com`
   - **Judge 2**: `purvi.ramanujan@judge.adzapp.com`
   - **Judge 3**: `vashim.qureshi@judge.adzapp.com`
   - **Judge 4**: `hetal.joshiyara@judge.adzapp.com`

3. **Done!** Judges can now log in directly using their Names and the passwords you set.

### Method 2: Using Supabase Dashboard (For Admin)

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Create admin user:**
   - Email: `admin@admin.adzapp.com`
   - Password: `admin123`
   - Click "Create User"

3. **Create judge users** (if not using signup page):
   - Email: `chetna.chand@judge.adzapp.com`
   - Password: `chetna123`
   - Repeat for all judges

4. **Run SQL to link judges:**
   ```sql
   -- After creating users, get their UUIDs and run:
   INSERT INTO judges (judge_id, judge_name, email) VALUES
   ('uuid-1', 'Chetna Chand', 'chetna.chand@judge.adzapp.com'),
   ('uuid-2', 'Purvi Ramanujan', 'purvi.ramanujan@judge.adzapp.com'),
   ('uuid-3', 'Vashim Qureshi', 'vashim.qureshi@judge.adzapp.com'),
   ('uuid-4', 'Hetal Joshiyara', 'hetal.joshiyara@judge.adzapp.com');
   ```

### Method 3: Run SQL Script (Optional)

Run the `judge_credentials_setup.sql` script in Supabase SQL Editor to set up the judge credentials table.

---

## 📝 How It Works

### For Judges (Name-Based Login)
1. Judge enters their name: "Chetna Chand"
2. System converts to email: "chetna.chand@judge.adzapp.com"
3. Authenticates with Supabase using this email
4. Judge never sees or needs to know the email

### For Admin (Email-Based Login)
1. Admin enters email: "admin@admin.adzapp.com"
2. System detects it's an email (contains @)
3. Authenticates directly with Supabase
4. Redirects to admin dashboard

---

## 🎯 Quick Reference

| User Type | Login Field | Example | Password |
|-----------|-------------|---------|----------|
| **Judge** | Name | "Chetna Chand" | chetna123 |
| **Judge** | Name | "Purvi Ramanujan" | purvi123 |
| **Judge** | Name | "Vashim Qureshi" | vashim123 |
| **Judge** | Name | "Hetal Joshiyara" | hetal123 |
| **Admin** | Email | admin@admin.adzapp.com | admin123 |

---

## ⚠️ Important Notes

1. **Judges don't need email** - They only use their name and password
2. **Email is auto-generated** - System creates `firstname.lastname@judge.adzapp.com` internally
3. **Login accepts both** - Judges can use name, admins use email
4. **Passwords are suggestions** - Change them as needed
5. **First signup wins** - Once a judge name is registered, it can't be used again

---

## 🔧 Troubleshooting

### "Invalid name/email or password"
- Check spelling of judge name (case-sensitive)
- Verify password is correct
- Check spelling of judge name (must match predefined list)
- Verify password is correct
- Ensure account was created in Supabase Auth by the admin

### "An account already exists for this judge"
- This judge has already signed up
- Use login page instead
- Contact admin if you forgot password

### Can't find judge name in dropdown
- Only the 4 authorized judges can sign up
- Contact admin to add more judges

---

## 📞 Support

For password resets or account issues:
1. Contact the admin
2. Admin can reset password in Supabase Dashboard → Authentication → Users
3. Or delete and recreate the account
