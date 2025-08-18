import { createClient } from '@/lib/supabase'
import { ExcelImporter } from '@/lib/excel/importer'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user has admin permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Invalid file type. Only Excel files (.xlsx, .xls) are allowed' }, { status: 400 })
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const tempFilePath = join(process.cwd(), 'temp', `import_${Date.now()}_${file.name}`)
    await writeFile(tempFilePath, buffer)

    try {
      // Import Excel data
      const importer = new ExcelImporter()
      const results = await importer.importFromFile(tempFilePath)
      
      // Import to database
      const importSummary = await importer.importToDatabase(results)
      
      // Clean up temporary file
      await unlink(tempFilePath)
      
      return NextResponse.json({
        success: true,
        summary: importSummary,
        data: {
          charactersFound: results.characters?.length || 0,
          schedulesFound: results.schedules?.length || 0,
          raidsFound: results.raids?.length || 0,
          economicsFound: results.economics?.length || 0,
          rewardsFound: results.rewards?.length || 0,
          achievementsFound: results.achievements?.length || 0,
          gemsFound: results.gems?.length || 0,
          guidesFound: results.guides?.length || 0,
          missionsFound: results.missions?.length || 0,
        }
      })
    } catch (importError) {
      // Clean up temporary file on error
      try {
        await unlink(tempFilePath)
      } catch (unlinkError) {
        console.error('Failed to clean up temp file:', unlinkError)
      }
      
      throw importError
    }
  } catch (error) {
    console.error('Excel import error:', error)
    return NextResponse.json({ 
      error: 'Import failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}