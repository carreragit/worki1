@echo off
set FECHA=%date:~6,4%-%date:~3,2%-%date:~0,2%
set HORA=%time:~0,2%-%time:~3,2%
set CARPETA=backups\%FECHA%_%HORA%

mkdir %CARPETA%

echo Respaldando bases de datos...

mysqldump -u root worki_auth_db > %CARPETA%\worki_auth_db.sql
echo [OK] worki_auth_db

mysqldump -u root worki_user_db > %CARPETA%\worki_user_db.sql
echo [OK] worki_user_db

mysqldump -u root worki_interaction_db > %CARPETA%\worki_interaction_db.sql
echo [OK] worki_interaction_db

echo.
echo Respaldo completado en: %CARPETA%
pause
