import { walk } from 'jsr:@std/fs'
import { parse } from 'jsr:@libs/xml'

// Function to convert XML to JSON and return it
async function xmlToJson(filePath: string) {
    const xmlContent = await Deno.readTextFile(filePath)
    const jsonObj = parse(xmlContent)
    // console.log(JSON.stringify(jsonObj, null, 2)) // Log the JSON content
    return jsonObj
}

// Function to search for the key "snapshot" in the JSON and convert to CSV
async function searchSnapshot(jsonObj: any, filePath: string, isFirstFile: boolean) {
    const snapshotValues =
        jsonObj?.Document?.['SW.Blocks.InterfaceSnapshot']?.AttributeList?.Snapshot?.SnapshotValues
            ?.Value
    console.log('SnapshotValues:', snapshotValues)
    if (snapshotValues) {
        const csvRows = isFirstFile ? [['DB', 'Variable', 'Wert', 'Datentyp']] : []
        const s = Array.isArray(snapshotValues) ? snapshotValues : [snapshotValues]
        for (const value of s) {
            if (
                value['#text'] &&
                (!filePath.toLowerCase().includes('.idb') ||
                    value['@Path'].toLowerCase().includes('.prm'))
            ) {
                csvRows.push([
                    filePath.split('/').slice(-1).join('').replace('Snapshot.xml', ''),
                    value['@Path'],
                    value['#text'],
                    value['@Type'],
                ])
            }
        }
        const csvContent = csvRows.map((row) => row.join(';')).join('\n') + '\n'
        console.log(filePath, 'CSV Content:\n', csvContent)
        await Deno.writeTextFile('parameters.csv', csvContent, { append: true })
    } else {
        console.log('SnapshotValues key not found')
    }
}

// Function to search for files and convert them
async function searchAndConvert(folderPath: string) {
    let isFirstFile = true
    // The regex patterns used here are:
    // /.*\.idb.*/i - This matches any filename that contains ".idb" (case insensitive)
    // /.*\.prm.*/i - This matches any filename that contains ".prm" (case insensitive)
    for await (const entry of walk(folderPath, { match: [/.*\.idb.*/i, /.*\.prm.*/i] })) {
        if (entry.isFile) {
            const jsonObj = await xmlToJson(entry.path)
            await searchSnapshot(jsonObj, entry.path, isFirstFile)
            isFirstFile = false
        }
    }
}

// Start the process
const folderPath = './data'
await searchAndConvert(folderPath)
