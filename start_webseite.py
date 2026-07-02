import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NODE_MODULES = ROOT / 'node_modules'

print('Projektverzeichnis:', ROOT)

npm_command = 'npm.cmd' if Path('C:/Windows').exists() else 'npm'

if not NODE_MODULES.exists():
    print('node_modules fehlt. Installiere Abhängigkeiten...')
    result = subprocess.run([npm_command, 'install'], cwd=ROOT)
    if result.returncode != 0:
        raise SystemExit('npm install fehlgeschlagen.')

print('Starte Webseite...')
result = subprocess.run([npm_command, 'start'], cwd=ROOT)
if result.returncode != 0:
    raise SystemExit('npm start fehlgeschlagen.')
