Rails.application.routes.draw do
  root "home#index"
  
  get "home/index"
  
  # Category pages
  get "characters", to: "galleries#characters", as: :characters
  get "locations", to: "galleries#locations", as: :locations
  get "items", to: "galleries#items", as: :items
  
  # Keep galleries for show action and nested images
  resources :galleries, only: [:show] do
    resources :images, only: [:show]
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
