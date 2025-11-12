class CreateGalleries < ActiveRecord::Migration[7.1]
  def change
    create_table :galleries do |t|
      t.string :title, null: false
      t.text :description, null: false

      t.timestamps
    end
  end
end
