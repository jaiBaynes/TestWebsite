class ChangeChapterNumberToDecimal < ActiveRecord::Migration[7.1]
  def change
    change_column :chapters, :chapter_number, :decimal, precision: 10, scale: 3
  end
end
