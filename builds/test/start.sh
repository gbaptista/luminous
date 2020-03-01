ps aux | grep 'firefox' | awk '{print $2}' | xargs -I % kill -9 %

firefox-trunk -P lum-prev &
firefox-trunk -P lum-next &
