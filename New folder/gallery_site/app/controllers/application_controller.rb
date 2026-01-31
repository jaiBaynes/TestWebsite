class ApplicationController < ActionController::Base
  helper_method :current_user, :logged_in?, :rank_up_info

  after_action :check_for_rank_up

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def logged_in?
    current_user.present?
  end

  def require_login
    unless logged_in?
      redirect_to login_path, alert: "Please log in to continue."
    end
  end

  def check_for_rank_up
    return unless logged_in?

    info = User.consume_rank_up_info
    if info
      session[:rank_up_info] = info
    end
  end

  def rank_up_info
    info = session[:rank_up_info]
    session.delete(:rank_up_info) if info
    return nil unless info

    # Convert to HashWithIndifferentAccess to handle symbol/string key issues
    info = info.with_indifferent_access
    info[:old_rank] = info[:old_rank].with_indifferent_access if info[:old_rank]
    info[:new_rank] = info[:new_rank].with_indifferent_access if info[:new_rank]
    info
  end
end
