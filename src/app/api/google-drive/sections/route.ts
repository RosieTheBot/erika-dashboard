import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

async function getAuthenticatedSheets() {
  const credentialsPath = path.join(process.env.HOME || '/root', '.credentials', 'scraper-credentials.json')
  
  if (!fs.existsSync(credentialsPath)) {
    throw new Error('Credentials file not found')
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })

  return google.sheets({ version: 'v4', auth })
}

interface SheetSection {
  title: string
  data: Array<{ [key: string]: any }>
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId parameter is required' },
        { status: 400 }
      )
    }

    const sheets = await getAuthenticatedSheets()

    // Get spreadsheet metadata to get sheet titles
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: fileId,
      fields: 'sheets(properties(title,sheetId))',
    })

    if (!spreadsheet.data.sheets) {
      return NextResponse.json({ sections: [] })
    }

    const sections: SheetSection[] = []

    // Fetch data from each sheet
    for (const sheet of spreadsheet.data.sheets) {
      const title = sheet.properties?.title || 'Sheet'
      const sheetId = sheet.properties?.sheetId

      try {
        // Get all values from this sheet
        const sheetData = await sheets.spreadsheets.values.get({
          spreadsheetId: fileId,
          range: `'${title}'!A1:Z1000`, // Reasonable limit to avoid huge downloads
        })

        const rows = sheetData.data.values || []
        if (rows.length === 0) continue

        // First row is headers
        const headers = rows[0]
        const data = rows.slice(1).map((row: string[]) => {
          const obj: { [key: string]: any } = {}
          headers.forEach((header: string, idx: number) => {
            if (row[idx]) {
              obj[header] = row[idx]
            }
          })
          return obj
        })

        // Filter out completely empty rows
        const filteredData = data.filter((row: any) =>
          Object.values(row).some((val: any) => val)
        )

        if (filteredData.length > 0) {
          sections.push({
            title,
            data: filteredData,
          })
        }
      } catch (err) {
        console.error(`Error fetching sheet ${title}:`, err)
        // Continue to next sheet on error
      }
    }

    return NextResponse.json({ sections })
  } catch (error) {
    console.error('Google Sheets sections error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sections' },
      { status: 500 }
    )
  }
}
