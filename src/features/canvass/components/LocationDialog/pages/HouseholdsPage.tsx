import { FC, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material';
import { Add, Apps, KeyboardArrowRight } from '@mui/icons-material';

import PageBase from './PageBase';
import { Household, ZetkinLocation } from 'features/areaAssignments/types';
import ZUIRelativeTime from 'zui/ZUIRelativeTime';
import useLocationMutations from 'features/canvass/hooks/useLocationMutations';
import messageIds from 'features/canvass/l10n/messageIds';
import { Msg, useMessages } from 'core/i18n';

type Props = {
  location: ZetkinLocation;
  onBack: () => void;
  onBulk: () => void;
  onClose: () => void;
  onCreateHousehold: (householdId: Household) => void;
  onSelectHousehold: (householdId: string) => void;
  orgId: number;
};

const HouseholdsPage: FC<Props> = ({
  onBack,
  onBulk,
  onClose,
  onCreateHousehold,
  onSelectHousehold,
  orgId,
  location,
}) => {
  const messages = useMessages(messageIds);
  const [adding, setAdding] = useState(false);
  const { addHousehold } = useLocationMutations(orgId, location.id);

  const sortedHouseholds = location.households.concat().sort((h0, h1) => {
    const floor0 = h0.floor ?? Infinity;
    const floor1 = h1.floor ?? Infinity;

    return floor0 - floor1;
  });

  return (
    <PageBase
      onBack={onBack}
      onClose={onClose}
      subtitle={location.title}
      title={messages.households.page.header()}
    >
      <Box display="flex" flexDirection="column" flexGrow={2} gap={1}>
        {location.households.length == 0 && (
          <Typography color="secondary" sx={{ fontStyle: 'italic' }}>
            <Msg id={messageIds.households.page.empty} />
          </Typography>
        )}
        <List sx={{ overflowY: 'visible' }}>
          {sortedHouseholds.map((household, index) => {
            const sortedVisits = household.visits.toSorted((a, b) => {
              const dateA = new Date(a.timestamp);
              const dateB = new Date(b.timestamp);
              if (dateA > dateB) {
                return -1;
              } else if (dateB > dateA) {
                return 1;
              } else {
                return 0;
              }
            });

            const prevFloor = sortedHouseholds[index - 1]?.floor ?? null;
            const curFloor = household.floor || null;
            const firstOnFloor = index == 0 || curFloor != prevFloor;

            const mostRecentVisit =
              sortedVisits.length > 0 ? sortedVisits[0] : null;

            return (
              <Box key={household.id}>
                {firstOnFloor && (
                  <ListSubheader>
                    {household.floor
                      ? `Floor ${household.floor}`
                      : 'Unknown floor'}
                  </ListSubheader>
                )}
                <Divider />
                <ListItem
                  alignItems="center"
                  onClick={() => {
                    onSelectHousehold(household.id);
                  }}
                >
                  <Box flexGrow={1}>
                    <ListItemText>{household.title}</ListItemText>
                  </Box>
                  {mostRecentVisit && (
                    <Typography color="secondary">
                      <ZUIRelativeTime datetime={mostRecentVisit.timestamp} />
                    </Typography>
                  )}
                  <KeyboardArrowRight />
                </ListItem>
              </Box>
            );
          })}
        </List>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          gap={1}
          mt={2}
        >
          <Button
            disabled={adding}
            onClick={async () => {
              setAdding(true);
              const newlyAddedHousehold = await addHousehold({
                title: messages.default.household(),
              });
              setAdding(false);
              onCreateHousehold(newlyAddedHousehold);
            }}
            startIcon={
              adding ? (
                <CircularProgress color="secondary" size="20px" />
              ) : (
                <Add />
              )
            }
            variant="outlined"
          >
            Add new household
          </Button>
          <Button onClick={onBulk} startIcon={<Apps />} variant="text">
            Create many
          </Button>
        </Box>
      </Box>
    </PageBase>
  );
};

export default HouseholdsPage;
