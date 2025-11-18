class Chapter < ApplicationRecord
  has_many :chapter_unlocks, dependent: :destroy
  has_many :unlockable_characters, through: :chapter_unlocks, source: :image
  
  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :file_path, presence: true
  validates :category, presence: true, inclusion: { in: %w[bonus_chapters act1 act2 act3] }
  
  scope :published, -> { where(published: true) }
  scope :by_category, ->(category) { where(category: category) }
  scope :ordered, -> { order(:category, :chapter_number) }
  
  before_validation :generate_slug, if: -> { slug.blank? }
  
  def content
    return @content if @content
    
    full_path = Rails.root.join('public', file_path)
    if File.exist?(full_path)
      @content = File.read(full_path)
    else
      @content = "Chapter file not found: #{file_path}"
    end
  end
  
  def to_param
    slug
  end
  
  private
  
  def generate_slug
    self.slug = title.parameterize if title.present?
  end
end
