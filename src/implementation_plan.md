# ManagePoint — Logo Fix + Profile & Project Image Upload

## Overview
Three features to implement:
1. **Logo Fix** – Remove blue rounded-square background from app logo shown on Login/Register pages so it renders cleanly on any background.
2. **User Profile Image Upload** – Let users upload a profile photo (JPG/PNG) from Settings. Preview before saving, store in Supabase Storage, show in Navbar avatar.
3. **Project Thumbnail Upload** – Let project creators upload a thumbnail when creating a project. Preview before submit, store in Supabase Storage, show on ProjectCard.

## Proposed Changes

---

### Feature 1 – Logo Fix

#### [MODIFY] [LoginPage.jsx](file:///d:/Work/MAP%20Final/ManagePoint/src/pages/LoginPage.jsx)
Replace the blue wrapper `div` with a transparent container:
```diff
- <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30">
-     <img src="/favicon.ico" alt="ManagePoint" className="size-8 rounded-lg" />
- </div>
+ <div className="size-16 mx-auto mb-4 flex items-center justify-center">
+     <img src="/favicon.ico" alt="ManagePoint" className="size-16 drop-shadow-lg" />
+ </div>
```

#### [MODIFY] [RegisterPage.jsx](file:///d:/Work/MAP%20Final/ManagePoint/src/pages/RegisterPage.jsx)
Same fix for the indigo logo wrapper.

---

### Feature 2 – User Profile Image Upload

#### [MODIFY] [authSlice.js](file:///d:/Work/MAP%20Final/ManagePoint/src/features/authSlice.js)
- Add `updateProfileImage` async thunk:
  - Upload file to Supabase Storage bucket `avatars/{userId}/{filename}`
  - Get public URL
  - Update `profiles.image_url` in DB
  - Update localStorage `auth_user.avatar_url`
  - Return `{ avatar_url }` for reducer
- Add `avatar_url` to reducer state update in `updateProfile.fulfilled`
- Add `updateCurrentUserAvatar` action to set `currentUser.avatar_url` in state

> **Note:** `profiles` table already has `image_url` column per `supabase_setup.sql`. The Supabase Storage bucket `avatars` needs to be created in the Supabase dashboard with public access. The SQL to create it is provided in the verification section.

#### [MODIFY] [SettingsPage.jsx](file:///d:/Work/MAP%20Final/ManagePoint/src/pages/SettingsPage.jsx)
In the Profile tab:
- Replace the static letter-avatar with a **clickable** circular image:
  - If `currentUser.avatar_url` exists → show `<img>` in circle
  - Else → show letter initial
  - Hidden `<input type="file" accept="image/jpeg,image/png">` triggered on click
- Add preview state: when user picks a file, use `URL.createObjectURL()` to preview locally before saving
- Add "Change photo" button and "Save photo" button (only shown when a new file is picked)
- Validate: only JPG/PNG accepted; show toast error otherwise
- Show spinner while uploading
- On success: toast "Profile photo updated!", clear preview state

#### [MODIFY] [Navbar.jsx](file:///d:/Work/MAP%20Final/ManagePoint/src/components/Navbar.jsx)
- Change `currentUser?.image` → `currentUser?.avatar_url` to match the authSlice field name.

---

### Feature 3 – Project Thumbnail Upload

#### [MODIFY] [CreateProjectDialog.jsx](file:///d:/Work/MAP%20Final/ManagePoint/src/components/CreateProjectDialog.jsx)
- Add `thumbnailFile` and `thumbnailPreview` state
- Add image upload input (hidden) + clickable upload area with preview inside the form
- Validate JPG/PNG only, max 5 MB
- On submit:
  1. If `thumbnailFile` is set, upload to Supabase Storage bucket `project-thumbnails/{projectId}/{filename}`
  2. Get public URL, include as `thumbnail_url` in project INSERT
  3. Dispatch `addProject` with `thumbnail_url`

> **Note:** The `projects` table doesn't have a `thumbnail_url` column yet. We'll add an ALTER TABLE in a new SQL migration file.

#### [NEW] [add_project_thumbnail.sql](file:///d:/Work/MAP%20Final/ManagePoint/add_project_thumbnail.sql)
```sql
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
```

#### [MODIFY] [ProjectCard.jsx](file:///d:/Work/MAP%20Final/ManagePoint/src/components/ProjectCard.jsx)
- If `project.thumbnail_url` exists, show it as a banner image at the top of the card (replacing the colored progress bar accent strip with an actual image)
- Fall back to the gradient bar if no thumbnail

---

## Verification Plan

### Manual Testing Steps

**1. Logo Fix**
- Run dev server: `npm run dev` in `d:\Work\MAP Final\ManagePoint`
- Navigate to `http://localhost:5173/login`
- Confirm the logo shows without any colored background square
- Navigate to `http://localhost:5173/register` and confirm the same

**2. Profile Image Upload**
- Sign in to the app
- Go to **Settings → Profile tab**
- Click the avatar circle → file picker opens
- Select a JPG/PNG photo → circular preview appears immediately
- Click **Save photo** → spinner shows while uploading → success toast
- Verify the Navbar avatar in top-right now shows the uploaded photo
- Sign out, sign back in → avatar still shows (persisted via localStorage + DB)
- Try uploading an unsupported file (`.webp` or `.gif`) → error toast shown

**3. Project Thumbnail Upload**
- From Dashboard, click **New Project**
- In the Create Project dialog, click the thumbnail upload area
- Select a JPG/PNG file → preview renders in the dialog
- Fill in project name and click **Create Project**
- On the Projects page, verify the card shows the thumbnail image at the top
- Create a project without a thumbnail → card shows the colored gradient bar (unchanged behavior)

### Supabase Buckets to Create Manually
Before testing Feature 2 and 3, create these Storage buckets in Supabase dashboard:
- `avatars` — Public bucket, allowed MIME types: `image/jpeg, image/png`
- `project-thumbnails` — Public bucket, allowed MIME types: `image/jpeg, image/png`
