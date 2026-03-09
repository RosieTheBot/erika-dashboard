import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

const SHEET_ID = '1L4w9Nu6OSuB2xI3u6g5-izJetCUKSLNkAv8_Xob7c_I'

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

export async function GET(request: Request) {
  try {
    const sheets = await getAuthenticatedSheets()

    // Get all values from Sheet1
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:F100'
    })

    const rows = response.data.values || []
    if (rows.length === 0) {
      return NextResponse.json({ tasks: [] })
    }

    // First row is headers: Category, Task, Status, Priority, Due Date, Notes
    const headers = rows[0]
    const tasks = rows.slice(1).map((row: string[], idx: number) => {
      return {
        id: `task_${idx}`,
        category: row[0] || '',
        task: row[1] || '',
        status: row[2] || 'To Do',
        priority: row[3] || 'Medium',
        dueDate: row[4] || '',
        notes: row[5] || ''
      }
    }).filter((task: any) => task.task) // Only include rows with a task title

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching Rosie Tasks:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
