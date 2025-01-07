import { importSheet } from 'jsr:@psych/sheet'
import ical from 'jsr:@sebbo2002/ical-generator'
import { parseArgs } from 'jsr:@std/cli/parse-args'

async function generateICS(csvFilePath: string, icsFilePath: string, calendarName: string) {
    const file = await Deno.readFile(csvFilePath)
    const csv = await importSheet(file, 'csv')

    console.log(csv)
    const calendar = ical({ name: calendarName })

    for await (const row of csv) {
        const title = row['Bezeichnung'] as string
        const dateString = row['Datum'] as string
        const [day, month, year] = dateString.split('.').map(Number)
        const startDate = new Date(year, month - 1, day)
        const endDate = startDate
        const description = row['Beschreibung'] as string

        try {
            calendar
                .createEvent({
                    start: new Date(startDate),
                    end: new Date(endDate),
                    summary: title,
                    description: description,
                })
                .createAlarm({ trigger: 60 * 60 * 6 })
        } catch (error) {
            const err = error as Error
            console.log(err.message, title, startDate)
        }
    }

    const icsData = calendar.toString()
    await Deno.writeTextFile(icsFilePath, icsData)
}

const args = parseArgs(Deno.args, {
    string: ['calendar'],
    alias: { c: 'calendar' },
    default: { calendar: 'Calendar' },
})

const csvFilePath = (args._[0] as string) || 'events.csv'
const csvFileName = csvFilePath.split('.').slice(0, -1).join('.')
const icsFilePath = `${csvFileName}.ics`
await generateICS(csvFilePath, icsFilePath, args.calendar)
