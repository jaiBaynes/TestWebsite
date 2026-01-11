require 'fileutils'

namespace :games do
  desc "Build Boss Fights with pygbag and copy to public/games/bossfights"
  task :build_bossfights do
    sh "pygbag 'Boss Fights' --build"
    src = File.join(Dir.pwd, 'Boss Fights', 'build', 'web')
    dest = File.join(Dir.pwd, 'public', 'games', 'bossfights')
    FileUtils.rm_rf(dest)
    FileUtils.mkdir_p(dest)
    FileUtils.cp_r(Dir["#{src}/*"], dest)
    puts "Copied build to #{dest}"
  end
end
