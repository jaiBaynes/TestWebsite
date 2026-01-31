class CharacterView < ApplicationRecord
  belongs_to :user
  belongs_to :image

  validates :user_id, uniqueness: { scope: :image_id }
  validates :first_viewed_at, presence: true
end

