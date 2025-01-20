//import { parseArgs } from 'jsr:@std/cli/parse-args'

async function readAndConvertZPL(filePath: string) {
    const content = await Deno.readTextFile(filePath)
    const flattenedString = content.replace(/\n/g, '$N') // Siemens strings uses two chars for newline (String Length!!)
    const templateString = flattenedString.replace(/\$/g, '$$$$') // Siemens strings escapes $ with $$

    // Search for occurrences of ${x} where x is 1 to 9 and write the indices into a new array
    const regex = /\$\{([0-9])\}/g
    const matches = [...flattenedString.matchAll(regex)]

    const placeHolders = matches.map((match) => {
        return {
            id: match[1],
            position: match.index,
        }
    })

    const placeHoldersString = placeHolders
        .map((ph, index) => {
            return `
            PlaceHolders[${index}].Id := ${ph.id};
            PlaceHolders[${index}].Position := ${ph.position};`
        })
        .join('\n')

    const dbsource = `
        DATA_BLOCK "LabelData"
        { S7_Optimized_Access := 'TRUE' }
        VERSION : 0.1
        NON_RETAIN
        VAR 
            TemplateString : WString;
            PlaceHolders : Array[0..${placeHolders.length - 1}] of Struct
                Id : Int;   // Placeholder ID (0..9)
                Position : Int;   // Startposition in template string
            END_STRUCT;
        END_VAR

        BEGIN
            TemplateString := WSTRING#'${templateString}';
            ${placeHoldersString}
        END_DATA_BLOCK`

    await Deno.writeTextFile('label.db', dbsource)
}

await readAndConvertZPL('label.zpl')

// const icsData = calendar.toString()
// await Deno.writeTextFile(icsFilePath, icsData)

// const args = parseArgs(Deno.args, {
//     string: ['calendar', 'alarmBeforeHours'],
//     alias: { c: 'calendar' },
//     default: { calendar: 'Calendar', alarmBeforeHours: '1' },
// })

// const csvFilePath = (args._[0] as string) || 'events.csv'
// const csvFileName = csvFilePath.split('.').slice(0, -1).join('.')
// const icsFilePath = `${csvFileName}.ics`
// const alarmBeforeHours = Number(args.alarmBeforeHours)

// const zplFilePath = 'label.zpl'
// const convertedZPL = await readAndConvertZPL(zplFilePath)
// console.log(convertedZPL)

// // await generateICS(csvFilePath, icsFilePath, args.calendar, alarmBeforeHours)
