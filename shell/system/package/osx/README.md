# create-dmg

A shell script to build fancy Apple Disk Images (DMGs).  

This is a slightly modified version of [Andrey Tarantsov](https://github.com/andreyvit/)'s [yoursway-create-dmg](https://github.com/andreyvit/yoursway-create-dmg) script.


## USAGE
  
```bash
create-dmg [options...] [output_name.dmg] [source_folder]  
```

All contents of source_folder will be copied into the disk image.  
  
### Options
  
* **--volname [name]:** set volume name (displayed in the Finder sidebar and window title)  
* **--volicon [icon.icns]:** set volume icon    
* **--background [pic.png]:** set folder background image (provide png, gif, jpg)    
* **--window-pos [x y]:** set position the folder window    
* **--window-size [width height]:** set size of the folder window    
* **--icon-size [icon size]:** set window icons size (up to 128)    
* **--icon [file name] [x y]:** set position of the file's icon    
* **--hide-extension [file name]:** hide the extension of file    
* **--custom-icon [file name]/[custom icon]/[sample file] [x y]:** set position and custom icon    
* **--app-drop-link [x y]:** make a drop link to Applications, at location x, y    
* **--eula [eula file]:** attach a license file to the dmg    
* **--no-internet-enable:** disable automatic mount&copy    
* **--version:** show tool version number    
* **-h, --help:** display the help  

  
### Example
  
```bash
#!/bin/sh  
test -f Application-Installer.dmg && rm Application-Installer.dmg  
create-dmg \  
  --volname "Application Installer" \  
  --volicon "application_icon.icns" \  
  --background "installer_background.png" \  
  --window-pos 200 120 \  
  --window-size 800 400 \  
  --icon-size 100 \  
  --icon Application.app 200 190 \  
  --hide-extension Application.app \  
  --app-drop-link 600 185 \  
  Application-Installer.dmg \  
  source_folder/  
```

## ADDITIONAL RESOURCES

* https://stackoverflow.com/questions/96882/how-do-i-create-a-nice-looking-dmg-for-mac-os-x-using-command-line-tools
* https://stackoverflow.com/questions/11199926/create-dmg-with-retina-background-support


## CHANGES

The following changes have been made from the [original version](https://github.com/andreyvit/yoursway-create-dmg)

* Added `README.md` file [based on work by Seth P](https://github.com/andreyvit/yoursway-create-dmg/pull/24).
* Added license information based on [the original author's statement](https://github.com/andreyvit/yoursway-create-dmg/issues/10).
* Removed YourSway builder script and unnecessary .gitignore file.
* [Fixed multiple --hide-extension problem](https://github.com/andreyvit/yoursway-create-dmg/issues/22).
* Fix for icon size being ignored under Mac OS X 10.9 Mavericks.


## LICENSE

create-dmg is Copyright (C) 2008, 2011 - 2013 Andrey Tarantsov, with modifications Copyright (C) 2014 Regents of The University of Michigan.

create-dmg is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

create-dmg is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with flux-utils. If not, see http://www.gnu.org/licenses/

