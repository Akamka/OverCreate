@echo off
setlocal EnableExtensions

rem === ПУТИ ПРОЕКТОВ ===
set "FRONT_DIR=D:\5. Programming\2. Projects\OverCreate\frontend"
set "ADMIN_DIR=D:\5. Programming\2. Projects\OverCreate\admin"
set "BACK_DIR=D:\5. Programming\2. Projects\OverCreate\backend"
set "ROOT_DIR=D:\5. Programming\2. Projects\OverCreate"

echo [INFO] Старт...

rem === 1) Запуск Docker Desktop (только GUI) ===
echo [INFO] Проверяю Docker Desktop...
set "DOCKER_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if not exist "%DOCKER_EXE%" set "DOCKER_EXE=%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe"

tasklist /fi "imagename eq Docker Desktop.exe" | find /i "Docker Desktop.exe" >nul
if errorlevel 1 (
  if exist "%DOCKER_EXE%" (
    start "" "%DOCKER_EXE%"
    echo [OK] Docker Desktop запущен.
  ) else (
    echo [WARN] Docker Desktop.exe не найден. Запустите вручную.
  )
) else (
  echo [INFO] Docker Desktop уже работает.
)

rem === 2) Терминалы ===
where wt >nul 2>&1
if %ERRORLEVEL%==0 (
  echo [INFO] Открываю вкладки в Windows Terminal...
  start "" wt -w 0 new-tab --title "frontend" -d "%FRONT_DIR%" cmd /k "npm run dev"
  timeout /t 1 >nul
  start "" wt -w 0 new-tab --title "admin"    -d "%ADMIN_DIR%" cmd /k "npm run dev"
  timeout /t 1 >nul
  start "" wt -w 0 new-tab --title "backend"  -d "%BACK_DIR%"  cmd
  timeout /t 1 >nul
  start "" wt -w 0 new-tab --title "root"     -d "%ROOT_DIR%"  cmd
) else (
  echo [INFO] Windows Terminal не найден. Открываю отдельные CMD окна...
  pushd "%FRONT_DIR%"  && start "frontend" cmd /k "npm run dev" && popd & timeout /t 1 >nul
  pushd "%ADMIN_DIR%"  && start "admin"    cmd /k "npm run dev" && popd & timeout /t 1 >nul
  pushd "%BACK_DIR%"   && start "backend"  cmd                   && popd & timeout /t 1 >nul
  pushd "%ROOT_DIR%"   && start "root"     cmd                   && popd
)

rem === 3) Локальные адреса ===
start "" http://localhost:3000/
start "" http://localhost:5173/
start "" http://localhost:8080/

rem === 4) VS Code ===
echo [INFO] Открываю VS Code...
where code >nul 2>&1 && ( start "" code "%ROOT_DIR%" ) || (
  set "VSCODE_EXE=%LocalAppData%\Programs\Microsoft VS Code\Code.exe"
  if exist "%VSCODE_EXE%" (
    start "" "%VSCODE_EXE%" "%ROOT_DIR%"
  ) else (
    echo [WARN] VS Code не найден в PATH и по стандартному пути.
  )
)

echo [DONE] Готово!
exit /b
