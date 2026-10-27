@echo off
setlocal

echo ==========================================
echo Installing Playwright AI Dependencies
echo ==========================================

echo [1/8] Installing dotenv...
call npm install dotenv
if errorlevel 1 goto error

echo [2/8] Installing Faker...
call npm install @faker-js/faker
if errorlevel 1 goto error

echo [3/8] Installing Luxon...
call npm install luxon
if errorlevel 1 goto error

echo [4/8] Installing API and Excel packages...
call npm install ajv csv-parse xlsx
if errorlevel 1 goto error

echo [5/8] Installing Accessibility package...
call npm install @axe-core/playwright
if errorlevel 1 goto error

echo [6/8] Installing Allure reporter...
call npm install allure-playwright
if errorlevel 1 goto error

echo [7/8] Installing TypeScript types...
call npm install -D @types/node
if errorlevel 1 goto error

echo [8/8] Installing MySQL package...
call npm install mysql2
if errorlevel 1 goto error

echo Installing Playwright browsers...
call npx playwright install
if errorlevel 1 goto error

echo.
echo ==========================================
echo ALL INSTALLATIONS COMPLETED SUCCESSFULLY!
echo ==========================================
pause
exit /b 0

:error
echo.
echo INSTALLATION FAILED. Check the error above.
pause
exit /b 1