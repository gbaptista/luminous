def memory_and_cpu_for(grep)
  [
    'ps aux',
    'grep -v grep',
    "grep '#{grep}'",
    "awk '{print $2}'",
    'xargs -I % pstree -p %',
    "grep -o '([0-9]\\+)'",
    "grep -o '[0-9]\\+'",
    'xargs ps -o %mem,%cpu,cmd -p',
    "awk '{memory+=$1;cpu+=$2} END {print memory,cpu}'"
  ].join(' | ')
end

def installed_mb_memory
  `free -m | grep Mem | awk '{print $2}'`.to_i
end
@app_A = 'lum-prev'
@app_B = 'lum-next'
@memory = installed_mb_memory
@monitor_A = memory_and_cpu_for(@app_A)
@monitor_B = memory_and_cpu_for(@app_B)

def print_current_stats(app, monitor)
  mem_pct, cpu_pct = `#{monitor}`.split(' ').map(&:to_f)
  mem_mb   = '%4.5s' % ((mem_pct/100) * @memory).to_i.to_s

  mem_pct_str = '%5.4s' % mem_pct
  cpu_pct_str = '%5.4s' % cpu_pct

  bar_size = 15

  mem_pct_bar = ('█' * ((mem_pct/100) * bar_size).ceil)
  mem_spaces = (bar_size - mem_pct_bar.size)
  if mem_spaces < 0
    mem_spaces = 0
  end
  mem_pct_bar = mem_pct_bar + (' ' * mem_spaces)

  cpu_pct_bar = ('█' * ((cpu_pct/100) * bar_size).ceil)
  cpu_spaces = (bar_size - cpu_pct_bar.size)
  if cpu_spaces < 0
    cpu_spaces = 0
  end
  cpu_pct_bar = cpu_pct_bar + (' ' * cpu_spaces)

  "#{app} | RAM: #{mem_mb} MB #{mem_pct_bar} | CPU: #{cpu_pct_str}% #{cpu_pct_bar}"
end

def print_compare
  '| ' + print_current_stats(@app_A, @monitor_A) + ' | ' + print_current_stats(@app_B, @monitor_B) + ' |'
end

while true do
  begin
    puts print_compare
  rescue => _
  end
end
