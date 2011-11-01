#!/usr/bin/env ruby

def expand_pattern( pattern_ary, &block )
  pos = pattern_ary.index( "?" )

  if !pos
    block.call( pattern_ary.join )
  else
    pattern_copy = pattern_ary.dup
    pattern_copy[pos] = 0
    expand_pattern( pattern_copy, &block )

    pattern_copy[pos] = 1
    expand_pattern( pattern_copy, &block )
  end
end

rules = {
  '????1????' => 1,
  '010000000' => 1,
  '000000010' => 1,
  '000100000' => 1,
  '000001000' => 1,
  '100100000' => 1,
  '000100100' => 1,
  '001001000' => 1,
  '000001001' => 1,
  '110000000' => 1,
  '011000000' => 1,
  '000000110' => 1,
  '000000011' => 1,
};

puts "var Law = {"
rules.each_pair do |meta_pattern, result| 
  expand_pattern( meta_pattern.split( // ) ) do |expanded_pattern|
    puts "'#{expanded_pattern}': 1,"
  end
end
puts "};"
