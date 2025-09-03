@echo off
setlocal

rem --- Если есть Windows Terminal, откроем всё во вкладках ---
where wt >nul 2>&1
if %ERRORLEVEL%==0 (
  wt new-tab --title "frontend" -d "D:\5. Programming\2. Projects\OverCreate\frontend" cmd /k "npm run dev" ;^
     new-tab --title "admin"    -d "D:\5. Programming\2. Projects\OverCreate\admin"    cmd /k "npm run dev" ;^
     new-tab --title "backend"  -d "D:\5. Programming\2. Projects\OverCreate\backend"  cmd ;^
     new-tab --title "root"     -d "D:\5. Programming\2. Projects\OverCreate"          cmd
  exit /b
)


