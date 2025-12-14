# Navigation Structure - Item Return Desk

Complete navigation structure with all registered screens.

---

## Navigation Flow

```
App.js (Root)
├── SplashScreen (Initial Loading)
│
├── Auth Flow (When NOT authenticated)
│   └── AuthNavigator
│       ├── SliderScreen (Initial route)
│       ├── OnboardingScreen
│       ├── LoginScreen
│       └── SignupScreen
│
└── Main App (When authenticated)
    └── AppNavigator
        └── StackNavigator
            ├── BottomTabNavigator (MainTabs)
            │   ├── HomeScreen
            │   ├── MyPostsScreen
            │   ├── ChatListScreen (My Chats)
            │   ├── NotificationsScreen (Activity)
            │   └── ProfileScreen
            │
            └── Stack Screens
                ├── DetailsScreen (Post Details)
                ├── CreatePostScreen
                ├── EditPostScreen
                ├── LostPostsScreen
                ├── FoundPostsScreen
                ├── SettingsScreen
                ├── EditProfileScreen
                ├── ContactScreen
                ├── AdminPanelScreen
                ├── ReportPostScreen
                └── ChatScreen
```

---

## Auth Navigator Screens

### 1. SliderScreen
- **Route**: `Slider`
- **Initial Route**: Yes
- **Purpose**: First-time user onboarding slides
- **Navigation**: Auto-navigates to Onboarding after completion

### 2. OnboardingScreen
- **Route**: `Onboarding`
- **Purpose**: App introduction and signup/login options
- **Navigation**: 
  - Signup button → `Signup`
  - Login button → `Login`

### 3. LoginScreen
- **Route**: `Login`
- **Purpose**: User login with email/password
- **Features**:
  - Email input
  - Password input with visibility toggle
  - Forgot password link
  - Signup navigation
- **Integration**: ✅ Supabase Auth

### 4. SignupScreen
- **Route**: `Signup`
- **Purpose**: New user registration
- **Features**:
  - Name input
  - Email input
  - Password input with visibility toggle
  - Confirm password with visibility toggle
  - Login navigation
- **Integration**: ✅ Supabase Auth

---

## Main App Screens

### Bottom Tab Navigator (5 Tabs)

#### 1. HomeScreen
- **Tab Name**: `Home`
- **Icon**: Home icon
- **Label**: "Home"
- **Purpose**: Main dashboard with stats and quick actions

#### 2. MyPostsScreen
- **Tab Name**: `MyPosts`
- **Icon**: Posts icon
- **Label**: "My Posts"
- **Purpose**: User's own lost/found posts

#### 3. ChatListScreen
- **Tab Name**: `Chat`
- **Icon**: Chat icon
- **Label**: "My Chats"
- **Purpose**: List of all conversations
- **Badge**: Shows unread message count

#### 4. NotificationsScreen
- **Tab Name**: `Notifications`
- **Icon**: Notifications icon
- **Label**: "Activity"
- **Purpose**: User notifications
- **Badge**: Shows unread notifications count

#### 5. ProfileScreen
- **Tab Name**: `Profile`
- **Icon**: Person icon
- **Label**: "Profile"
- **Purpose**: User profile and settings access

---

## Stack Screens (Modal/Overlay)

### 1. DetailsScreen
- **Route**: `Details`
- **Purpose**: View post details
- **Navigation**: From HomeScreen, LostPostsScreen, FoundPostsScreen

### 2. CreatePostScreen
- **Route**: `CreatePost`
- **Purpose**: Create new lost/found post
- **Navigation**: From HomeScreen (+ floating button)
- **Features**:
  - Post type (Lost/Found)
  - Title, description
  - Category selection
  - Location
  - Tip amount (for Lost posts)
  - Image/video upload

### 3. EditPostScreen
- **Route**: `EditPost`
- **Purpose**: Edit existing post
- **Navigation**: From MyPostsScreen
- **Params**: `{ post: PostObject }`

### 4. LostPostsScreen
- **Route**: `LostPosts`
- **Purpose**: Browse all lost items
- **Navigation**: From HomeScreen (Lost card)

### 5. FoundPostsScreen
- **Route**: `FoundPosts`
- **Purpose**: Browse all found items
- **Navigation**: From HomeScreen (Found card)

### 6. SettingsScreen
- **Route**: `Settings`
- **Purpose**: App settings
- **Navigation**: From ProfileScreen (⚙️ icon)

### 7. EditProfileScreen
- **Route**: `EditProfile`
- **Purpose**: Edit user profile
- **Navigation**: From ProfileScreen
- **Features**:
  - Update name, phone
  - Avatar upload
  - Change password

### 8. ContactScreen
- **Route**: `Contact`
- **Purpose**: Contact post owner
- **Navigation**: From DetailsScreen
- **Features**:
  - Phone call
  - WhatsApp message
  - Start conversation

### 9. AdminPanelScreen
- **Route**: `AdminPanel`
- **Purpose**: Admin dashboard (admin only)
- **Navigation**: From ProfileScreen (admin users)
- **Features**:
  - Manage posts
  - View statistics
  - User management

### 10. ReportPostScreen
- **Route**: `ReportPost`
- **Purpose**: Report inappropriate post
- **Navigation**: From DetailsScreen
- **Params**: `{ postId: string }`

### 11. ChatScreen
- **Route**: `Chat`
- **Purpose**: Individual conversation view
- **Navigation**: From ChatListScreen
- **Params**: `{ conversation: ConversationObject }`
- **Features**:
  - Message history
  - Send messages
  - Real-time updates

---

## Screen Registration Summary

### AuthNavigator (4 screens)
- ✅ SliderScreen
- ✅ OnboardingScreen
- ✅ LoginScreen
- ✅ SignupScreen

### BottomTabNavigator (5 tabs)
- ✅ HomeScreen
- ✅ MyPostsScreen
- ✅ ChatListScreen
- ✅ NotificationsScreen
- ✅ ProfileScreen

### StackNavigator (11 screens)
- ✅ DetailsScreen
- ✅ CreatePostScreen
- ✅ EditPostScreen
- ✅ LostPostsScreen
- ✅ FoundPostsScreen
- ✅ SettingsScreen
- ✅ EditProfileScreen
- ✅ ContactScreen
- ✅ AdminPanelScreen
- ✅ ReportPostScreen
- ✅ ChatScreen

### Root Level
- ✅ SplashScreen (shown before navigation)

---

## Navigation Paths

### Authentication Flow
1. App starts → `SplashScreen`
2. Not authenticated → `AuthNavigator`
3. First time? → `SliderScreen` → `OnboardingScreen`
4. Returning user → `OnboardingScreen`
5. User chooses → `LoginScreen` or `SignupScreen`
6. After login/signup → `MainTabs` (BottomTabNavigator)

### Post Creation Flow
1. `HomeScreen` → Tap + button
2. Navigate to → `CreatePostScreen`
3. Fill form → Submit
4. Navigate back → `HomeScreen`

### Post Viewing Flow
1. `HomeScreen` / `LostPostsScreen` / `FoundPostsScreen`
2. Tap post card → `DetailsScreen`
3. Options:
   - Tap Contact → `ContactScreen`
   - Tap Report → `ReportPostScreen`
   - Tap Chat → `ChatScreen`

### Profile Flow
1. `ProfileScreen` (from bottom tab)
2. Tap Edit Profile → `EditProfileScreen`
3. Tap Settings → `SettingsScreen`
4. Admin? Tap Admin Panel → `AdminPanelScreen`

### Chat Flow
1. `ChatListScreen` (from bottom tab)
2. Tap conversation → `ChatScreen`
3. Messages load and display

---

## Integration Status

### ✅ Fully Integrated
- LoginScreen - Supabase Auth
- SignupScreen - Supabase Auth
- PasswordInput - Reusable component with visibility toggle

### ⏳ Pending Integration
- All other screens still use mock data
- Need to integrate with Supabase services

---

## Notes

1. **Initial Route**: AuthNavigator starts with `SliderScreen`
2. **Conditional Navigation**: App.js switches between AuthNavigator and AppNavigator based on `isAuthenticated`
3. **Navigation Params**: Some screens require params (e.g., ChatScreen needs conversation object)
4. **Header**: Most screens have `headerShown: false` and use custom headers
5. **Presentation**: Stack screens use `presentation: 'card'` for standard navigation

---

**Last Updated**: After Supabase Auth integration

