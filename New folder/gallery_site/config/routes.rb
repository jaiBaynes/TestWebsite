Rails.application.routes.draw do
  root "home#index"
  
  get "home/index"
  
  # Authentication
  get "login", to: "sessions#new", as: :login
  post "login", to: "sessions#create"
  delete "logout", to: "sessions#destroy", as: :logout
  get "signup", to: "registrations#new", as: :signup
  post "signup", to: "registrations#create"
  
  # Profile
  get "profile", to: "profiles#show", as: :profile
  get "profile/edit", to: "profiles#edit", as: :edit_profile
  patch "profile", to: "profiles#update"
  
  # API endpoints for progress tracking
  namespace :api do
    post "sync_progress", to: "progress#sync"
    post "record_boss_defeat", to: "progress#record_boss_defeat"
    post "record_chapter_read", to: "progress#record_chapter_read"
    get "user_stats", to: "progress#user_stats"
  end
  
  # Category pages
  get "characters", to: "galleries#characters", as: :characters
  get "locations", to: "galleries#locations", as: :locations
  get "items", to: "galleries#items", as: :items
  
  # Chapters/Stories
  get "stories", to: "chapters#index", as: :stories
  get "stories/:subcategory", to: "chapters#subcategory", as: :subcategory_chapters, constraints: { subcategory: /[^\/]+/ }
  post "stories/:subcategory/unlock", to: "chapters#unlock_subcategory", as: :unlock_subcategory
  resources :chapters, only: [:show] do
    member do
      post :complete
    end
  end
  
  # Games
  get "games", to: "games#index", as: :games
  post "games/random_characters", to: "games#random_characters", as: :games_random_characters
  
  # Keep galleries for show action and nested images
  resources :galleries, only: [:show] do
    resources :images, only: [:show]
  end
  
  # Admin panel for testing
  get "admin", to: "admin#index", as: :admin
  post "admin/users/:id/set_points", to: "admin#set_points", as: :admin_set_points
  post "admin/users/:id/reset_progress", to: "admin#reset_progress", as: :admin_reset_progress
  
  # Unlock system for testing
  get "unlocks", to: "unlocks#index", as: :unlocks
  post "unlocks/:id/unlock", to: "unlocks#unlock_character", as: :unlock_character
  post "unlocks/unlock_all", to: "unlocks#unlock_all", as: :unlock_all
  post "unlocks/lock_all", to: "unlocks#lock_all", as: :lock_all
  post "unlocks/clear_session", to: "unlocks#clear_unlocked_session", as: :clear_unlocked_session
  post "unlocks/clear_chapter_unlocks", to: "unlocks#clear_chapter_unlocks", as: :clear_chapter_unlocks

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
