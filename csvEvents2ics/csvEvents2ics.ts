import { importSheet } from 'jsr:@psych/sheet'
import ical from 'jsr:@sebbo2002/ical-generator'
import { parseArgs } from 'jsr:@std/cli/parse-args'

async function generateICS(
    csvFilePath: string,
    icsFilePath: string,
    calendarName: string,
    alarmBeforeHours: number
) {
    const file = await Deno.readFile(csvFilePath)
    const csv = await importSheet(file, 'csv')

    console.log(csv)
    const calendar = ical({ name: calendarName })

    for await (const row of csv) {
        const title = row['Bezeichnung'] as string
        const dateString = row['Datum'] as string
        const startTimeFraction = (row['StartZeit'] as number) || 0
        const endTimeFraction = (row['EndZeit'] as number) || 0
        const [day, month, year] = dateString.split('.').map(Number)
        const startDate = new Date(year, month - 1, day)
        const endDate = new Date(year, month - 1, day)

        const startHours = Math.floor(24 * startTimeFraction)
        const startMinutes = Math.round((24 * startTimeFraction - startHours) * 60)
        startDate.setHours(startHours, startMinutes)

        const endHours = Math.floor(24 * endTimeFraction)
        const endMinutes = Math.round((24 * endTimeFraction - endHours) * 60)
        endDate.setHours(endHours, endMinutes)

        const description = row['Beschreibung'] as string

        try {
            calendar
                .createEvent({
                    start: new Date(startDate),
                    end: new Date(endDate),
                    summary: title,
                    description: description,
                })
                .createAlarm({ trigger: 60 * 60 * alarmBeforeHours })
        } catch (error) {
            const err = error as Error
            console.log(err.message, title, startDate)
        }
    }

    const icsData = calendar.toString()
    await Deno.writeTextFile(icsFilePath, icsData)
}

const args = parseArgs(Deno.args, {
    string: ['calendar', 'alarmBeforeHours'],
    alias: { c: 'calendar' },
    default: { calendar: 'Calendar', alarmBeforeHours: '1' },
})

const csvFilePath = (args._[0] as string) || 'events.csv'
const csvFileName = csvFilePath.split('.').slice(0, -1).join('.')
const icsFilePath = `${csvFileName}.ics`
const alarmBeforeHours = Number(args.alarmBeforeHours)
await generateICS(csvFilePath, icsFilePath, args.calendar, alarmBeforeHours)
