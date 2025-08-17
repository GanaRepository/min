// app/api/admin/cleanup-duplicates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    console.log(`🧹 [CLEANUP] Starting duplicate competition cleanup...`);

    // Find all competitions grouped by month/year
    const duplicates = await Competition.aggregate([
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 },
          docs: { $push: { id: "$_id", createdAt: "$createdAt", isActive: "$isActive", phase: "$phase" } }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    let totalDeactivated = 0;
    let totalDeleted = 0;
    const cleanupReport = [];

    for (const duplicate of duplicates) {
      const { month, year } = duplicate._id;
      const competitionDocs: { id: string, createdAt: string, isActive: boolean, phase: string }[] = duplicate.docs;
      
      console.log(`🔍 [CLEANUP] Found ${duplicate.count} competitions for ${month} ${year}`);
      
      // Sort by creation date (newest first)
      competitionDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const keepCompetition = competitionDocs[0]; // Keep the most recent one
      const removeCompetitions = competitionDocs.slice(1); // Remove all others
      
      console.log(`✅ [CLEANUP] Keeping competition: ${keepCompetition.id} (${month} ${year})`);
      
      for (const comp of removeCompetitions) {
        const competitionToRemove = await Competition.findById(comp.id);
        
        if (competitionToRemove) {
          // Check if this competition has any submissions
          const submissionCount = await StorySession.countDocuments({
            'competitionEntries.competitionId': comp.id
          });
          
          if (submissionCount > 0) {
            // If it has submissions, deactivate instead of delete
            competitionToRemove.isActive = false;
            competitionToRemove.phase = 'archived';
            await competitionToRemove.save();
            totalDeactivated++;
            console.log(`🗃️ [CLEANUP] Deactivated competition with submissions: ${comp.id}`);
            
            cleanupReport.push({
              action: 'deactivated',
              competitionId: comp.id,
              month,
              year,
              reason: `Had ${submissionCount} submissions`,
              submissionCount
            });
          } else {
            // If no submissions, safe to delete completely
            await Competition.findByIdAndDelete(comp.id);
            totalDeleted++;
            console.log(`🗑️ [CLEANUP] Deleted empty competition: ${comp.id}`);
            
            cleanupReport.push({
              action: 'deleted',
              competitionId: comp.id,
              month,
              year,
              reason: 'No submissions found',
              submissionCount: 0
            });
          }
        }
      }
    }

    // Final verification - ensure only one active competition exists
    const activeCompetitions = await Competition.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    if (activeCompetitions.length > 1) {
      console.log(`⚠️ [CLEANUP] Found ${activeCompetitions.length} active competitions, keeping only the most recent`);
      
      // Keep only the most recent active competition
      const keep = activeCompetitions[0];
      const deactivateList = activeCompetitions.slice(1);
      
      for (const comp of deactivateList) {
        comp.isActive = false;
        comp.phase = 'archived';
        await comp.save();
        totalDeactivated++;
        
        cleanupReport.push({
          action: 'deactivated',
          competitionId: comp._id,
          month: comp.month,
          year: comp.year,
          reason: 'Multiple active competitions found',
          submissionCount: 'unknown'
        });
      }
      
      console.log(`✅ [CLEANUP] Kept only one active competition: ${keep.month} ${keep.year}`);
    }

    console.log(`🧹 [CLEANUP] Cleanup completed: ${totalDeactivated} deactivated, ${totalDeleted} deleted`);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      summary: {
        duplicateGroups: duplicates.length,
        totalDeactivated,
        totalDeleted,
        totalProcessed: totalDeactivated + totalDeleted
      },
      report: cleanupReport,
      activeCompetitionsRemaining: 1
    });

  } catch (error) {
    console.error('❌ Error in cleanup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cleanup duplicate competitions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Just check for duplicates without cleaning
    const duplicates = await Competition.aggregate([
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 },
          docs: { 
            $push: { 
              id: "$_id", 
              createdAt: "$createdAt", 
              isActive: "$isActive", 
              phase: "$phase",
              totalSubmissions: "$totalSubmissions"
            } 
          }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    const activeCompetitions = await Competition.find({ isActive: true });

    return NextResponse.json({
      duplicatesFound: duplicates.length > 0,
      duplicateGroups: duplicates.map(dup => ({
        monthYear: `${dup._id.month} ${dup._id.year}`,
        count: dup.count,
        competitions: dup.docs
      })),
      activeCompetitions: activeCompetitions.length,
      needsCleanup: duplicates.length > 0 || activeCompetitions.length > 1
    });

  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}