class User < ApplicationRecord
  has_secure_password

  has_many :chapter_reads, dependent: :destroy
  has_many :read_chapters, through: :chapter_reads, source: :chapter
  has_many :boss_defeats, dependent: :destroy
  has_many :character_views, dependent: :destroy
  has_many :viewed_characters, through: :character_views, source: :image
  has_many :user_unlocks, dependent: :destroy
  has_many :unlocked_characters, through: :user_unlocks, source: :image

  validates :username, presence: true,
                       uniqueness: { case_sensitive: false },
                       length: { minimum: 3, maximum: 20 },
                       format: { with: /\A[a-zA-Z0-9_]+\z/,
                                 message: "can only contain letters, numbers, and underscores" }
  validates :password, length: { minimum: 6 }, on: :create

  # Rank thresholds and names
  RANKS = [
    { name: 'Mortal', threshold: 0, color: '#888888', icon: '👤' },
    { name: 'Demigod', threshold: 100, color: '#88aaff', icon: '⭐' },
    { name: 'Hero', threshold: 500, color: '#44dd44', icon: '🗡️' },
    { name: 'Champion', threshold: 1_500, color: '#ddaa44', icon: '🏆' },
    { name: 'Olympian', threshold: 5_000, color: '#ff8844', icon: '⚡' },
    { name: 'Titan', threshold: 15_000, color: '#dd44dd', icon: '🔥' },
    { name: 'Primordial', threshold: 50_000, color: '#ffdd44', icon: '👑' },
  ].freeze

  # Point values for activities
  POINT_VALUES = {
    chapter_read: 10,
    character_view: 5,
    character_unlock: 20,
    boss_easy: 15,
    boss_medium: 25,
    boss_hard: 40,
  }.freeze

  def rank
    RANKS.reverse.find { |r| points >= r[:threshold] } || RANKS.first
  end

  def rank_name
    rank[:name]
  end

  def rank_color
    rank[:color]
  end

  def rank_icon
    rank[:icon]
  end

  def next_rank
    current_index = RANKS.index(rank)
    RANKS[current_index + 1]
  end

  def points_to_next_rank
    nr = next_rank
    return 0 unless nr

    nr[:threshold] - points
  end

  def rank_progress_percent
    nr = next_rank
    return 100 unless nr

    current_threshold = rank[:threshold]
    next_threshold = nr[:threshold]
    range = next_threshold - current_threshold
    progress = points - current_threshold
    ((progress.to_f / range) * 100).clamp(0, 100).round
  end

  def display_name_or_username
    display_name.presence || username
  end

  # Award points and save, returns hash with rank change info
  def award_points!(amount, source = nil)
    old_rank = rank
    self.points += amount
    save!
    new_rank = rank

    # Check if rank changed
    if old_rank[:name] != new_rank[:name]
      # Store rank up info in a thread-local variable for the controller to access
      Thread.current[:rank_up_info] = {
        old_rank: old_rank,
        new_rank: new_rank,
        points_awarded: amount,
      }
    end

    amount
  end

  # Check if there was a recent rank up (called from controller)
  def self.consume_rank_up_info
    info = Thread.current[:rank_up_info]
    Thread.current[:rank_up_info] = nil
    info
  end

  # Record reading a chapter (only first time awards points)
  def record_chapter_read!(chapter)
    return 0 if chapter_reads.exists?(chapter: chapter)

    pts = POINT_VALUES[:chapter_read]
    chapter_reads.create!(
      chapter: chapter,
      points_awarded: pts,
      read_at: Time.current
    )
    award_points!(pts)
  end

  # Record viewing a character (only first time awards points)
  def record_character_view!(image)
    return 0 if character_views.exists?(image: image)

    pts = POINT_VALUES[:character_view]
    character_views.create!(
      image: image,
      points_awarded: pts,
      first_viewed_at: Time.current
    )
    award_points!(pts)
  end

  # Record boss defeat
  def record_boss_defeat!(boss_name, difficulty)
    pts = case difficulty.to_s.downcase
          when 'easy' then POINT_VALUES[:boss_easy]
          when 'medium' then POINT_VALUES[:boss_medium]
          when 'hard' then POINT_VALUES[:boss_hard]
          else POINT_VALUES[:boss_medium]
          end

    defeat = boss_defeats.find_by(boss_name: boss_name)
    if defeat
      defeat.update!(
        defeat_count: defeat.defeat_count + 1,
        last_defeated_at: Time.current
      )
      # Subsequent defeats award reduced points (20%)
      reduced_pts = (pts * 0.2).round
      award_points!(reduced_pts)
      reduced_pts
    else
      boss_defeats.create!(
        boss_name: boss_name,
        difficulty: difficulty,
        points_awarded: pts,
        first_defeated_at: Time.current,
        last_defeated_at: Time.current
      )
      award_points!(pts)
    end
  end

  # Record unlocking a character
  def record_character_unlock!(image)
    return 0 if user_unlocks.exists?(image: image)

    pts = POINT_VALUES[:character_unlock]
    user_unlocks.create!(
      image: image,
      points_awarded: pts,
      unlocked_at: Time.current
    )
    award_points!(pts)
  end

  # Stats for profile page
  def stats
    {
      total_points: points,
      chapters_read: chapter_reads.count,
      bosses_defeated: boss_defeats.count,
      total_boss_victories: boss_defeats.sum(:defeat_count),
      characters_viewed: character_views.count,
      characters_unlocked: user_unlocks.count,
    }
  end
end

