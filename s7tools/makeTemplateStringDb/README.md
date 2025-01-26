# makeTemplateStringDb - Read ASCII file, check for placeholder ${} and create a siemens datablock file

## Description

This programm reads a ascii file and checks for placeholders ${x}. Ten placeholders are supported ${0} to ${9}.
Same placeholders can be used multiple times in the file. The position of the placeholder is analyzed and written to a siemens datablock file. Also the template string is written to the datablock file as Siemens WSTRING. The datablock file can be imported into a siemens plc project and used withe a function block to replace the placeholders with the values of the variables.

This can be used for to create a zpl file for a label printer with dynamik variables.  
A valid ZPL file https://labelary.com/viewer.html  
For variable data insert a placeholder "${1}" in the zpl file. The placeholder will be replaced by the value of the variable.

## Command line

```bash
makeTemplateStringDb --minimize inputfile [datablockname]

    inputfile: The input file to read. Ascii file
    datablockname: Name of the datablock file. Default is the inputfile name.

    --minimize: Minimize the template string. Remove all line breaks.

```

## Version history

| Version | Description     |
| ------- | --------------- |
| 1.0.0   | Initial release |
