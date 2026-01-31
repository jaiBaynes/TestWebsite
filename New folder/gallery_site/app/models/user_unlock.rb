class UserUnlock < ApplicationRecord
  belongs_to :user
  belongs_to :image

  validates :user_id, uniqueness: { scope: :image_id }
  validates :unlocked_at, presence: true
end

