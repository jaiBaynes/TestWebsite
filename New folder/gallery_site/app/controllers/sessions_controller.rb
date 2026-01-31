class SessionsController < ApplicationController
  def new
    redirect_to root_path, notice: "You're already logged in." if current_user
  end

  def create
    user = User.find_by("LOWER(username) = ?", params[:username].to_s.downcase)

    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to profile_path, notice: "Welcome back, #{user.display_name_or_username}!"
    else
      flash.now[:alert] = "Invalid username or password."
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_path, notice: "You've been logged out."
  end
end

