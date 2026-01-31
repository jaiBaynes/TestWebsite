class AdminController < ApplicationController
  def index
    @users = User.order(points: :desc)
  end

  def set_points
    @user = User.find(params[:id])
    old_points = @user.points
    old_rank = @user.rank_name
    new_points = params[:points].to_i

    @user.update!(points: new_points)
    new_rank = @user.rank_name

    # Check for rank change
    rank_changed = old_rank != new_rank

    respond_to do |format|
      format.html do
        if rank_changed
          redirect_to admin_path,
                      notice: "#{@user.username}'s points set to #{new_points}. Rank changed: #{old_rank} → #{new_rank}!"
        else
          redirect_to admin_path, notice: "#{@user.username}'s points set to #{new_points}."
        end
      end
      format.json do
        render json: {
          success: true,
          old_points: old_points,
          new_points: new_points,
          old_rank: old_rank,
          new_rank: new_rank,
          rank_changed: rank_changed,
        }
      end
    end
  end

  def reset_progress
    @user = User.find(params[:id])

    # Reset all progress
    @user.chapter_reads.destroy_all
    @user.boss_defeats.destroy_all
    @user.character_views.destroy_all
    @user.user_unlocks.destroy_all
    @user.update!(points: 0)

    redirect_to admin_path, notice: "#{@user.username}'s progress has been completely reset."
  end
end

