class Chapter < ApplicationRecord
  has_many :chapter_unlocks, dependent: :destroy
  has_many :unlockable_characters, through: :chapter_unlocks, source: :image
  
  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :file_path, presence: true
  validates :category, presence: true, inclusion: { in: %w[bonus_chapters act1 act2 act3] }
  
  scope :published, -> { where(published: true) }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_subcategory, ->(subcategory) { where(subcategory: subcategory) }
  scope :ordered, -> { order(:category, :subcategory, Arel.sql('CAST(chapter_number AS DECIMAL)')) }
  
  # Get all unique subcategories for bonus_chapters
  def self.bonus_subcategories
    where(category: 'bonus_chapters').where.not(subcategory: nil).select(:subcategory).distinct.pluck(:subcategory).sort
  end
  
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
  
  # Get chapter number as float for proper decimal sorting
  def chapter_number_float
    chapter_number.to_f if chapter_number.present?
  end
  
  private
  
  def generate_slug
    self.slug = title.parameterize if title.present?
  end
end
