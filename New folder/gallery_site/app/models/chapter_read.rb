class ChapterRead < ApplicationRecord
  belongs_to :user
  belongs_to :chapter

  validates :user_id, uniqueness: { scope: :chapter_id }
  validates :read_at, presence: true
end

