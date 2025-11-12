class Gallery < ApplicationRecord
  has_many :images, dependent: :destroy
  
  validates :title, presence: true
  validates :description, presence: true
end
