class RegistrationsController < ApplicationController
  def new
    redirect_to root_path, notice: "You're already logged in." if current_user
    @user = User.new
  end

  def create
    @user = User.new(user_params)

    if @user.save
      session[:user_id] = @user.id
      redirect_to profile_path, notice: "Welcome to the Mythology Archive, #{@user.display_name_or_username}!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation, :display_name)
  end
end

