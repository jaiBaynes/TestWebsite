class BossDefeat < ApplicationRecord
  belongs_to :user

  validates :user_id, uniqueness: { scope: :boss_name }
  validates :boss_name, presence: true
  validates :difficulty, presence: true
  validates :first_defeated_at, presence: true
  validates :last_defeated_at, presence: true

  # Map boss names to their difficulties
  BOSS_DIFFICULTIES = {
    'Zeus' => 'hard',
    'Hades' => 'medium',
    'Neptune' => 'hard',
    'Apollo' => 'medium',
    'Mercury' => 'easy',
    'Venus' => 'easy',
    'Hebe' => 'easy',
    'Cerberus' => 'hard',
    'Hecate' => 'medium',
    'Megaera' => 'medium',
    'Hydra' => 'medium',
    'Echidna' => 'hard',
    'Python' => 'medium',
    'Aquila' => 'easy',
    'Draco' => 'hard',
    'Hercules' => 'hard',
    'Melissa' => 'medium',
    'Scythia' => 'medium',
    'TerraSolaris' => 'hard',
    'Metis' => 'medium',
    'Kat' => 'easy',
  }.freeze

  def self.difficulty_for(boss_name)
    BOSS_DIFFICULTIES[boss_name] || 'medium'
  end
end

