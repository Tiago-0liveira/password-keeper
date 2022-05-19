@echo off
wt -d %~dp0 cmd /k yarn dev:electron; sp -V -d %~dp0 cmd /k yarn dev:react; sp -H -d %~dp0 cmd ; mf left; sp -H -d %~dp0 cmd 
exit