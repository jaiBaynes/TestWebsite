class CreateImages < ActiveRecord::Migration[7.1]
  def change
    create_table :images do |t|
      t.references :gallery, null: false, foreign_key: true
      t.string :caption, null: false

      t.timestamps
    end
  end
end
