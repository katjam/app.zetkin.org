import EditorJS from '@editorjs/editorjs';
import { OutputBlockData } from '@editorjs/editorjs';
import { Box, Divider, Stack, Tab } from '@mui/material';
import { FC, MutableRefObject, useEffect, useRef, useState } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import BlockListItem from './BlockListItem';
import messageIds from 'features/emails/l10n/messageIds';
import PreviewTab from './PreviewTab';
import { useMessages } from 'core/i18n';

interface EmailSettingsProps {
  apiRef: MutableRefObject<EditorJS | null>;
  blocks: OutputBlockData[];
  readOnly: boolean;
  selectedBlockIndex: number;
}

const EmailSettings: FC<EmailSettingsProps> = ({
  apiRef,
  blocks,
  readOnly,
  selectedBlockIndex,
}) => {
  const messages = useMessages(messageIds);
  const [activeTab, setActiveTab] = useState<
    'content' | 'preview' | 'settings'
  >('content');
  const boxRef = useRef<HTMLElement>();

  useEffect(() => {
    boxRef.current?.children[selectedBlockIndex]?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [selectedBlockIndex]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        overflowY: 'auto',
      }}
    >
      <TabContext value={activeTab}>
        <TabList onChange={(ev, newValue) => setActiveTab(newValue)}>
          <Tab
            label={messages.editor.settings.tabs.content()}
            sx={{ marginLeft: 2 }}
            value="content"
          />
          <Tab
            label={messages.editor.settings.tabs.preview.title()}
            value="preview"
          />
        </TabList>
        <TabPanel
          sx={{
            flexGrow: 0,
            overflowY: 'auto',
            padding: 0,
          }}
          value="content"
        >
          <Stack ref={boxRef} divider={<Divider />} sx={{ paddingTop: 1 }}>
            {blocks.map((block, index) => (
              <BlockListItem
                key={block.id}
                block={block}
                onChange={(newData: OutputBlockData['data']) => {
                  if (block.id) {
                    apiRef.current?.blocks.update(block.id, newData);
                  }
                }}
                readOnly={readOnly}
                selected={!readOnly && index === selectedBlockIndex}
              />
            ))}
          </Stack>
        </TabPanel>
        <TabPanel sx={{ padding: 0 }} value="preview">
          <PreviewTab />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default EmailSettings;
