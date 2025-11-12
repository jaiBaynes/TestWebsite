class CreateImages < ActiveRecord::Migration[7.1]
  def change
    create_table :images do |t|
      t.references :gallery, null: false, foreign_key: true
      t.string :name, null: false
      t.string :quote, null: false
      t.text :biography, null: false
      t.string :image_url, null: false

      t.timestamps
    end
  end
end
