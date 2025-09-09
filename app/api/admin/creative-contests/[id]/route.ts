import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import CreativeContest from '@/models/CreativeContest';

export const dynamic = 'force-dynamic';

// GET - Get specific contest details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const contest = await CreativeContest.findById(params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('submissions.participantId', 'firstName lastName email')
      .lean();

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contest,
    });
  } catch (error) {
    console.error('Error fetching contest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest' },
      { status: 500 }
    );
  }
}

// PUT - Update contest
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    let updateData = await request.json();

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);

      if (end <= start) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    if (updateData.endDate && updateData.resultsDate) {
      const end = new Date(updateData.endDate);
      const results = new Date(updateData.resultsDate);

      if (results <= end) {
        return NextResponse.json(
          { error: 'Results date must be after end date' },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    // Check if contest exists
    const existingContest = await CreativeContest.findById(params.id);
    if (!existingContest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Check if contest can be edited (prevent editing active contests with submissions)
    if (
      (existingContest as any).status === 'active' &&
      (existingContest as any).stats.totalSubmissions > 0
    ) {
      // Only allow limited fields to be updated for active contests with submissions
      const allowedFields = [
        'description',
        'rules',
        'prizes',
        'showPrizes',
        'endDate',
        'resultsDate',
      ];
      const filteredData = Object.keys(updateData)
        .filter((key: string) => allowedFields.includes(key))
        .reduce((obj: any, key: string) => {
          obj[key] = updateData[key];
          return obj;
        }, {});
      updateData = filteredData;
    }

    // Prepare update data with proper date conversion
    const processedData = { ...updateData };
    if (processedData.startDate) {
      processedData.startDate = new Date(processedData.startDate);
    }
    if (processedData.endDate) {
      processedData.endDate = new Date(processedData.endDate);
    }
    if (processedData.resultsDate) {
      processedData.resultsDate = new Date(processedData.resultsDate);
    }

    const contest = await CreativeContest.findByIdAndUpdate(
      params.id,
      {
        ...processedData,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('createdBy', 'firstName lastName email');

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Contest updated successfully',
      contest,
    });
  } catch (error) {
    console.error('Error updating contest:', error);

    // Handle validation errors
    if (
      typeof error === 'object' &&
      error &&
      'name' in error &&
      (error as any).name === 'ValidationError'
    ) {
      const validationErrors = Object.values((error as any).errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: `Validation error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update contest' },
      { status: 500 }
    );
  }
}

// DELETE - Delete contest
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const contest = await CreativeContest.findById(params.id);
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Check if contest has submissions
    if ((contest as any).stats.totalSubmissions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete contest with existing submissions' },
        { status: 400 }
      );
    }

    // Only allow deletion of draft contests or contests without submissions
    if (
      (contest as any).status !== 'draft' &&
      (contest as any).stats.totalSubmissions > 0
    ) {
      return NextResponse.json(
        { error: 'Cannot delete active contest with submissions' },
        { status: 400 }
      );
    }

    await CreativeContest.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Contest deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contest:', error);
    return NextResponse.json(
      { error: 'Failed to delete contest' },
      { status: 500 }
    );
  }
}

// PATCH - Update contest status only
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { status, action } = await request.json();

    await connectToDatabase();

    const contest = await CreativeContest.findById(params.id);
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Handle different actions
    if (action === 'update_status') {
      const validStatuses = ['draft', 'active', 'ended', 'results_published'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      // Validate status transitions
      const currentStatus = (contest as any).status;
      const validTransitions: Record<string, string[]> = {
        draft: ['active'],
        active: ['ended'],
        ended: ['results_published'],
        results_published: [],
      };

      if (!validTransitions[currentStatus]?.includes(status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${currentStatus} to ${status}` },
          { status: 400 }
        );
      }

      (contest as any).status = status;
      await contest.save();

      return NextResponse.json({
        success: true,
        message: `Contest status updated to ${status}`,
        contest,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating contest status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
