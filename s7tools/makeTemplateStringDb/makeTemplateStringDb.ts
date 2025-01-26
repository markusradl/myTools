import { parseArgs } from 'jsr:@std/cli/parse-args'
import { join, dirname, basename } from 'jsr:@std/path'

async function makeTemplateStringDb(
    inputFileName: string,
    dataBlockName: string = 'db',
    minimizeString: boolean = true
) {
    const content = await Deno.readTextFile(inputFileName)
    const normalizedContent = content.replace(/\r\n/g, '\n') // Normalize line endings to LF because Windows uses CRLF
    const newLineChar = minimizeString ? '' : '$N' // ($N is used for new line in Siemens strings and takes 2 chars)
    const searchString = normalizedContent.replace(/\n/g, newLineChar) // CR not needed
    const templateString = normalizedContent.replace(/\$/g, '$$$$').replace(/\n/g, newLineChar) // Siemens strings escapes $ with $$.

    // Search for occurrences of ${x} where x is 1 to 9 and write the indices into a new array
    const regex = /\$\{([0-9])\}/g
    const matches = [...searchString.matchAll(regex)]

    const placeHolders = matches.map((match) => {
        return {
            id: match[1],
            position: match.index,
        }
    })

    const placeHoldersString = placeHolders
        .map((placeHolder, index) => {
            return `
        PlaceHolders[${index}].Id := ${placeHolder.id};
        PlaceHolders[${index}].Position := ${placeHolder.position};`
        })
        .join('\n')

    const dbsource = `
    DATA_BLOCK "${dataBlockName}"
    { S7_Optimized_Access := 'TRUE' }
    VERSION : 0.1
    NON_RETAIN
    VAR 
    TemplateString : WString[${templateString.length}];
    PlaceHolders : Array[0..${placeHolders.length - 1}] of Struct
    Id : Int;           // Placeholder ID (0..9)
    Position : Int;     // Start position in template string
    END_STRUCT;
    END_VAR
    
    BEGIN
    TemplateString := WSTRING#'${templateString}';
    ${placeHoldersString}
    END_DATA_BLOCK`

    const outputFileName = join(dirname(inputFileName), dataBlockName + '.db')

    await Deno.writeTextFile(outputFileName, dbsource)
}

const args = parseArgs(Deno.args, {
    boolean: ['minimize', 'help'],
    alias: {
        minimize: 'm',
        help: 'h',
    },
})

if (args.help) {
    console.log(`
        Usage: makeTemplateStringDb [options] <inputFileName> [dataBlockName]

        Version: 1.0.0
        
        Description:
            This program reads a template string from the specified input file, processes it to get the position of placeholders
            and generates a Siemens S7 data block file (.db) with the processed template string and placeholder information.

        Options:
          --minimize    Minimize the template string (remove new lines)
          --help        Show this help message
        `)
    Deno.exit(0)
} else if (!args._[0]) {
    console.error('Error: No input file provided.')
    Deno.exit(1)
}

const inputFileName = args._[0] as string
const datablockName =
    (args._[1] as string) || basename(inputFileName).split('.').slice(0, -1).join('.')
const minimizeString = Boolean(args.minimize) || false

await makeTemplateStringDb(inputFileName, datablockName, minimizeString)
