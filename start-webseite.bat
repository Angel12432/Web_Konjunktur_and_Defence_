@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Abhaengigkeiten fehlen. Installiere...
  npm install
)
echo Starte Webseite...
npm start
