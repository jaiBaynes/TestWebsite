class ProfilesController < ApplicationController
  before_action :require_login

  def show
    @user = current_user
    @stats = @user.stats
    @recent_chapters = @user.chapter_reads.includes(:chapter).order(read_at: :desc).limit(5)
    @recent_bosses = @user.boss_defeats.order(last_defeated_at: :desc).limit(5)
    @recent_views = @user.character_views.includes(:image).order(first_viewed_at: :desc).limit(5)
  end

  def edit
    @user = current_user
  end

  def update
    @user = current_user
    if @user.update(profile_params)
      redirect_to profile_path, notice: "Profile updated successfully."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.require(:user).permit(:display_name)
  end

  def require_login
    unless current_user
      redirect_to login_path, alert: "Please log in to view your profile."
    end
  end
end

