# CHAPTER 6: Testing Plan

## 6.1 Overview

This chapter presents the testing plan for the SWAG automotive marketplace system. It describes the testing scope, testing approach, and planned testing activities to ensure that the system meets its functional requirements. The chapter covers integration testing, acceptance testing, black-box testing, white-box testing, and testing automation strategies applied during the implementation phase.

## 6.2 Test Scope

The scope of testing includes all core functionalities of the mobile application that are critical to user interaction and business operations. This includes:

- User authentication and OTP verification
- Vendor and customer profile management
- Post and event creation, interaction (like, save, comment)
- Viewing nearby shops based on city matching
- Following/unfollowing vendors
- Submitting and viewing reviews
- Managing customer vehicles and maintenance records
- Real-time notifications via SignalR WebSocket
- Push notifications via Expo Push Notifications
- Chat messaging between users
- Admin vendor approval workflow
- File upload to Supabase storage
- Global search functionality

Features related to third-party service reliability (such as Supabase uptime, Expo push delivery guarantees, and SendGrid email delivery) are considered out of scope for this testing phase.

## 6.3 Test Objectives

- Verify that core system functionalities work as specified in the requirements.
- Ensure correct system behavior for valid and invalid user inputs.
- Validate accurate data storage, retrieval, and relationships in the PostgreSQL database.
- Verify that different system modules integrate correctly (API to database, API to SignalR, API to Expo Push).
- Detect functional defects early through automated and manual testing.
- Confirm correct operation for all three user roles: Customer, Vendor, and Admin.
- Validate end-to-end user flows from the mobile application through the backend to the database.

## 6.4 Test Schedule

Testing activities are conducted in parallel with the implementation phase. Integration testing is performed as backend API endpoints are completed, using xUnit with WebApplicationFactory to test endpoints against a test database. Acceptance testing is conducted once major features are implemented, verifying complete user flows through the mobile application. Automated tests run on each build to support regression testing.

---

## 6.5 Integration Testing

Integration testing verifies that different modules and services of the system work together correctly. The following areas require integration testing:

### 6.5.1 API-to-Database Integration

These tests verify that API endpoints correctly read from and write to the PostgreSQL database.

#### Authentication Module

| ID | Description | Priority |
|----|-------------|----------|
| IT-01 | Register a new customer — verify record is created in customers table | Critical |
| IT-02 | Register a new vendor — verify records in vendors and vendor_documents | Critical |
| IT-03 | Login with valid credentials — returns JWT with correct claims | Critical |
| IT-04 | Login with invalid credentials — returns 401 Unauthorized | Critical |
| IT-05 | Login with unverified account — returns appropriate error | High |
| IT-06 | OTP generation — stores record in otp_verifications with correct expiry | High |
| IT-07 | OTP verification — marks record as used and verifies user | High |
| IT-08 | Password reset — updates password_hash in the database | High |

#### Posts Module

| ID | Description | Priority |
|----|-------------|----------|
| IT-09 | Create a post as vendor — stored with correct categories | Critical |
| IT-10 | Create an event post — stores title, date, time, location | High |
| IT-11 | Like a post — post_likes record is created | High |
| IT-12 | Save a post — post_saves record is created | Medium |
| IT-13 | Add a comment — stored with correct commenter info | High |
| IT-14 | Delete a post — cascading deletion of likes, saves, comments | High |
| IT-15 | Get posts with filters (vendorId, type, categoryId, city) | High |

#### Customer Module

| ID | Description | Priority |
|----|-------------|----------|
| IT-16 | Update customer profile — changes are persisted | High |
| IT-17 | Follow a vendor — customer_follows record is created | Critical |
| IT-18 | Unfollow a vendor — record is removed | High |
| IT-19 | Set customer interests — old interests are replaced | Medium |

#### Vendor Module

| ID | Description | Priority |
|----|-------------|----------|
| IT-20 | Update vendor profile (bio, hours, address) | High |
| IT-21 | Get vendor list with filters (city, search, categoryId) | High |

#### Cars Module

| ID | Description | Priority |
|----|-------------|----------|
| IT-22 | Add a car — linked to the customer | High |
| IT-23 | Add a maintenance record to a car | Medium |
| IT-24 | Delete a car — maintenance records are removed | Medium |

#### Chat Module

| ID | Description | Priority |
|----|-------------|----------|
| IT-25 | Start a conversation between customer and vendor | High |
| IT-26 | Send a message — stored in chat_messages | High |
| IT-27 | Mark conversation as read — unread count updated | Medium |

#### Admin Module

| ID | Description | Priority |
|----|-------------|----------|
| IT-28 | Approve a vendor — status changes to Active | Critical |
| IT-29 | Reject a vendor with reason — status changes to Rejected | Critical |

#### Notifications Module

| ID | Description | Priority |
|----|-------------|----------|
| IT-31 | Notification created in DB when vendor is followed | Critical |
| IT-32 | Mark notification as read — isRead flag updates | Medium |
| IT-33 | Clear all notifications — removes all records for user | Medium |

#### Other

| ID | Description | Priority |
|----|-------------|----------|
| IT-34 | Global search returns matching vendors and posts | High |
| IT-35 | Upload image — URL returned from Supabase storage | High |

### 6.5.2 API-to-SignalR Integration

| ID | Description | Priority |
|----|-------------|----------|
| IT-36 | Following a vendor sends real-time SignalR notification to the vendor | Critical |
| IT-37 | Creating a post sends SignalR notifications to all followers | Critical |
| IT-38 | Adding a review sends SignalR notification to the vendor | High |
| IT-39 | Adding a comment sends SignalR notification to post owner | High |
| IT-40 | Admin approve/reject sends SignalR notification to vendor | High |

### 6.5.3 API-to-Expo Push Integration

| ID | Description | Priority |
|----|-------------|----------|
| IT-41 | Register push token — stored in device_push_tokens | Critical |
| IT-42 | Unregister push token — removed from table | High |
| IT-43 | Following a vendor triggers Expo push to vendor's tokens | Critical |
| IT-44 | Creating a post triggers Expo push to followers' tokens | High |

### 6.5.4 Authentication and Authorization Integration

| ID | Description | Priority |
|----|-------------|----------|
| IT-45 | Customer cannot access vendor-only endpoints | Critical |
| IT-46 | Vendor cannot access customer-only endpoints | Critical |
| IT-47 | Non-admin users cannot access admin endpoints | Critical |
| IT-48 | Expired JWT returns 401 on protected endpoints | Critical |
| IT-49 | Request without token returns 401 on protected endpoints | Critical |
| IT-50 | SignalR hub rejects connection without valid JWT | High |

---

## 6.6 Acceptance Testing

Acceptance testing validates that the system meets business requirements from an end-user perspective. Each test case represents a complete user flow.

### 6.6.1 Customer Acceptance Tests

**AT-01 — Customer Registration** `Critical`
- **Steps:** Open app → Tap Sign Up → Enter name, email, password, city → Receive OTP via email → Enter OTP code
- **Expected:** Account is created, user is redirected to home screen with personalized content

**AT-02 — Customer Login** `Critical`
- **Steps:** Open app → Enter email and password → Tap Login
- **Expected:** User is authenticated and sees the home screen with feed, nearby shops, and events

**AT-03 — Forgot Password** `High`
- **Steps:** Tap Forgot Password → Enter email → Receive OTP → Enter OTP and new password
- **Expected:** Password is updated, user can login with new password

**AT-04 — Browse Explore Feed** `High`
- **Steps:** Login as customer → Navigate to Explore tab → Scroll through posts → Filter by category
- **Expected:** Posts displayed with vendor info, images, and interaction buttons; filtering works correctly

**AT-05 — Like and Save Post** `High`
- **Steps:** View a post in feed → Tap like button → Tap save button → Check saved posts
- **Expected:** Like count increments, post appears in saved posts list

**AT-06 — Comment on Post** `High`
- **Steps:** Open a post → Tap comment icon → Type comment and submit
- **Expected:** Comment appears in comment list with user name and timestamp

**AT-07 — View Vendor Profile** `High`
- **Steps:** Tap on a vendor card → View profile page
- **Expected:** Profile displays shop name, bio, categories, posts, reviews, rating, contact info, and follow button

**AT-08 — Follow Vendor** `Critical`
- **Steps:** View vendor profile → Tap Follow button
- **Expected:** Button changes to Following, vendor receives notification, vendor appears in Following list

**AT-09 — View Nearby Shops** `High`
- **Steps:** Navigate to Nearby tab
- **Expected:** Vendors from the same city are displayed with shop details

**AT-10 — Add Vehicle** `High`
- **Steps:** Go to Profile → Tap Add Car → Enter car details (brand, model, year, plate) → Save
- **Expected:** Car appears in the user's car list on their profile

**AT-11 — Add Maintenance Record** `Medium`
- **Steps:** Open a car → Tap Add Maintenance → Enter details → Save
- **Expected:** Maintenance record appears in the car's history

**AT-12 — Submit Review** `High`
- **Steps:** Open vendor profile → Tap Add Review → Enter rating and text → Submit
- **Expected:** Review appears on vendor profile, vendor receives notification

**AT-13 — Chat with Vendor** `High`
- **Steps:** Open vendor profile → Tap Chat → Send a message
- **Expected:** Message appears in conversation, vendor can see it in their chat list

**AT-14 — View Notifications** `High`
- **Steps:** Receive notification → Open Notifications tab → Tap notification
- **Expected:** Notification list shows correct details, tapping navigates to relevant screen

**AT-15 — Receive Toast Notification** `High`
- **Steps:** Be logged in with app open → Another user triggers a notification
- **Expected:** Toast banner slides in from top with title and message, auto-dismisses after 4 seconds

**AT-16 — Receive Push Notification** `High`
- **Steps:** Close the app → Another user triggers a notification
- **Expected:** Push notification appears on device, tapping opens app to relevant screen

**AT-17 — Search** `Medium`
- **Steps:** Tap search bar → Type vendor name or category → View results
- **Expected:** Matching vendors and posts are displayed

**AT-18 — Update Profile** `Medium`
- **Steps:** Go to Profile → Edit name, city, or profile image → Save
- **Expected:** Changes are reflected on the profile immediately

### 6.6.2 Vendor Acceptance Tests

**AT-19 — Vendor Registration** `Critical`
- **Steps:** Open app → Select Vendor signup → Enter shop details, location, documents → Verify email with OTP
- **Expected:** Account created with Pending status, vendor sees pending approval screen

**AT-20 — Create Post** `Critical`
- **Steps:** Login as vendor → Tap Create Post → Add image, description, categories → Submit
- **Expected:** Post appears on vendor profile and in followers' feeds; followers receive notifications

**AT-21 — Create Event** `High`
- **Steps:** Tap Create Post → Select Event type → Add title, date, time, location → Submit
- **Expected:** Event appears in Events tab and on vendor profile; followers are notified

**AT-22 — Manage Profile** `High`
- **Steps:** Go to Profile → Edit bio, hours, address, WhatsApp, Instagram → Save
- **Expected:** Changes visible on public profile to customers

**AT-23 — View Followers** `Medium`
- **Steps:** Navigate to followers section
- **Expected:** List of followers displayed with names and profile images

**AT-24 — Follow Other Vendor** `High`
- **Steps:** Browse vendors → Tap Follow on another vendor
- **Expected:** Follow relationship created, other vendor receives notification

**AT-25 — Chat with Customer** `High`
- **Steps:** Open Chats tab → Open a conversation → Reply to message
- **Expected:** Message is delivered and visible to the customer

**AT-26 — View Reviews** `Medium`
- **Steps:** Go to Reviews section on profile
- **Expected:** All customer reviews displayed with ratings, text, and customer info

### 6.6.3 Admin Acceptance Tests

**AT-27 — View Pending Vendors** `Critical`
- **Steps:** Login as admin → View pending vendors list
- **Expected:** All vendors with Pending status listed with details and documents

**AT-28 — Approve Vendor** `Critical`
- **Steps:** Select a pending vendor → Review documents → Tap Approve
- **Expected:** Status changes to Active, vendor receives notification, vendor can login

**AT-29 — Reject Vendor** `Critical`
- **Steps:** Select a pending vendor → Tap Reject → Enter reason
- **Expected:** Status changes to Rejected, vendor receives notification with reason

---

## 6.7 Black-Box Testing

Black-box testing verifies functional behavior without considering internal implementation. Test cases are derived from functional requirements and validate system outputs based on user inputs.

### Login Tests

| ID | Input | Expected Output | Priority |
|----|-------|-----------------|----------|
| BB-01 | Valid email + valid password (Customer) | 200 OK with JWT token and user data | Critical |
| BB-02 | Valid email + wrong password | 401 Unauthorized | Critical |
| BB-03 | Non-existent email | 401 Unauthorized | Critical |
| BB-04 | Empty email and password | 400 Bad Request | High |

### Registration Tests

| ID | Input | Expected Output | Priority |
|----|-------|-----------------|----------|
| BB-05 | Valid name, email, password, city | 200 OK with token and user | Critical |
| BB-06 | Already registered email | 409 Conflict or error message | Critical |
| BB-07 | Missing required field (password) | 400 Bad Request | High |

### Post Tests

| ID | Input | Expected Output | Priority |
|----|-------|-----------------|----------|
| BB-08 | Image URL + description + categories (vendor token) | 201 Created with post ID | Critical |
| BB-09 | Post data with customer token | 403 Forbidden | Critical |
| BB-10 | Post with empty description | Post created (description is optional) | Medium |

### Follow Tests

| ID | Input | Expected Output | Priority |
|----|-------|-----------------|----------|
| BB-11 | Valid vendor ID | 200 OK "Followed successfully" | Critical |
| BB-12 | Already followed vendor ID | 200 OK "Already following" | High |
| BB-13 | Non-existent GUID | 404 Not Found | High |

### Other Feature Tests

| ID | Feature | Input | Expected Output | Priority |
|----|---------|-------|-----------------|----------|
| BB-14 | Review | VendorId + rating (1-5) + text | Review created, vendor notified | High |
| BB-15 | Review | Duplicate review (same vendor + customer) | Error (unique constraint) | High |
| BB-16 | Car | Brand + model + year + plate | Car saved and linked to customer | High |
| BB-17 | Car | Missing brand field | 400 Bad Request | Medium |
| BB-18 | Chat | Message text + conversation ID | Message stored, unread count updated | High |
| BB-19 | Notifications | page=1, pageSize=10 | Up to 10 notifications with unread count | High |
| BB-20 | Admin | Approve vendor with customer token | 403 Forbidden | Critical |
| BB-21 | Upload | JPEG file under 5MB | 200 OK with Supabase URL | High |
| BB-22 | Upload | File over 50MB | 400 Bad Request | Medium |
| BB-23 | Search | Query "auto" | Vendors with "auto" in name | High |
| BB-24 | Search | Empty string | Empty results or all | Medium |

---

## 6.8 White-Box Testing

White-box testing verifies the internal logic and control flow of the system.

### 6.8.1 Statement Coverage

Ensures every line of code in critical methods is executed at least once. Applied to:

- **AuthController.Login()** — all branches for Customer, Vendor, Admin roles
- **NotificationService.SendAsync()** — paths with and without push tokens
- **PostsController.CreatePost()** — post vs event type, with and without categories

### 6.8.2 Branch Coverage

Ensures all conditional branches are tested. Key branches include:

- **Login:** email vs phone detection, role matching, password verification, account verification status
- **CreatePost:** PostType.Post vs PostType.Event, with/without media, with/without categories
- **Follow:** already following vs new follow
- **Upload:** image vs video, file size validation, file type validation

### 6.8.3 Unit Tests

Unit tests isolate individual methods and test them with mocked dependencies:

| ID | Method Under Test | What It Verifies |
|----|-------------------|------------------|
| WT-01 | TokenService.GenerateToken() | JWT contains correct claims (sub, role, email) |
| WT-02 | TokenService.GenerateToken() | Token expiry is 72 hours |
| WT-03 | CurrentUserService.UserId | Correct extraction from JWT claims |
| WT-04 | CurrentUserService.Role | Role extraction from JWT claims |
| WT-05 | ExpoPushService.SendPushAsync() | Only valid ExponentPushToken tokens are sent |
| WT-06 | ExpoPushService.SendPushAsync() | Empty token list does not call Expo API |
| WT-07 | getToastType() | Notification type mapping ("newfollower" → "follow") |
| WT-08 | getToastType() | Unknown type defaults to "info" |

---

## 6.9 Testing Automation

### 6.9.1 Automation Tools

| Tool | Purpose | Layer |
|------|---------|-------|
| xUnit | Integration and unit testing framework | Backend |
| Moq | Mocking dependencies for unit tests | Backend |
| EF Core InMemory | In-memory database for isolated testing | Backend |

### 6.9.2 Test Cases Selected for Automation

**Automated (35 tests implemented):**
- User authentication: register customer/vendor, login valid/invalid, unverified account (IT-01 to IT-05)
- JWT token generation: correct claims, expiry validation (WT-01, WT-02)
- Expo push service: valid token filtering, empty token handling (WT-05, WT-06)
- Post operations: create post, create event, like, save, comment, delete cascade (IT-09 to IT-14)
- Follow/unfollow with notification creation (IT-17, IT-18, IT-31 to IT-33)
- Push token register/unregister (IT-41, IT-42)
- Car management: add car, maintenance records, delete cascade (IT-22 to IT-24)
- Chat: start conversation, send message, mark as read (IT-25 to IT-27)
- Admin: approve vendor, reject vendor (IT-28, IT-29)

**Not automated (manual testing):**
- UI acceptance flows
- Search functionality
- File upload validation
- Role-based authorization checks
- SignalR real-time notification delivery

### 6.9.3 Automation Criteria

Test cases are selected for automation based on:

- **High-frequency usage:** Authentication, post viewing, notifications
- **Core business logic:** Post creation, follow system, reviews, chat
- **Regression-prone components:** Endpoints with multiple conditional branches
- **Predictable outcomes:** CRUD operations with deterministic results
- **Role-based access:** Authorization checks that must never regress

### 6.9.4 Test Execution

Automated tests are executed:

- Locally before committing changes using `dotnet test`
- Manually via Postman for exploratory and acceptance testing
- Backend integration tests use an in-memory database to avoid affecting production data
