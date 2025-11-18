class AddRaceToImages < ActiveRecord::Migration[7.1]
  def change
    add_column :images, :race, :string
  end
end
