@ECHO OFF
REM ----------------------------------------------------------------------------
REM Maven Wrapper simplifie pour Windows.
REM Telecharge automatiquement la version de Maven indiquee dans
REM .mvn/wrapper/maven-wrapper.properties (distributionUrl) au premier lancement,
REM puis delegue tous les arguments a "mvn". Evite d'avoir a installer Maven
REM manuellement sur la machine.
REM ----------------------------------------------------------------------------
SETLOCAL ENABLEDELAYEDEXPANSION

SET "PROJECT_DIR=%~dp0"
SET "WRAPPER_PROPERTIES=%PROJECT_DIR%.mvn\wrapper\maven-wrapper.properties"
SET "MAVEN_HOME_CACHE=%USERPROFILE%\.m2\wrapper\dists"

IF NOT EXIST "%WRAPPER_PROPERTIES%" (
    ECHO Fichier %WRAPPER_PROPERTIES% introuvable.
    EXIT /B 1
)

FOR /F "usebackq tokens=1,* delims==" %%A IN ("%WRAPPER_PROPERTIES%") DO (
    IF "%%A"=="distributionUrl" SET "DIST_URL=%%B"
)

IF NOT DEFINED DIST_URL (
    ECHO distributionUrl introuvable dans maven-wrapper.properties
    EXIT /B 1
)

REM Deduit un nom de dossier unique a partir du nom du zip (ex: apache-maven-3.9.9-bin)
FOR %%F IN ("%DIST_URL%") DO SET "ZIP_NAME=%%~nF"
SET "MAVEN_DIST_DIR=%MAVEN_HOME_CACHE%\%ZIP_NAME%"

IF NOT EXIST "%MAVEN_DIST_DIR%" (
    ECHO Telechargement de Maven ^(%ZIP_NAME%^)...
    IF NOT EXIST "%MAVEN_HOME_CACHE%" MKDIR "%MAVEN_HOME_CACHE%"
    powershell -NoProfile -Command "Invoke-WebRequest -Uri '%DIST_URL%' -OutFile '%MAVEN_HOME_CACHE%\%ZIP_NAME%.zip'"
    IF ERRORLEVEL 1 (
        ECHO Echec du telechargement de Maven.
        EXIT /B 1
    )
    powershell -NoProfile -Command "Expand-Archive -Path '%MAVEN_HOME_CACHE%\%ZIP_NAME%.zip' -DestinationPath '%MAVEN_DIST_DIR%' -Force"
    DEL "%MAVEN_HOME_CACHE%\%ZIP_NAME%.zip"
)

REM Le zip Maven contient un sous-dossier dont le nom ne correspond pas toujours
REM exactement au nom du zip (ex: "apache-maven-3.9.9" pour "...-bin.zip").
REM On recherche donc dynamiquement bin\mvn.cmd sous MAVEN_DIST_DIR.
SET "MAVEN_BIN="
FOR /F "delims=" %%P IN ('dir /S /B "%MAVEN_DIST_DIR%\mvn.cmd" 2^>NUL') DO SET "MAVEN_BIN=%%P"

IF NOT DEFINED MAVEN_BIN (
    ECHO Maven n'a pas pu etre installe dans %MAVEN_DIST_DIR%
    EXIT /B 1
)

CALL "%MAVEN_BIN%" %*
ENDLOCAL
