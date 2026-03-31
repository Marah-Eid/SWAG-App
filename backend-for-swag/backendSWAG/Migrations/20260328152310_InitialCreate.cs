using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using SwagBackend.Models;

#nullable disable

namespace SwagBackend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:media_type.media_type", "image,video")
                .Annotation("Npgsql:Enum:message_type.message_type", "text,image,video")
                .Annotation("Npgsql:Enum:notification_type.notification_type", "maintenance_alert,vendor_post,insurance_expiry,new_event,mention,nearby_suggestion,system_alert,account_status,new_review,new_follower,event_update,inventory_tip")
                .Annotation("Npgsql:Enum:otp_purpose.otp_purpose", "signup,forgot_password,change_contact")
                .Annotation("Npgsql:Enum:post_type.post_type", "post,event")
                .Annotation("Npgsql:Enum:user_role.user_role", "customer,vendor,admin")
                .Annotation("Npgsql:Enum:vendor_status.vendor_status", "pending,active,rejected");

            migrationBuilder.CreateTable(
                name: "admins",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admins", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "conversations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    participant_one_id = table.Column<Guid>(type: "uuid", nullable: false),
                    participant_one_type = table.Column<UserRole>(type: "user_role", nullable: false),
                    participant_two_id = table.Column<Guid>(type: "uuid", nullable: false),
                    participant_two_type = table.Column<UserRole>(type: "user_role", nullable: false),
                    last_message = table.Column<string>(type: "text", nullable: true),
                    last_message_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    p1_unread = table.Column<int>(type: "integer", nullable: false),
                    p2_unread = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_conversations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    profile_image = table.Column<string>(type: "text", nullable: true),
                    banner_image = table.Column<string>(type: "text", nullable: true),
                    language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    dark_mode = table.Column<bool>(type: "boolean", nullable: false),
                    push_notifications = table.Column<bool>(type: "boolean", nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "event_types",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_types", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_type = table.Column<UserRole>(type: "user_role", nullable: false),
                    type = table.Column<NotificationType>(type: "notification_type", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    deep_link = table.Column<string>(type: "text", nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "otp_verifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    purpose = table.Column<OtpPurpose>(type: "otp_purpose", nullable: false),
                    is_used = table.Column<bool>(type: "boolean", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_otp_verifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "vendor_category_sections",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_category_sections", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "vendors",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    shop_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    shop_type = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    location_url = table.Column<string>(type: "text", nullable: true),
                    location_lat = table.Column<decimal>(type: "numeric", nullable: true),
                    location_lng = table.Column<decimal>(type: "numeric", nullable: true),
                    commercial_reg_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    bio = table.Column<string>(type: "text", nullable: true),
                    profile_image = table.Column<string>(type: "text", nullable: true),
                    banner_image = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<VendorStatus>(type: "vendor_status", nullable: false),
                    language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    dark_mode = table.Column<bool>(type: "boolean", nullable: false),
                    push_notifications = table.Column<bool>(type: "boolean", nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendors", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "chat_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_type = table.Column<UserRole>(type: "user_role", nullable: false),
                    message_text = table.Column<string>(type: "text", nullable: true),
                    message_type = table.Column<MessageType>(type: "message_type", nullable: false),
                    media_url = table.Column<string>(type: "text", nullable: true),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_messages", x => x.id);
                    table.ForeignKey(
                        name: "FK_chat_messages_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "customer_cars",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    brand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    model = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    year = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    plate_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    engine_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    fuel_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    current_mileage = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    last_maintenance = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    next_maintenance = table.Column<DateOnly>(type: "date", nullable: true),
                    insurance_expiry = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    registration_date = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    car_image = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customer_cars", x => x.id);
                    table.ForeignKey(
                        name: "FK_customer_cars_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_category_items",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    section_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_category_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_vendor_category_items_vendor_category_sections_section_id",
                        column: x => x.section_id,
                        principalTable: "vendor_category_sections",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "customer_follows",
                columns: table => new
                {
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customer_follows", x => new { x.customer_id, x.vendor_id });
                    table.ForeignKey(
                        name: "FK_customer_follows_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_customer_follows_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    rating = table.Column<short>(type: "smallint", nullable: false),
                    feedback = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reviews", x => x.id);
                    table.ForeignKey(
                        name: "FK_reviews_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_reviews_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_approval_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    admin_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<VendorStatus>(type: "vendor_status", nullable: false),
                    actioned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_approval_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_vendor_approval_log_admins_admin_id",
                        column: x => x.admin_id,
                        principalTable: "admins",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_vendor_approval_log_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_collections",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_collections", x => x.id);
                    table.ForeignKey(
                        name: "FK_vendor_collections_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    license_file = table.Column<string>(type: "text", nullable: true),
                    id_front_file = table.Column<string>(type: "text", nullable: true),
                    id_back_file = table.Column<string>(type: "text", nullable: true),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_vendor_documents_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_follows",
                columns: table => new
                {
                    follower_id = table.Column<Guid>(type: "uuid", nullable: false),
                    following_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_follows", x => new { x.follower_id, x.following_id });
                    table.ForeignKey(
                        name: "FK_vendor_follows_vendors_follower_id",
                        column: x => x.follower_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_vendor_follows_vendors_following_id",
                        column: x => x.following_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_posts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    post_image = table.Column<string>(type: "text", nullable: true),
                    media_type = table.Column<MediaType>(type: "media_type", nullable: false),
                    media_width = table.Column<int>(type: "integer", nullable: true),
                    media_height = table.Column<int>(type: "integer", nullable: true),
                    type = table.Column<PostType>(type: "post_type", nullable: false),
                    event_title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    event_date = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    event_time = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    event_end_time = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_posts", x => x.id);
                    table.ForeignKey(
                        name: "FK_vendor_posts_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_profile_details",
                columns: table => new
                {
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    address = table.Column<string>(type: "text", nullable: true),
                    whatsapp = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    instagram_url = table.Column<string>(type: "text", nullable: true),
                    open_time = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    close_time = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_profile_details", x => x.vendor_id);
                    table.ForeignKey(
                        name: "FK_vendor_profile_details_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "car_maintenance_records",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    car_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    record_date = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_car_maintenance_records", x => x.id);
                    table.ForeignKey(
                        name: "FK_car_maintenance_records_customer_cars_car_id",
                        column: x => x.car_id,
                        principalTable: "customer_cars",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "customer_interests",
                columns: table => new
                {
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    item_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customer_interests", x => new { x.customer_id, x.item_id });
                    table.ForeignKey(
                        name: "FK_customer_interests_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_customer_interests_vendor_category_items_item_id",
                        column: x => x.item_id,
                        principalTable: "vendor_category_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_selected_categories",
                columns: table => new
                {
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    item_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_selected_categories", x => new { x.vendor_id, x.item_id });
                    table.ForeignKey(
                        name: "FK_vendor_selected_categories_vendor_category_items_item_id",
                        column: x => x.item_id,
                        principalTable: "vendor_category_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_vendor_selected_categories_vendors_vendor_id",
                        column: x => x.vendor_id,
                        principalTable: "vendors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "post_categories",
                columns: table => new
                {
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    item_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_categories", x => new { x.post_id, x.item_id });
                    table.ForeignKey(
                        name: "FK_post_categories_vendor_category_items_item_id",
                        column: x => x.item_id,
                        principalTable: "vendor_category_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_post_categories_vendor_posts_post_id",
                        column: x => x.post_id,
                        principalTable: "vendor_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "post_comments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    commenter_id = table.Column<Guid>(type: "uuid", nullable: false),
                    commenter_type = table.Column<UserRole>(type: "user_role", nullable: false),
                    comment_text = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_comments", x => x.id);
                    table.ForeignKey(
                        name: "FK_post_comments_vendor_posts_post_id",
                        column: x => x.post_id,
                        principalTable: "vendor_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "post_event_types",
                columns: table => new
                {
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_type_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_event_types", x => new { x.post_id, x.event_type_id });
                    table.ForeignKey(
                        name: "FK_post_event_types_event_types_event_type_id",
                        column: x => x.event_type_id,
                        principalTable: "event_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_post_event_types_vendor_posts_post_id",
                        column: x => x.post_id,
                        principalTable: "vendor_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "post_likes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    liker_id = table.Column<Guid>(type: "uuid", nullable: false),
                    liker_type = table.Column<UserRole>(type: "user_role", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_likes", x => x.id);
                    table.ForeignKey(
                        name: "FK_post_likes_vendor_posts_post_id",
                        column: x => x.post_id,
                        principalTable: "vendor_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "post_saves",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false),
                    saver_id = table.Column<Guid>(type: "uuid", nullable: false),
                    saver_type = table.Column<UserRole>(type: "user_role", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_post_saves", x => x.id);
                    table.ForeignKey(
                        name: "FK_post_saves_vendor_posts_post_id",
                        column: x => x.post_id,
                        principalTable: "vendor_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_collection_posts",
                columns: table => new
                {
                    collection_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vendor_collection_posts", x => new { x.collection_id, x.post_id });
                    table.ForeignKey(
                        name: "FK_vendor_collection_posts_vendor_collections_collection_id",
                        column: x => x.collection_id,
                        principalTable: "vendor_collections",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_vendor_collection_posts_vendor_posts_post_id",
                        column: x => x.post_id,
                        principalTable: "vendor_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_car_maintenance_records_car_id",
                table: "car_maintenance_records",
                column: "car_id");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_conversation_id",
                table: "chat_messages",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "IX_conversations_participant_one_id_participant_one_type_parti~",
                table: "conversations",
                columns: new[] { "participant_one_id", "participant_one_type", "participant_two_id", "participant_two_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_customer_cars_customer_id",
                table: "customer_cars",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_customer_follows_vendor_id",
                table: "customer_follows",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_customer_interests_item_id",
                table: "customer_interests",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_categories_item_id",
                table: "post_categories",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_comments_post_id",
                table: "post_comments",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_event_types_event_type_id",
                table: "post_event_types",
                column: "event_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_post_likes_post_id_liker_id_liker_type",
                table: "post_likes",
                columns: new[] { "post_id", "liker_id", "liker_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_post_saves_post_id_saver_id_saver_type",
                table: "post_saves",
                columns: new[] { "post_id", "saver_id", "saver_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reviews_customer_id",
                table: "reviews",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_vendor_id_customer_id",
                table: "reviews",
                columns: new[] { "vendor_id", "customer_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vendor_approval_log_admin_id",
                table: "vendor_approval_log",
                column: "admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_approval_log_vendor_id",
                table: "vendor_approval_log",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_category_items_section_id_name",
                table: "vendor_category_items",
                columns: new[] { "section_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vendor_collection_posts_post_id",
                table: "vendor_collection_posts",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_collections_vendor_id",
                table: "vendor_collections",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_documents_vendor_id",
                table: "vendor_documents",
                column: "vendor_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vendor_follows_following_id",
                table: "vendor_follows",
                column: "following_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_posts_vendor_id",
                table: "vendor_posts",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_selected_categories_item_id",
                table: "vendor_selected_categories",
                column: "item_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "car_maintenance_records");

            migrationBuilder.DropTable(
                name: "chat_messages");

            migrationBuilder.DropTable(
                name: "customer_follows");

            migrationBuilder.DropTable(
                name: "customer_interests");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "otp_verifications");

            migrationBuilder.DropTable(
                name: "post_categories");

            migrationBuilder.DropTable(
                name: "post_comments");

            migrationBuilder.DropTable(
                name: "post_event_types");

            migrationBuilder.DropTable(
                name: "post_likes");

            migrationBuilder.DropTable(
                name: "post_saves");

            migrationBuilder.DropTable(
                name: "reviews");

            migrationBuilder.DropTable(
                name: "vendor_approval_log");

            migrationBuilder.DropTable(
                name: "vendor_collection_posts");

            migrationBuilder.DropTable(
                name: "vendor_documents");

            migrationBuilder.DropTable(
                name: "vendor_follows");

            migrationBuilder.DropTable(
                name: "vendor_profile_details");

            migrationBuilder.DropTable(
                name: "vendor_selected_categories");

            migrationBuilder.DropTable(
                name: "customer_cars");

            migrationBuilder.DropTable(
                name: "conversations");

            migrationBuilder.DropTable(
                name: "event_types");

            migrationBuilder.DropTable(
                name: "admins");

            migrationBuilder.DropTable(
                name: "vendor_collections");

            migrationBuilder.DropTable(
                name: "vendor_posts");

            migrationBuilder.DropTable(
                name: "vendor_category_items");

            migrationBuilder.DropTable(
                name: "customers");

            migrationBuilder.DropTable(
                name: "vendors");

            migrationBuilder.DropTable(
                name: "vendor_category_sections");
        }
    }
}
