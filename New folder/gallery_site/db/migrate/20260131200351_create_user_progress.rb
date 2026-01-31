class CreateUserProgress < ActiveRecord::Migration[7.1]
  def change
    # Track which chapters users have read
    create_table :chapter_reads do |t|
      t.references :user, null: false, foreign_key: true
      t.references :chapter, null: false, foreign_key: true
      t.integer :points_awarded, null: false, default: 0
      t.datetime :read_at, null: false

      t.timestamps
    end
    add_index :chapter_reads, [:user_id, :chapter_id], unique: true

    # Track boss defeats
    create_table :boss_defeats do |t|
      t.references :user, null: false, foreign_key: true
      t.string :boss_name, null: false
      t.string :difficulty, null: false
      t.integer :points_awarded, null: false, default: 0
      t.integer :defeat_count, null: false, default: 1
      t.datetime :first_defeated_at, null: false
      t.datetime :last_defeated_at, null: false

      t.timestamps
    end
    add_index :boss_defeats, [:user_id, :boss_name], unique: true

    # Track character page views (first visit awards points)
    create_table :character_views do |t|
      t.references :user, null: false, foreign_key: true
      t.references :image, null: false, foreign_key: true
      t.integer :points_awarded, null: false, default: 0
      t.datetime :first_viewed_at, null: false

      t.timestamps
    end
    add_index :character_views, [:user_id, :image_id], unique: true

    # Track user unlocked characters (separate from global unlock)
    create_table :user_unlocks do |t|
      t.references :user, null: false, foreign_key: true
      t.references :image, null: false, foreign_key: true
      t.integer :points_awarded, null: false, default: 0
      t.datetime :unlocked_at, null: false

      t.timestamps
    end
    add_index :user_unlocks, [:user_id, :image_id], unique: true
  end
end
