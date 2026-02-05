-- ============================================
-- BULK CREATE USERS
-- Run this in the Supabase SQL Editor
-- ============================================

-- Function to create user if not exists
CREATE OR REPLACE FUNCTION create_user_if_not_exists(user_email TEXT, user_password TEXT)
RETURNS void AS $$
DECLARE
  user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- Check if user exists
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    -- Generate UUID
    user_id := gen_random_uuid();
    -- Encrypt password (requires pgcrypto extension, usually enabled by default in Supabase)
    encrypted_pw := crypt(user_password, gen_salt('bf'));
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      user_email,
      encrypted_pw,
      NOW(), -- Auto-confirm email
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Insert into identities to allow login
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      user_id,
      format('{"sub":"%s","email":"%s"}', user_id::text, user_email)::jsonb,
      'email',
      user_id::text,
      NOW(),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created user: %', user_email;
  ELSE
    RAISE NOTICE 'User already exists: %', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create users
SELECT create_user_if_not_exists('shreybutala01@gmail.com', 'shreybutala01@gmail.com');
SELECT create_user_if_not_exists('parthmakwana1606@gmail.com', 'parthmakwana1606@gmail.com');
SELECT create_user_if_not_exists('krupalikothari371@gmail.com', 'krupalikothari371@gmail.com');
SELECT create_user_if_not_exists('yativagadiya@gmail.com', 'yativagadiya@gmail.com');
SELECT create_user_if_not_exists('aleenasebi22@gmail.com', 'aleenasebi22@gmail.com');
SELECT create_user_if_not_exists('khushipatela15@gmail.com', 'khushipatela15@gmail.com');
SELECT create_user_if_not_exists('dhruvipatel1756@gmail.com', 'dhruvipatel1756@gmail.com');
SELECT create_user_if_not_exists('hp1707697@gmail.com', 'hp1707697@gmail.com');
SELECT create_user_if_not_exists('dhrumitailor@gmail.com', 'dhrumitailor@gmail.com');
SELECT create_user_if_not_exists('dishantsolanki2612@gmail.com', 'dishantsolanki2612@gmail.com');
SELECT create_user_if_not_exists('djm090906@gmail.com', 'djm090906@gmail.com');
SELECT create_user_if_not_exists('pateldhruvika848@gmail.com', 'pateldhruvika848@gmail.com');

-- Validation
SELECT email, created_at FROM auth.users WHERE email LIKE '%@gmail.com' ORDER BY created_at DESC;
