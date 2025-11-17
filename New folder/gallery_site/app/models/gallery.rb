class Gallery < ApplicationRecord
  has_many :images, dependent: :destroy
  
  validates :title, presence: true
  validates :description, presence: true
  validates :category, presence: true, inclusion: { in: %w[characters locations items] }
  
  scope :characters, -> { where(category: 'characters') }
  scope :locations, -> { where(category: 'locations') }
  scope :items, -> { where(category: 'items') }
  
  def self.categories
    %w[characters locations items]
  end
end
