class BooksController < ApplicationController
  def index
    @books = [
      {
        id: 'gods-monsters-solaris',
        title: 'Gods & Monsters: Solaris',
        category: 'Fiction',
        status: 'available',
        cover_image: '/images/characters/zeus_4.png',
        amazon_url: 'https://www.amazon.ca/Gods-Monsters-Solaris-Jaiden-Baynes-ebook/dp/B0CW1J4DZ9',
        description: 'In a world where ancient Greek mythology is more than just stories, the battle between Olympus and the Underworld reaches a new climax. Follow the clash of gods, the rise of heroes, and the rebellion of monsters in this epic reimagining of classical mythology.',
        features: ['Epic Fantasy', 'Mythology', 'Action'],
        release_date: '2024'
      },
      {
        id: 'enemies-of-africa',
        title: 'Enemies of Africa',
        subtitle: 'Second Edition',
        category: 'Non-Fiction',
        status: 'available',
        cover_image: nil,
        amazon_url: 'https://www.amazon.com/dp/B0C976G24L',
        description: 'Winner of The Literary Titan Gold Book Award! A gripping exposé, shining new light on Africa\'s users and abusers, from the past to the present. Exploring the varieties of Anti-Africanism that have evolved through the ages.',
        features: ['History', 'Social Sciences', 'Award Winner'],
        release_date: '2023',
        award: 'Literary Titan Gold Book Award'
      },
      {
        id: 'evolution-of-monsters',
        title: 'Evolution of Monsters',
        category: 'Non-Fiction',
        status: 'coming_soon',
        cover_image: nil,
        amazon_url: nil,
        description: 'An in-depth exploration of how monsters have been depicted throughout human history. From ancient cave paintings to modern cinema, trace the evolution of our collective fears and the creatures we created to embody them.',
        features: ['Research', 'Cultural Studies', 'History'],
        release_date: 'Coming 2026'
      }
    ]
  end

  def show
    book_id = params[:id]
    # Could be expanded to have individual book pages
    redirect_to books_path
  end
end

