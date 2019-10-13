#!/bin/sh
convert -resize 64x64! logo.jpg favicon.ico
convert -resize 192x192! logo.jpg favicon-192x192.png
convert -resize 384x384! logo.jpg favicon-384x384.png
convert -resize 512x512! logo.jpg favicon-512x512.png
convert -resize 1024x1024! logo.jpg favicon-1024x1024.png


