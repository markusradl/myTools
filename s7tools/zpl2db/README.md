# zpl2db - Convert zpl File to siemens Datablock File

## Description

This script converts a zpl file to a siemens datablock file. The zpl file is a text file with a specific format. The datablock file is a source file aof a datablock in a siemens plc. The datablock file can be imported into a siemens plc project.  
A valid ZPL file https://labelary.com/viewer.html  
For variable data insert a placeholder "${1}" in the zpl file. The placeholder will be replaced by the value of the variable.
Variable 1 to 9 are supported.
