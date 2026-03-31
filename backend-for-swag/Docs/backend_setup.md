# SWAG Backend — Setup & Run Guide

## Stack
- **.NET 8** Web API (ASP.NET Core)
- **PostgreSQL** on Supabase (via Npgsql)
- **JWT** authentication
- **BCrypt** password hashing
- **SendGrid** for OTP emails

---

## 1. Configure the Database Connection

Edit `BackEnd/backendSWAG/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=db.xtkrldvhpsouvpjogolu.supabase.co;Database=postgres;Username=postgres;Password=YOUR_ACTUAL_DB_PASSWORD;Port=5432;SSL Mode=Require;Trust Server Certificate=true"
}
```

Get your database password from:
Supabase Dashboard → Project Settings → Database → Connection string → Password

---

## 2. Run the SQL Migration (one-time)

In Supabase Dashboard → SQL Editor → paste contents of `Docs/supabase_migration.md` and run it.

---

## 3. Configure JWT & SendGrid

In `appsettings.json`:

```json
"JwtSettings": {
  "SecretKey": "your-min-32-char-secret-key-here",
  "Issuer": "SwagBackend",
  "Audience": "SwagMobileApp",
  "ExpiryHours": 72
},
"SendGrid": {
  "ApiKey": "SG.your_sendgrid_api_key",
  "FromEmail": "noreply@yourdomain.com",
  "FromName": "SWAG App"
}
```

> If SendGrid is not configured, OTP codes are logged to console (development mode).

---

## 4. Create Admin Account

Run this SQL in Supabase to create the first admin:

```sql
INSERT INTO admins (email, password_hash)
VALUES ('admin@swag.com', '$2a$11$HASH_FROM_BCRYPT');
```

Or use the `BCrypt.Net.BCrypt.HashPassword("your_password")` to generate the hash.

---

## 5. Run the Backend

```bash
cd BackEnd/backendSWAG
dotnet run
```

Server starts at: `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

---

## API Endpoints Summary

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register Customer or Vendor |
| POST | `/auth/login` | Login (Customer/Vendor/Admin) |
| POST | `/auth/send-otp` | Send OTP to email/phone |
| POST | `/auth/verify-otp` | Verify OTP code |
| POST | `/auth/forgot-password` | Send password reset OTP |
| POST | `/auth/reset-password` | Reset password with OTP |

### Customers (`/api/customers`) — requires Customer JWT
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/me` | Get my profile |
| PUT | `/customers/me` | Update my profile |
| GET | `/customers/me/interests` | Get my interests |
| POST | `/customers/me/interests` | Set my interests |
| GET | `/customers/me/following` | Get followed vendors |
| POST | `/customers/me/following/{vendorId}` | Follow vendor |
| DELETE | `/customers/me/following/{vendorId}` | Unfollow vendor |
| GET | `/customers/me/saved-posts` | Get saved posts |

### Vendors (`/api/vendors`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vendors` | List vendors (public, filterable) |
| GET | `/vendors/{id}` | Get vendor profile (public) |
| GET | `/vendors/me` | Get my vendor profile |
| PUT | `/vendors/me` | Update my vendor profile |
| PUT | `/vendors/me/profile-details` | Update shop details |
| GET/POST | `/vendors/me/categories` | Manage categories |
| DELETE | `/vendors/me/categories/{itemId}` | Remove category |
| GET/POST | `/vendors/me/following` | Vendor follow vendor |
| DELETE | `/vendors/me/following/{vendorId}` | Unfollow vendor |
| GET/POST | `/vendors/me/collections` | Manage collections |
| DELETE | `/vendors/me/collections/{id}` | Delete collection |
| POST/DELETE | `/vendors/me/collections/{id}/posts/{postId}` | Add/remove post from collection |
| GET | `/vendors/{id}/followers` | Get follower counts |
| GET | `/vendors/{id}/reviews` | Get reviews |

### Posts (`/api/posts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | Get posts (public, filterable by vendorId/type/category/city) |
| GET | `/posts/{id}` | Get single post |
| POST | `/posts` | Create post (Vendor) |
| PUT | `/posts/{id}` | Update post (Vendor) |
| DELETE | `/posts/{id}` | Delete post (Vendor) |
| POST | `/posts/{id}/like` | Toggle like |
| POST | `/posts/{id}/save` | Toggle save |
| GET | `/posts/{id}/comments` | Get comments |
| POST | `/posts/{id}/comments` | Add comment |
| DELETE | `/posts/{id}/comments/{commentId}` | Delete comment |
| POST | `/reviews` | Add/update review (Customer) |

### Cars (`/api/cars`) — requires Customer JWT
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cars` | Get my cars |
| POST | `/cars` | Add new car |
| GET | `/cars/{id}` | Get car |
| PUT | `/cars/{id}` | Update car |
| DELETE | `/cars/{id}` | Delete car |
| GET | `/cars/{id}/maintenance` | Get maintenance records |
| POST | `/cars/{id}/maintenance` | Add maintenance record |
| DELETE | `/cars/{carId}/maintenance/{recordId}` | Delete maintenance record |

### Chats (`/api/chats`) — requires JWT
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats` | Get my conversations |
| POST | `/chats` | Start/get conversation |
| GET | `/chats/{id}/messages` | Get messages (paginated) |
| POST | `/chats/{id}/messages` | Send message |
| PUT | `/chats/{id}/read` | Mark conversation as read |

### Notifications (`/api/notifications`) — requires JWT
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get my notifications |
| PUT | `/notifications/{id}/read` | Mark as read |
| PUT | `/notifications/read-all` | Mark all as read |

### Admin (`/api/admin`) — requires Admin JWT
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/vendors/pending` | List pending vendors |
| GET | `/admin/vendors` | List all vendors |
| GET | `/admin/vendors/{id}` | Get vendor details |
| PUT | `/admin/vendors/{id}/approve` | Approve vendor |
| PUT | `/admin/vendors/{id}/reject` | Reject vendor |
| GET | `/admin/stats` | App statistics |

### Categories (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all category sections + items |
| GET | `/event-types` | Get event types |

---

## Request/Response Shapes

### Register
```json
POST /api/auth/register
{
  "role": "Customer",           // or "Vendor"
  "fullName": "John Doe",
  "emailOrPhone": "john@example.com",
  "password": "password123",
  "city": "Amman",
  // Vendor-only:
  "shopName": "John's Auto",
  "shopType": "Car Parts",
  "locationUrl": "https://maps.google.com/...",
  "locationLat": 31.9539,
  "locationLng": 35.9106,
  "commercialRegNumber": "12345",
  "licenseFile": "supabase-url",
  "idFrontFile": "supabase-url",
  "idBackFile": "supabase-url"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "fullName": "John Doe",
    "role": "Customer",
    "status": "pending",       // vendors only
    "city": "Amman",
    "profileImage": null,
    "shopName": null           // vendors only
  }
}
```

### Login
```json
POST /api/auth/login
{
  "emailOrPhone": "john@example.com",
  "password": "password123",
  "role": "Customer"           // Customer | Vendor | Admin
}
// Response same as register
```
