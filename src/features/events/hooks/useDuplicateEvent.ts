import useCreateEvent from './useCreateEvent';
import useEventData from './useEventData';
import { ZetkinEventPostBody } from './useEventMutations';

type useDuplicateEventReturn = {
  duplicateEvent: () => void;
};

export default function useDuplicateEvent(
  orgId: number,
  eventId: number
): useDuplicateEventReturn {
  const { createEvent } = useCreateEvent(orgId);
  const event = useEventData(orgId, eventId);

  const duplicateEvent = () => {
    const duplicateEventPostBody: ZetkinEventPostBody = {
      activity_id: event.data?.activity?.id,
      end_time: event.data?.end_time,
      info_text: event.data?.info_text,
      location_id: event.data?.location?.id,
      num_participants_required: event.data?.num_participants_required,
      organization_id: event.data?.organization.id,
      start_time: event.data?.start_time,
      title: event.data?.title,
    };
    if (event.data?.campaign) {
      duplicateEventPostBody.campaign_id = event.data?.campaign.id;
    }
    // TODO: should this include URL?
    return createEvent(duplicateEventPostBody);
  };

  return { duplicateEvent };
}
