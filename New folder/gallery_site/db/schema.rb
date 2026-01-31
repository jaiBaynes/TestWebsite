# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_01_31_200351) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "boss_defeats", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "boss_name", null: false
    t.string "difficulty", null: false
    t.integer "points_awarded", default: 0, null: false
    t.integer "defeat_count", default: 1, null: false
    t.datetime "first_defeated_at", null: false
    t.datetime "last_defeated_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "boss_name"], name: "index_boss_defeats_on_user_id_and_boss_name", unique: true
    t.index ["user_id"], name: "index_boss_defeats_on_user_id"
  end

  create_table "chapter_reads", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "chapter_id", null: false
    t.integer "points_awarded", default: 0, null: false
    t.datetime "read_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chapter_id"], name: "index_chapter_reads_on_chapter_id"
    t.index ["user_id", "chapter_id"], name: "index_chapter_reads_on_user_id_and_chapter_id", unique: true
    t.index ["user_id"], name: "index_chapter_reads_on_user_id"
  end

  create_table "chapter_unlocks", force: :cascade do |t|
    t.integer "chapter_id", null: false
    t.integer "image_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chapter_id", "image_id"], name: "index_chapter_unlocks_on_chapter_id_and_image_id", unique: true
    t.index ["chapter_id"], name: "index_chapter_unlocks_on_chapter_id"
    t.index ["image_id"], name: "index_chapter_unlocks_on_image_id"
  end

  create_table "chapters", force: :cascade do |t|
    t.string "title"
    t.string "slug"
    t.string "category"
    t.decimal "chapter_number", precision: 10, scale: 3
    t.string "file_path"
    t.boolean "published", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "subcategory"
    t.boolean "locked", default: false
    t.string "password"
    t.index ["category"], name: "index_chapters_on_category"
    t.index ["slug"], name: "index_chapters_on_slug", unique: true
  end

  create_table "character_images", force: :cascade do |t|
    t.integer "image_id", null: false
    t.string "image_path", null: false
    t.integer "position", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["image_id", "position"], name: "index_character_images_on_image_id_and_position"
    t.index ["image_id"], name: "index_character_images_on_image_id"
  end

  create_table "character_views", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "image_id", null: false
    t.integer "points_awarded", default: 0, null: false
    t.datetime "first_viewed_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["image_id"], name: "index_character_views_on_image_id"
    t.index ["user_id", "image_id"], name: "index_character_views_on_user_id_and_image_id", unique: true
    t.index ["user_id"], name: "index_character_views_on_user_id"
  end

  create_table "galleries", force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "category", default: "characters"
    t.string "music_file"
    t.string "background_image"
    t.index ["category"], name: "index_galleries_on_category"
  end

  create_table "images", force: :cascade do |t|
    t.integer "gallery_id", null: false
    t.string "name", null: false
    t.string "quote", null: false
    t.text "biography", null: false
    t.string "image_url", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "artist"
    t.text "myth_inspiration"
    t.text "powers"
    t.string "home"
    t.text "family"
    t.text "personality"
    t.string "first_appearance"
    t.string "race"
    t.text "goal"
    t.boolean "locked", default: false, null: false
    t.index ["gallery_id"], name: "index_images_on_gallery_id"
  end

  create_table "user_unlocks", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "image_id", null: false
    t.integer "points_awarded", default: 0, null: false
    t.datetime "unlocked_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["image_id"], name: "index_user_unlocks_on_image_id"
    t.index ["user_id", "image_id"], name: "index_user_unlocks_on_user_id_and_image_id", unique: true
    t.index ["user_id"], name: "index_user_unlocks_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "password_digest", null: false
    t.integer "points", default: 0, null: false
    t.string "display_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "boss_defeats", "users"
  add_foreign_key "chapter_reads", "chapters"
  add_foreign_key "chapter_reads", "users"
  add_foreign_key "chapter_unlocks", "chapters"
  add_foreign_key "chapter_unlocks", "images"
  add_foreign_key "character_views", "images"
  add_foreign_key "character_views", "users"
  add_foreign_key "images", "galleries"
  add_foreign_key "user_unlocks", "images"
  add_foreign_key "user_unlocks", "users"
end
