CD "C:\fermat-org\clair\images\tiles\icons\group\svg"
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\high\%%~nI.png --export-dpi=720 %%I
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\medium\%%~nI.png --export-dpi=90 %%I
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\small\%%~nI.png --export-dpi=45 %%I
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\mini\%%~nI.png --export-dpi=22 %%I

CD "C:\fermat-org\clair\images\tiles\icons\type\svg"
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\high\%%~nI.png --export-dpi=720 %%I
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\medium\%%~nI.png --export-dpi=90 %%I
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\small\%%~nI.png --export-dpi=45 %%I
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\mini\%%~nI.png --export-dpi=22 %%I

CD "C:\fermat-org\clair\images\headers\svg"
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\high\%%~nI.png --export-dpi=360 %%I
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\medium\%%~nI.png --export-dpi=90 %%I
FOR /f %%I IN ('dir /b') DO "C:\Program Files\Inkscape\inkscape.exe" --export-png=..\small\%%~nI.png --export-dpi=45 %%I