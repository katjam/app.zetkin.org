import { FormattedMessage as Msg } from 'react-intl';
import { Box, Paper, Switch, Typography } from '@mui/material';

import CallAssignmentModel from '../models/CallAssignmentModel';
import useModel from 'core/useModel';

interface ConversationSettingsProps {
  assignmentId: number;
  orgId: number;
}

const ConversationSettings = ({
  assignmentId,
  orgId,
}: ConversationSettingsProps) => {
  const model = useModel(
    (store) => new CallAssignmentModel(store, orgId, assignmentId)
  );

  return (
    <Paper>
      <Box padding={2}>
        <Typography variant="h4">
          <Msg id="pages.organizeCallAssignment.conversation.settings.title" />
        </Typography>
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          marginTop={2}
        >
          <Typography variant="h6">
            <Msg id="pages.organizeCallAssignment.conversation.settings.notes.title" />
          </Typography>
          <Switch
            //this looks backwards bc in interface we use the positive "allow"
            checked={!model.getData().data?.disable_caller_notes}
            onChange={(evt) => model.setCallerNotesEnabled(evt.target.checked)}
          />
        </Box>
        <Typography>
          <Msg id="pages.organizeCallAssignment.conversation.settings.notes.message" />
        </Typography>
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          marginTop={1}
        >
          <Typography variant="h6">
            <Msg id="pages.organizeCallAssignment.conversation.settings.targetData.title" />
          </Typography>
          <Switch
            checked={model.getData().data?.expose_target_details}
            onChange={(evt) =>
              model.setTargetDetailsExposed(evt.target.checked)
            }
          />
        </Box>
        <Typography>
          <Msg id="pages.organizeCallAssignment.conversation.settings.targetData.message" />
        </Typography>
      </Box>
    </Paper>
  );
};

export default ConversationSettings;