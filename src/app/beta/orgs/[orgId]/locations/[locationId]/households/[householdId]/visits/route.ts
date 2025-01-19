import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { LocationModel } from 'features/areaAssignments/models';
import asAreaAssigneeAuthorized from 'features/canvass/utils/asAreaAssigneeAuthorized';

type RouteMeta = {
  params: {
    householdId: string;
    locationId: string;
    orgId: string;
  };
};

export async function POST(request: NextRequest, { params }: RouteMeta) {
  return asAreaAssigneeAuthorized(
    {
      orgId: params.orgId,
      request: request,
    },
    async ({ orgId, personId }) => {
      await mongoose.connect(process.env.MONGODB_URL || '');

      const payload = await request.json();

      const model = await LocationModel.findOneAndUpdate(
        { _id: params.locationId, orgId },
        {
          $push: {
            'households.$[elem].visits': {
              areaAssId: payload.areaAssId,
              doorWasOpened: payload.doorWasOpened,
              id: new mongoose.Types.ObjectId().toString(),
              missionAccomplished: payload.missionAccomplished,
              noteToOfficial: payload.noteToOfficial,
              personId: personId,
              responses: payload.responses || [],
              timestamp: payload.timestamp,
            },
          },
        },
        {
          arrayFilters: [{ 'elem.id': { $eq: params.householdId } }],
          new: true,
        }
      );

      if (!model) {
        return new NextResponse(null, { status: 404 });
      }

      await model.save();

      return NextResponse.json({
        data: {
          description: model.description,
          households: model.households,
          id: model._id.toString(),
          orgId: orgId,
          position: model.position,
          title: model.title,
        },
      });
    }
  );
}
