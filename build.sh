#!/usr/bin/env bash
set -o errexit

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Building backend..."
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python seed_data.py
