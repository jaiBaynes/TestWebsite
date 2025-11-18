class AddGoalToImages < ActiveRecord::Migration[7.1]
  def change
    add_column :images, :goal, :text
  end
end
