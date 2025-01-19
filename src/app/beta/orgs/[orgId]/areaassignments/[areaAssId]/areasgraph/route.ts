import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { AreaModel } from 'features/areas/models';
import {
  AreaAssignmentModel,
  LocationModel,
} from 'features/areaAssignments/models';
import {
  AreaCardData,
  AreaGraphData,
  Household,
  Visit,
  ZetkinAreaAssignmentSession,
  ZetkinLocation,
} from 'features/areaAssignments/types';
import getAreaData from 'features/areaAssignments/utils/getAreaData';
import isPointInsidePolygon from 'features/canvass/utils/isPointInsidePolygon';
import asOrgAuthorized from 'utils/api/asOrgAuthorized';
import { ZetkinPerson } from 'utils/types/zetkin';
import { ZetkinArea } from 'features/areas/types';

type RouteMeta = {
  params: {
    areaAssId: string;
    orgId: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteMeta) {
  return asOrgAuthorized(
    {
      orgId: params.orgId,
      request: request,
      roles: ['admin', 'organizer'],
    },
    async ({ apiClient, orgId }) => {
      await mongoose.connect(process.env.MONGODB_URL || '');

      const assignmentModel = await AreaAssignmentModel.findOne({
        _id: params.areaAssId,
      }).lean();

      if (!assignmentModel) {
        return new NextResponse(null, { status: 404 });
      }

      const sessions: ZetkinAreaAssignmentSession[] = [];

      for await (const sessionData of assignmentModel.sessions) {
        const person = await apiClient.get<ZetkinPerson>(
          `/api/orgs/${orgId}/people/${sessionData.personId}`
        );
        const areaModel = await AreaModel.findOne({
          _id: sessionData.areaId,
        }).lean();

        if (areaModel && person) {
          sessions.push({
            area: {
              description: areaModel.description,
              id: areaModel._id.toString(),
              organization: { id: orgId },
              points: areaModel.points,
              tags: [],
              title: areaModel.title,
            },
            assignee: person,
            assignment: {
              campaign: { id: assignmentModel.campId },
              end_date: assignmentModel.end_date,
              id: assignmentModel._id.toString(),
              instructions: assignmentModel.instructions,
              metrics: assignmentModel.metrics.map((m) => ({
                definesDone: m.definesDone,
                description: m.description,
                id: m._id,
                kind: m.kind,
                question: m.question,
              })),
              organization: { id: assignmentModel.orgId },
              reporting_level: assignmentModel.reporting_level || 'household',
              start_date: assignmentModel.start_date,
              title: assignmentModel.title,
            },
          });
        }
      }

      const areas = sessions.map((session) => session.area);
      const uniqueAreas = [
        ...new Map(areas.map((area) => [area.id, area])).values(),
      ];

      const allLocationModels = await LocationModel.find({ orgId }).lean();
      const allLocations: ZetkinLocation[] = allLocationModels.map((model) => ({
        description: model.description,
        households: model.households,
        id: model._id.toString(),
        orgId: orgId,
        position: model.position,
        title: model.title,
      }));

      type LocationWithAreaId = ZetkinLocation & { areaId: ZetkinArea['id'] };

      //Find locations in the given areas
      const locationsInAreas: LocationWithAreaId[] = [];
      uniqueAreas.forEach((area) => {
        allLocations.forEach((location) => {
          const locationIsInArea = isPointInsidePolygon(
            { lat: location.position.lat, lng: location.position.lng },
            area.points.map((point) => ({ lat: point[0], lng: point[1] }))
          );

          if (locationIsInArea) {
            locationsInAreas.push({ ...location, areaId: area.id });
          }
        });
      });

      const metricThatDefinesDone = assignmentModel.metrics
        .find((metric) => metric.definesDone)
        ?._id.toString();

      const filteredVisitsInAllAreas: Visit[] = [];
      let firstVisit: Date = new Date();
      let lastVisit: Date = new Date();

      allLocations.forEach((location) => {
        const locationVisits = location.households
          .flatMap((household) => household.visits)
          .filter((visit) => visit.areaAssId === params.areaAssId);

        filteredVisitsInAllAreas.push(...locationVisits);
      });

      if (filteredVisitsInAllAreas.length > 0) {
        // Sort filtered visits by timestamp
        const sortedVisits = filteredVisitsInAllAreas.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        firstVisit = new Date(sortedVisits[0].timestamp);
        lastVisit = new Date(sortedVisits[sortedVisits.length - 1].timestamp);
      }

      const areaData: Record<
        string,
        { area: { id: string; title: string | null }; data: AreaGraphData[] }
      > = {};

      const areasDataList: AreaCardData[] = [];

      const addedAreaIds = new Set<string>();
      const householdsOutsideAreasList: Household[] = [];

      uniqueAreas.forEach((area) => {
        if (!areaData[area.id]) {
          areaData[area.id] = {
            area: { id: area.id, title: area.title },
            data: [],
          };
        }

        const areaVisitsData: AreaGraphData[] = [];
        const householdList: Household[] = [];

        allLocations.forEach((location) => {
          const locationIsInArea = isPointInsidePolygon(
            { lat: location.position.lat, lng: location.position.lng },
            area.points.map((point) => ({ lat: point[0], lng: point[1] }))
          );

          if (locationIsInArea) {
            const filteredHouseholds = location.households.filter(
              (household) => {
                return household.visits.filter(
                  (visit) => visit.areaAssId === params.areaAssId
                );
              }
            );
            householdList.push(...filteredHouseholds);
          }
        });

        const visitsData = getAreaData(
          lastVisit,
          householdList,
          firstVisit,
          metricThatDefinesDone || ''
        );
        areaVisitsData.push(...visitsData);

        areaData[area.id].data.push(...areaVisitsData);

        if (!addedAreaIds.has(area.id)) {
          areasDataList.push(areaData[area.id]);
          addedAreaIds.add(area.id);
        }
      });

      //Visits outside assigned areas logic
      const idsOfLocationsInAreas = new Set(
        locationsInAreas.map((location) => location.id)
      );
      const locationsOutsideAreas = allLocations.filter(
        (location) => !idsOfLocationsInAreas.has(location.id)
      );

      locationsOutsideAreas.forEach((location) => {
        location.households.forEach((household) => {
          household.visits.forEach((visit) => {
            if (visit.areaAssId == params.areaAssId) {
              householdsOutsideAreasList.push(household);
            }
          });
        });
      });

      if (householdsOutsideAreasList.length > 0) {
        const visitsData = getAreaData(
          lastVisit,
          householdsOutsideAreasList,
          firstVisit,
          metricThatDefinesDone || ''
        );

        if (!areaData['noArea']) {
          const noAreaData = (areaData['noArea'] = {
            area: { id: 'noArea', title: 'noArea' },
            data: visitsData,
          });

          areasDataList.push(noAreaData);
        }
      }

      const areasDataArray: AreaCardData[] = Object.values(areasDataList);

      return NextResponse.json({
        data: areasDataArray,
      });
    }
  );
}
