import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

const TEAM_DRIVE_ID = '0AEyW9Bf-LAibUk9PVA'

async function getAuthenticatedDrive() {
  const credentialsPath = path.join(process.env.HOME || '/root', '.credentials', 'scraper-credentials.json')
  
  if (!fs.existsSync(credentialsPath)) {
    throw new Error('Credentials file not found')
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  })

  return google.drive({ version: 'v3', auth })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const address = searchParams.get('address')

    if (!name && !address) {
      return NextResponse.json(
        { error: 'Either name or address parameter is required' },
        { status: 400 }
      )
    }

    const drive = await getAuthenticatedDrive()

    // Build search query
    let searchQuery = `trashed=false and (${
      name ? `name contains '${name.replace(/'/g, "\\'")}'` : ''
    }${name && address ? ' or ' : ''}${
      address ? `name contains '${address.replace(/'/g, "\\'")}'` : ''
    })`

    // Search in Team Drive - search within the team drive folder
    const teamDriveQuery = `'${TEAM_DRIVE_ID}' in parents and ${searchQuery}`
    
    const response = await drive.files.list({
      pageSize: 20,
      q: teamDriveQuery,
      fields: 'files(id, name, mimeType, modifiedTime, size)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      corpora: 'allDrives'
    })

    const documents = (response.data.files || []).map((file: any) => {
      let type = 'other'
      if (file.mimeType.includes('spreadsheet')) {
        type = 'spreadsheet'
      } else if (file.mimeType.includes('document')) {
        type = 'document'
      }

      return {
        id: file.id,
        name: file.name,
        type,
        size: file.size,
        modified: file.modifiedTime
          ? new Date(file.modifiedTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: new Date(file.modifiedTime).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
            })
          : undefined,
      }
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Google Drive search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search documents' },
      { status: 500 }
    )
  }
}
