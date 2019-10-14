#!/bin/sh
image_png="./images/logo.png"
image_ico="./images/logo.ico"
target_dir="./favicon"


echo $image_ico $image_png $target_dir
convert -resize 64x64! $image_ico $target_dir/favicon.ico
convert -resize 180x180! $image_png $target_dir/favicon-apple-180x180.png
convert -resize 192x192! $image_png $target_dir/favicon-192x192.png
convert -resize 384x384! $image_png $target_dir/favicon-384x384.png
convert -resize 512x512! $image_png $target_dir/favicon-512x512.png
convert -resize 1024x1024! $image_png $target_dir/favicon-1024x1024.png


convert -resize 70x70! $image_png $target_dir/tile-win-70x70.png
convert -resize 150x150! $image_png $target_dir/tile-win-150x150.png
convert -resize 310x150! $image_png $target_dir/tile-win-310x150.png
convert -resize 310x310! $image_png $target_dir/tile-win-310x310.png

cp $target_dir/* ../hass_frontend/static/icons/
cp $target_dir/* ../public/static/icons/

