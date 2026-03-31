-- ================================================================
--  SUPABASE SQL MIGRATION
--  Project  : Automotive App
--  Stack    : React Native + .NET Backend + Supabase (PostgreSQL)
--  Auth     : Custom (.NET + SendGrid OTP) — NOT Supabase Auth
--  Run in   : Supabase Dashboard → SQL Editor → New Query
--  Strategy : Wrapped in a transaction — fully succeeds or fully
--              rolls back on any error.
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1 — ENUMS
-- ================================================================

CREATE TYPE user_role AS ENUM (
    'customer',
    'vendor',
    'admin'
);

CREATE TYPE vendor_status AS ENUM (
    'pending',
    'active',
    'rejected'
);

CREATE TYPE otp_purpose AS ENUM (
    'signup',
    'forgot_password',
    'change_contact'
);

CREATE TYPE message_type AS ENUM (
    'text',
    'image',
    'video'
);

CREATE TYPE notification_type AS ENUM (
    'maintenance_alert',
    'vendor_post',
    'insurance_expiry',
    'new_event',
    'mention',
    'nearby_suggestion',
    'system_alert',
    'account_status',
    'new_review',
    'new_follower',
    'event_update',
    'inventory_tip'
);

CREATE TYPE post_type AS ENUM (
    'post',
    'event'
);

CREATE TYPE media_type AS ENUM (
    'image',
    'video'
);


-- ================================================================
-- STEP 2 — CORE TABLES
-- Order matters: referenced tables must exist before referencing ones.
-- ================================================================

-- ── 1. ADMINS ────────────────────────────────────────────────────
CREATE TABLE admins (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── 2. CUSTOMERS ─────────────────────────────────────────────────
CREATE TABLE customers (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name          VARCHAR(150) NOT NULL,
    email              VARCHAR(255) UNIQUE,
    phone              VARCHAR(30)  UNIQUE,
    password_hash      TEXT         NOT NULL,
    city               VARCHAR(100),
    profile_image      TEXT,
    banner_image       TEXT,
    language           VARCHAR(10)  NOT NULL DEFAULT 'en',
    dark_mode          BOOLEAN      NOT NULL DEFAULT FALSE,
    push_notifications BOOLEAN      NOT NULL DEFAULT TRUE,
    is_verified        BOOLEAN      NOT NULL DEFAULT FALSE,
    is_deleted         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_customer_contact
        CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- ── 3. VENDORS ───────────────────────────────────────────────────
CREATE TABLE vendors (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name             VARCHAR(150)  NOT NULL,
    shop_name             VARCHAR(200)  NOT NULL,
    shop_type             VARCHAR(150)  NOT NULL,
    email                 VARCHAR(255)  UNIQUE,
    phone                 VARCHAR(30)   UNIQUE,
    password_hash         TEXT          NOT NULL,
    city                  VARCHAR(100),
    location_url          TEXT,
    location_lat          NUMERIC(10,7),
    location_lng          NUMERIC(10,7),
    commercial_reg_number VARCHAR(100),
    bio                   TEXT,
    profile_image         TEXT,
    banner_image          TEXT,
    status                vendor_status NOT NULL DEFAULT 'pending',
    language              VARCHAR(10)   NOT NULL DEFAULT 'en',
    dark_mode             BOOLEAN       NOT NULL DEFAULT FALSE,
    push_notifications    BOOLEAN       NOT NULL DEFAULT TRUE,
    is_verified           BOOLEAN       NOT NULL DEFAULT FALSE,
    is_deleted            BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT chk_vendor_contact
        CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- ── 4. VENDOR DOCUMENTS ──────────────────────────────────────────
CREATE TABLE vendor_documents (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id      UUID        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    license_file   TEXT,
    id_front_file  TEXT,
    id_back_file   TEXT,
    uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. VENDOR CATEGORY SECTIONS (lookup) ─────────────────────────
CREATE TABLE vendor_category_sections (
    id    SERIAL       PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);

-- ── 6. VENDOR CATEGORY ITEMS (lookup) ────────────────────────────
CREATE TABLE vendor_category_items (
    id          SERIAL       PRIMARY KEY,
    section_id  INT          NOT NULL REFERENCES vendor_category_sections(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    UNIQUE (section_id, name)
);

-- ── 7. VENDOR SELECTED CATEGORIES (junction) ─────────────────────
CREATE TABLE vendor_selected_categories (
    vendor_id  UUID  NOT NULL REFERENCES vendors(id)               ON DELETE CASCADE,
    item_id    INT   NOT NULL REFERENCES vendor_category_items(id)  ON DELETE CASCADE,
    PRIMARY KEY (vendor_id, item_id)
);

-- ── 8. OTP VERIFICATIONS ─────────────────────────────────────────
CREATE TABLE otp_verifications (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient   VARCHAR(255) NOT NULL,
    code        VARCHAR(10)  NOT NULL,
    purpose     otp_purpose  NOT NULL,
    is_used     BOOLEAN      NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── 9. CUSTOMER INTERESTS (junction) ─────────────────────────────
CREATE TABLE customer_interests (
    customer_id  UUID  NOT NULL REFERENCES customers(id)              ON DELETE CASCADE,
    item_id      INT   NOT NULL REFERENCES vendor_category_items(id)  ON DELETE CASCADE,
    PRIMARY KEY (customer_id, item_id)
);

-- ── 10. CUSTOMER CARS ─────────────────────────────────────────────
CREATE TABLE customer_cars (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id       UUID         NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    brand             VARCHAR(100),
    model             VARCHAR(150) NOT NULL,
    year              VARCHAR(10),
    plate_number      VARCHAR(50),
    engine_type       VARCHAR(100),
    fuel_type         VARCHAR(50),
    color             VARCHAR(50),
    current_mileage   VARCHAR(50),
    last_maintenance  VARCHAR(50),
    next_maintenance  DATE,
    insurance_expiry  VARCHAR(50),
    registration_date VARCHAR(50),
    car_image         TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── 11. CAR MAINTENANCE RECORDS ───────────────────────────────────
CREATE TABLE car_maintenance_records (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id      UUID         NOT NULL REFERENCES customer_cars(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    record_date VARCHAR(50),
    status      VARCHAR(50)  NOT NULL DEFAULT 'Completed',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── 12. VENDOR PROFILE DETAILS ────────────────────────────────────
CREATE TABLE vendor_profile_details (
    vendor_id      UUID        PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    address        TEXT,
    whatsapp       VARCHAR(30),
    instagram_url  TEXT,
    open_time      TIME,
    close_time     TIME,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 13. VENDOR POSTS ──────────────────────────────────────────────
CREATE TABLE vendor_posts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    description     TEXT,
    post_image      TEXT,
    media_type      media_type  NOT NULL DEFAULT 'image',
    media_width     INT,
    media_height    INT,
    type            post_type   NOT NULL DEFAULT 'post',
    event_title     VARCHAR(200),
    event_date      VARCHAR(50),
    event_time      VARCHAR(50),
    event_end_time  VARCHAR(50),
    location        VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 14. POST CATEGORIES (junction) ───────────────────────────────
CREATE TABLE post_categories (
    post_id  UUID  NOT NULL REFERENCES vendor_posts(id)           ON DELETE CASCADE,
    item_id  INT   NOT NULL REFERENCES vendor_category_items(id)  ON DELETE CASCADE,
    PRIMARY KEY (post_id, item_id)
);

-- ── 15. POST LIKES ────────────────────────────────────────────────
CREATE TABLE post_likes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID        NOT NULL REFERENCES vendor_posts(id) ON DELETE CASCADE,
    liker_id    UUID        NOT NULL,
    liker_type  user_role   NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (post_id, liker_id, liker_type)
);

-- ── 16. POST SAVES ────────────────────────────────────────────────
CREATE TABLE post_saves (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID        NOT NULL REFERENCES vendor_posts(id) ON DELETE CASCADE,
    saver_id    UUID        NOT NULL,
    saver_type  user_role   NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (post_id, saver_id, saver_type)
);

-- ── 17. POST COMMENTS ─────────────────────────────────────────────
CREATE TABLE post_comments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID        NOT NULL REFERENCES vendor_posts(id) ON DELETE CASCADE,
    commenter_id    UUID        NOT NULL,
    commenter_type  user_role   NOT NULL,
    comment_text    TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

-- ── 18. REVIEWS ───────────────────────────────────────────────────
CREATE TABLE reviews (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id   UUID        NOT NULL REFERENCES vendors(id)   ON DELETE CASCADE,
    customer_id UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback    TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (vendor_id, customer_id)
);

-- ── 19. CUSTOMER FOLLOWS (junction) ──────────────────────────────
CREATE TABLE customer_follows (
    customer_id  UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vendor_id    UUID        NOT NULL REFERENCES vendors(id)   ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (customer_id, vendor_id)
);

-- ── 20. VENDOR FOLLOWS (junction) ────────────────────────────────
CREATE TABLE vendor_follows (
    follower_id   UUID        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    following_id  UUID        NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id)
);

-- ── 21. VENDOR COLLECTIONS ────────────────────────────────────────
CREATE TABLE vendor_collections (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id    UUID         NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    description  TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── 22. VENDOR COLLECTION POSTS (junction) ───────────────────────
CREATE TABLE vendor_collection_posts (
    collection_id  UUID  NOT NULL REFERENCES vendor_collections(id) ON DELETE CASCADE,
    post_id        UUID  NOT NULL REFERENCES vendor_posts(id)        ON DELETE CASCADE,
    PRIMARY KEY (collection_id, post_id)
);

-- ── 23. EVENT TYPES (lookup) ─────────────────────────────────────
CREATE TABLE event_types (
    id    SERIAL       PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);

-- ── 24. POST EVENT TYPES (junction) ──────────────────────────────
CREATE TABLE post_event_types (
    post_id        UUID  NOT NULL REFERENCES vendor_posts(id) ON DELETE CASCADE,
    event_type_id  INT   NOT NULL REFERENCES event_types(id)  ON DELETE CASCADE,
    PRIMARY KEY (post_id, event_type_id)
);

-- ── 25. CONVERSATIONS ─────────────────────────────────────────────
CREATE TABLE conversations (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_one_id   UUID        NOT NULL,
    participant_one_type user_role   NOT NULL,
    participant_two_id   UUID        NOT NULL,
    participant_two_type user_role   NOT NULL,
    last_message         TEXT,
    last_message_time    TIMESTAMPTZ,
    p1_unread            INT         NOT NULL DEFAULT 0,
    p2_unread            INT         NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (participant_one_id, participant_one_type, participant_two_id, participant_two_type),
    CONSTRAINT chk_no_self_conversation
        CHECK (
            participant_one_id  <> participant_two_id
            OR participant_one_type <> participant_two_type
        )
);

-- ── 26. CHAT MESSAGES ─────────────────────────────────────────────
CREATE TABLE chat_messages (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id  UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id        UUID         NOT NULL,
    sender_type      user_role    NOT NULL,
    message_text     TEXT,
    message_type     message_type NOT NULL DEFAULT 'text',
    media_url        TEXT,
    is_read          BOOLEAN      NOT NULL DEFAULT FALSE,
    sent_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── 27. NOTIFICATIONS ─────────────────────────────────────────────
CREATE TABLE notifications (
    id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    UUID              NOT NULL,
    recipient_type  user_role         NOT NULL,
    type            notification_type NOT NULL,
    title           VARCHAR(200)      NOT NULL,
    body            TEXT              NOT NULL,
    deep_link       TEXT,
    is_read         BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ       NOT NULL DEFAULT now()
);

-- ── 28. VENDOR APPROVAL LOG ───────────────────────────────────────
CREATE TABLE vendor_approval_log (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id    UUID          NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    admin_id     UUID          NOT NULL REFERENCES admins(id),
    action       vendor_status NOT NULL,
    actioned_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- ================================================================
-- STEP 3 — INDEXES
-- ================================================================

-- Auth: login lookup
CREATE INDEX idx_customers_email          ON customers(email);
CREATE INDEX idx_customers_phone          ON customers(phone);
CREATE INDEX idx_vendors_email            ON vendors(email);
CREATE INDEX idx_vendors_phone            ON vendors(phone);

-- Vendor filtering
CREATE INDEX idx_vendors_status           ON vendors(status);
CREATE INDEX idx_vendors_city             ON vendors(city);

-- OTP lookup and cleanup
CREATE INDEX idx_otp_recipient            ON otp_verifications(recipient);
CREATE INDEX idx_otp_expires              ON otp_verifications(expires_at);
CREATE INDEX idx_otp_purpose              ON otp_verifications(purpose);

-- Posts feed
CREATE INDEX idx_posts_vendor             ON vendor_posts(vendor_id);
CREATE INDEX idx_posts_type               ON vendor_posts(type);
CREATE INDEX idx_posts_created            ON vendor_posts(created_at DESC);

-- Social
CREATE INDEX idx_likes_post               ON post_likes(post_id);
CREATE INDEX idx_likes_liker              ON post_likes(liker_id, liker_type);
CREATE INDEX idx_saves_saver              ON post_saves(saver_id, saver_type);
CREATE INDEX idx_comments_post            ON post_comments(post_id);
CREATE INDEX idx_comments_active          ON post_comments(post_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_follows_customer         ON customer_follows(customer_id);
CREATE INDEX idx_follows_vendor           ON customer_follows(vendor_id);
CREATE INDEX idx_vendor_follows_follower  ON vendor_follows(follower_id);
CREATE INDEX idx_vendor_follows_following ON vendor_follows(following_id);

-- Reviews
CREATE INDEX idx_reviews_vendor           ON reviews(vendor_id);

-- Cars & maintenance
CREATE INDEX idx_cars_customer            ON customer_cars(customer_id);
CREATE INDEX idx_maintenance_car          ON car_maintenance_records(car_id);

-- Vendor collections
CREATE INDEX idx_collections_vendor       ON vendor_collections(vendor_id);

-- Conversations
CREATE INDEX idx_conv_p1                  ON conversations(participant_one_id, participant_one_type);
CREATE INDEX idx_conv_p2                  ON conversations(participant_two_id, participant_two_type);

-- Messages
CREATE INDEX idx_messages_conversation    ON chat_messages(conversation_id);
CREATE INDEX idx_messages_sent            ON chat_messages(sent_at DESC);
CREATE INDEX idx_messages_unread          ON chat_messages(conversation_id) WHERE is_read = FALSE;

-- Notifications
CREATE INDEX idx_notifications_recipient  ON notifications(recipient_id, recipient_type);
CREATE INDEX idx_notifications_unread     ON notifications(recipient_id) WHERE is_read = FALSE;

-- Approval log
CREATE INDEX idx_approval_vendor          ON vendor_approval_log(vendor_id);


-- ================================================================
-- STEP 4 — UPDATED_AT AUTO-TRIGGER
-- Automatically keeps updated_at in sync on every row update
-- for tables that have this column.
-- ================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_cars_updated_at
    BEFORE UPDATE ON customer_cars
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vendor_posts_updated_at
    BEFORE UPDATE ON vendor_posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vendor_profile_details_updated_at
    BEFORE UPDATE ON vendor_profile_details
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ================================================================
-- STEP 5 — CONVERSATION UNREAD AUTO-TRIGGER
-- Automatically increments the correct unread counter in
-- conversations whenever a new chat message is inserted.
-- .NET only needs to reset unread to 0 on read — the increment
-- is handled entirely at the database level.
-- ================================================================

CREATE OR REPLACE FUNCTION increment_conversation_unread()
RETURNS TRIGGER AS $$
BEGIN
    -- If sender is participant_one → increment p2_unread
    -- If sender is participant_two → increment p1_unread
    UPDATE conversations
    SET
        last_message      = CASE
                                WHEN NEW.message_type = 'text' THEN NEW.message_text
                                ELSE 'Media Attachment'
                            END,
        last_message_time = NEW.sent_at,
        p1_unread = CASE
                        WHEN NEW.sender_id   = participant_two_id
                         AND NEW.sender_type = participant_two_type
                        THEN p1_unread + 1
                        ELSE p1_unread
                    END,
        p2_unread = CASE
                        WHEN NEW.sender_id   = participant_one_id
                         AND NEW.sender_type = participant_one_type
                        THEN p2_unread + 1
                        ELSE p2_unread
                    END
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chat_message_inserted
    AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION increment_conversation_unread();


-- ================================================================
-- STEP 6 — SEED DATA
-- Fixed lookup values matching the frontend code exactly.
-- ================================================================

-- Category Sections
INSERT INTO vendor_category_sections (name) VALUES
    ('Car Parts'),
    ('Customization'),
    ('Auto Hub'),
    ('Pro Services');

-- Car Parts sub-items (section_id = 1)
INSERT INTO vendor_category_items (section_id, name) VALUES
    (1, 'Car-Parts'),
    (1, 'Exhaust Systems'),
    (1, 'Wheels & Tires'),
    (1, 'Glass Services');

-- Customization sub-items (section_id = 2)
INSERT INTO vendor_category_items (section_id, name) VALUES
    (2, 'Accessories & Add-ons'),
    (2, 'Tuning (Mechanical/Cosmetic)'),
    (2, 'Seat Upholstery'),
    (2, 'Paint & Bodywork');

-- Auto Hub sub-items (section_id = 3)
INSERT INTO vendor_category_items (section_id, name) VALUES
    (3, 'Car Rental'),
    (3, 'Agencies'),
    (3, 'Dealerships');

-- Pro Services sub-items (section_id = 4)
INSERT INTO vendor_category_items (section_id, name) VALUES
    (4, 'Maintenance (Mechanical/Electrical)'),
    (4, 'Car Washes'),
    (4, 'Gas Station (Fuel & Energy)');

-- Event Types
INSERT INTO event_types (name) VALUES
    ('Drift Event'),
    ('Car Meet'),
    ('Track Day'),
    ('Tuning Workshop'),
    ('Others');


-- ================================================================
-- COMMIT
-- ================================================================

COMMIT;