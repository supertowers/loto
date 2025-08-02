#!/bin/bash

# Vim plugin installer for Loto language support
# This script installs syntax highlighting and filetype detection for .loto files

set -e

echo "Installing Loto vim plugin..."

# Create necessary directories
mkdir -p ~/.vim/syntax
mkdir -p ~/.vim/ftdetect

# Copy syntax file
echo "Installing syntax highlighting..."
cp loto.vim ~/.vim/syntax/

# Copy filetype detection
echo "Installing filetype detection..."
cp ftdetect.vim ~/.vim/ftdetect/loto.vim

echo "Installation complete!"
echo "Restart vim or run ':syntax on' to enable Loto syntax highlighting."