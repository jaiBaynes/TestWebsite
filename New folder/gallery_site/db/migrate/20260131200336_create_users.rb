class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :username, null: false
      t.string :password_digest, null: false
      t.integer :points, null: false, default: 0
      t.string :display_name

      t.timestamps
    end
    add_index :users, :username, unique: true
  end
end
