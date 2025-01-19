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

export async function PATCH(request: NextRequest, { params }: RouteMeta) {
  return asAreaAssigneeAuthorized(
    {
      orgId: params.orgId,
      request: request,
    },
    async ({ orgId }) => {
      await mongoose.connect(process.env.MONGODB_URL || '');

      const payload = await request.json();

      const model = await LocationModel.findOneAndUpdate(
        { _id: params.locationId, orgId },
        {
          $set: {
            'households.$[elem].floor': payload.floor,
            'households.$[elem].title': payload.title,
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
