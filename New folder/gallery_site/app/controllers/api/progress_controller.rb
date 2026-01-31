module Api
  class ProgressController < ApplicationController
    skip_before_action :verify_authenticity_token, only: [:sync, :record_boss_defeat]

    def sync
      unless current_user
        render json: { success: false, error: "Not logged in" }, status: :unauthorized
        return
      end

      # Sync boss defeats from localStorage
      boss_defeats = params[:boss_defeats] || []
      total_points_awarded = 0

      boss_defeats.each do |defeat|
        boss_name = defeat[:boss_name] || defeat["boss_name"]
        difficulty = defeat[:difficulty] || defeat["difficulty"] || BossDefeat.difficulty_for(boss_name)
        pts = current_user.record_boss_defeat!(boss_name, difficulty)
        total_points_awarded += pts
      end

      render json: {
        success: true,
        points_awarded: total_points_awarded,
        total_points: current_user.points,
        rank: current_user.rank_name,
        stats: current_user.stats,
      }
    end

    def record_boss_defeat
      unless current_user
        render json: { success: false, error: "Not logged in" }, status: :unauthorized
        return
      end

      boss_name = params[:boss_name]
      difficulty = params[:difficulty] || BossDefeat.difficulty_for(boss_name)

      pts = current_user.record_boss_defeat!(boss_name, difficulty)

      render json: {
        success: true,
        points_awarded: pts,
        total_points: current_user.points,
        rank: current_user.rank_name,
        rank_icon: current_user.rank_icon,
        rank_color: current_user.rank_color,
      }
    end

    def record_chapter_read
      unless current_user
        render json: { success: false, error: "Not logged in" }, status: :unauthorized
        return
      end

      chapter = Chapter.find_by(id: params[:chapter_id]) || Chapter.find_by(slug: params[:chapter_slug])
      unless chapter
        render json: { success: false, error: "Chapter not found" }, status: :not_found
        return
      end

      pts = current_user.record_chapter_read!(chapter)

      render json: {
        success: true,
        points_awarded: pts,
        total_points: current_user.points,
        rank: current_user.rank_name,
      }
    end

    def user_stats
      unless current_user
        render json: { logged_in: false }
        return
      end

      render json: {
        logged_in: true,
        username: current_user.display_name_or_username,
        points: current_user.points,
        rank: current_user.rank_name,
        rank_icon: current_user.rank_icon,
        rank_color: current_user.rank_color,
        rank_progress: current_user.rank_progress_percent,
        points_to_next_rank: current_user.points_to_next_rank,
        next_rank: current_user.next_rank&.dig(:name),
        stats: current_user.stats,
      }
    end
  end
end

