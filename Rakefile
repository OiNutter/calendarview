require 'rake'
require 'rake/packagetask'

CALENDARVIEW_VERSION  = '1.2'

ROOT_DIR = File.expand_path(File.dirname(__FILE__))
SRC_DIR = File.join(ROOT_DIR, 'src')
DIST_DIR = File.join(ROOT_DIR,'dist')

RELEASE_DIR = File.join(DIST_DIR, 'release')

task :default => [:clean,:dist,:unify,:package]

$:.unshift File.join(ROOT_DIR, 'vendor', 'sprockets', 'lib')
$:.unshift File.join(ROOT_DIR, 'vendor', 'uglifier', 'lib')

#####################
#Rake Task Functions#
#####################

def sprocketize(path, source, destination=nil)
  destination ||= File.join(DIST_DIR,source)
  begin
    require "sprockets"
  rescue LoadError => e
    puts "\nCalendarView requires Sprockets to build the files. Just run:\n\n"
    puts "  $ git submodule init"
    puts "  $ git submodule update"
    puts "\nto pull in the necessary submodules.\n\n"
  end
  
  puts "Sprocketizing (#{source})..."
  environment = Sprockets::Environment.new
  environment.append_path File.join(SRC_DIR)
  environment.append_path File.join(SRC_DIR,'javascripts')
  environment.append_path File.join(SRC_DIR,'stylesheets')
  
  File.open(destination, "w"){|f| f.puts environment[source].to_s}
   
end

def uglifyjs(src, target)
  begin
    require 'uglifier'
  rescue LoadError => e
     puts "\nCalendarView requires Uglifier to minify the files. Just run:\n\n"
     puts "  $ git submodule init"
     puts "  $ git submodule update"
     puts "\nto pull in the necessary submodules.\n\n"
    return false
  end
  puts "Minifying #{src} with UglifyJS..."
  File.open(target, "w"){|f| f.puts Uglifier.new.compile(File.read(src))}
  
  process_minified src, target
end

def process_minified(src, target)
  cp target, File.join(DIST_DIR,'temp.js')
  msize = File.size(File.join(DIST_DIR,'temp.js'))
  `gzip -9 #{File.join(DIST_DIR,'temp.js')}`

  osize = File.size(src)
  dsize = File.size(File.join(DIST_DIR,'temp.js.gz'))
  rm_rf File.join(DIST_DIR,'temp.js.gz')

  puts "Original version: %.3fk" % (osize/1024.0)
  puts "Minified: %.3fk" % (msize/1024.0)
  puts "Minified and gzipped: %.3fk, compression factor %.3f" % [dsize/1024.0, osize/dsize.to_f]
end

def dist_from_sources(sources,target=nil)
  sprocketize("src", sources, target)
end

def unify_distribution(sources,output)
  unified = ''
  for source in sources do
    unified += IO.read(source)
  end
  
  File.open(File.join(DIST_DIR,output), 'w') do |file|
    file.write unified
  end 

  uglifyjs File.join(DIST_DIR,output), File.join(RELEASE_DIR,output.gsub('.js','.min.js'))

end

############
#Rake Tasks#
############

desc "Clean the distribution directory."
task :clean do 
  rm_rf DIST_DIR
  mkdir DIST_DIR
  mkdir File.join(DIST_DIR,'javascripts')
  mkdir File.join(DIST_DIR,'stylesheets')
  mkdir RELEASE_DIR
  mkdir File.join(RELEASE_DIR,'javascripts')
  mkdir File.join(RELEASE_DIR,'stylesheets')
end

desc "Builds the distribution."
task :dist => ['dist:default']
namespace :dist do
  task :default do
    dist_from_sources("javascripts/calendarview.js")
    dist_from_sources("stylesheets/calendarview.css")
    cp File.join(DIST_DIR,'stylesheets','calendarview.css'), File.join(RELEASE_DIR,'stylesheets','calendarview.css')
    cp File.join(ROOT_DIR,'lib','prototype.js'), File.join(DIST_DIR,'javascripts','prototype.js')
    uglifyjs File.join(DIST_DIR,'javascripts','calendarview.js'), File.join(RELEASE_DIR,'javascripts','calendarview.min.js')
    uglifyjs File.join(DIST_DIR,'javascripts','prototype.js'), File.join(RELEASE_DIR,'javascripts','prototype.min.js')
  end
end

desc "Generates a combined file from ermintrude.js and ermintrude.shapes.js."
task :unify do
    puts 'Combining calendarview.js and prototype.js'
    unify_distribution [File.join(DIST_DIR,'javascripts','prototype.js'),File.join(DIST_DIR,'javascripts','calendarview.js')], 'javascripts/proto.calendarview.js'
    uglifyjs File.join(DIST_DIR,'javascripts','proto.calendarview.js'), File.join(RELEASE_DIR,'javascripts','proto.calendarview.min.js')
end

Rake::PackageTask.new('calendarview', CALENDARVIEW_VERSION) do |package|
  package.need_zip = true
  package.package_dir = 'pkg'
  package.package_files.include(
    'dist/javascripts/**',
    'dist/stylesheets/**',
    'examples/**',
    'ChangeLog'
  )
end
