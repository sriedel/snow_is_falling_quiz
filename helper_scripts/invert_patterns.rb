#!/usr/bin/env ruby

ARGF.each_line do |line|
  line.strip!
  pattern, result = line.split /:\s+/
  pattern.tr! "'", ''

  inverted_pattern = []
  pattern.split( // ).each_slice(3) do |column|
    inverted_pattern.concat( column.reverse )
  end

  puts "'#{inverted_pattern.join}': #{result}"
end
