Rails.application.routes.draw do
  root "home#index"
  
  get "home/index"
  
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
