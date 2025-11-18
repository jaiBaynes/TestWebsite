class AddPersonalityAndFirstAppearanceToImages < ActiveRecord::Migration[7.1]
  def change
    add_column :images, :personality, :text
    add_column :images, :first_appearance, :string
  end
end
