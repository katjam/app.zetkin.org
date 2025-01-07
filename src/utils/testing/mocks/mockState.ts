import { RootState } from 'core/store';
import { remoteItem, remoteList } from 'utils/storeUtils';

export default function mockState(overrides?: RootState) {
  const emptyState: RootState = {
    areaAssignments: {
      areaAssignmentList: remoteList(),
      areaGraphByAssignmentId: {},
      areaStatsByAssignmentId: {},
      locationList: remoteList(),
      sessionsByAssignmentId: {},
      statsByAreaAssId: {},
    },
    areas: {
      areaList: remoteList(),
      tagsByAreaId: {},
    },
    breadcrumbs: {
      crumbsByPath: {},
    },
    callAssignments: {
      assignmentList: remoteList(),
      callAssignmentIdsByCampaignId: {},
      callList: remoteList(),
      callersById: {},
      statsById: {},
      userAssignmentList: remoteList(),
    },
    campaigns: {
      campaignList: remoteList(),
      campaignsByOrgId: {},
      recentlyCreatedCampaign: null,
    },
    canvass: {
      myAssignmentsWithAreasList: remoteList(),
      visitsByAssignmentId: {},
    },
    duplicates: {
      potentialDuplicatesList: remoteList(),
    },
    emails: {
      configList: remoteList(),
      emailList: remoteList(),
      insightsByEmailId: {},
      linksByEmailId: {},
      statsById: {},
      themeList: remoteList(),
    },
    events: {
      allEventsList: remoteList(),
      eventList: remoteList(),
      eventsByCampaignId: {},
      eventsByDate: {},
      filters: {
        selectedActions: [],
        selectedStates: [],
        selectedTypes: [],
        text: '',
      },
      locationList: remoteList(),
      participantsByEventId: {},
      pendingParticipantOps: [],
      remindingByEventId: {},
      respondentsByEventId: {},
      selectedEventIds: [],
      statsByEventId: {},
      typeList: remoteList(),
      userEventList: remoteList(),
    },
    files: {
      fileList: remoteList(),
    },
    import: {
      importResult: null,
      pendingFile: {
        selectedSheetIndex: 0,
        sheets: [],
        title: '',
      },
      preflightSummary: null,
    },
    joinForms: {
      formList: remoteList(),
      submissionList: remoteList(),
    },
    journeys: {
      journeyInstanceList: remoteList(),
      journeyInstancesByJourneyId: {},
      journeyInstancesBySubjectId: {},
      journeyList: remoteList(),
      milestonesByInstanceId: {},
      timelineUpdatesByInstanceId: {},
    },
    organizations: {
      orgData: remoteItem(0),
      subOrgsByOrgId: {},
      treeDataList: remoteList(),
      userMembershipList: remoteList(),
    },
    profiles: {
      fieldsList: remoteList(),
      orgsByPersonId: {},
      personById: {},
    },
    search: {
      matchesByQuery: {},
    },
    settings: {
      officialMembershipsList: remoteList(),
    },
    smartSearch: {
      queryList: remoteList(),
      statsByFilterSpec: {},
    },
    surveys: {
      elementsBySurveyId: {},
      statsBySurveyId: {},
      submissionList: remoteList(),
      submissionsBySurveyId: {},
      surveyIdsByCampaignId: {},
      surveyList: remoteList(),
      surveysWithElementsList: remoteList(),
    },
    tags: {
      tagGroupList: remoteList(),
      tagList: remoteList(),
      tagsByPersonId: {},
    },
    tasks: {
      assignedTasksByTaskId: {},
      statsById: {},
      taskIdsByCampaignId: {},
      tasksList: remoteList(),
    },
    user: {
      membershipList: remoteList(),
      userItem: remoteItem('me'),
    },
    views: {
      accessByViewId: {},
      columnsByViewId: {},
      folderList: remoteList(),
      officialList: remoteList(),
      recentlyCreatedFolder: null,
      rowsByViewId: {},
      viewList: remoteList(),
    },
  };

  return {
    ...emptyState,
    ...overrides,
  };
}
