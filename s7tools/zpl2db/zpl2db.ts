import { parseArgs } from 'jsr:@std/cli/parse-args'

async function readAndConvertZPL(filePath: string) {
    const content = await Deno.readTextFile(filePath)
    const test = content.replace(/\$/g, '$$$$').replace(/\n/g, '$N')
    console.log(test)
    const dbsource = `
        DATA_BLOCK "Label"
        { S7_Optimized_Access := 'TRUE' }
        VERSION : 0.1
        NON_RETAIN
            VAR 
                data : WString;
            END_VAR

        BEGIN
            data := WSTRING#'${test}';
        END_DATA_BLOCK
        `
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
