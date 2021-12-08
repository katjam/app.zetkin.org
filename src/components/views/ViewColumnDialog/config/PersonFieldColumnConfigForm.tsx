import { FunctionComponent } from 'react';
import { useIntl } from 'react-intl';
import { MenuItem, TextField } from '@material-ui/core';

import { NATIVE_PERSON_FIELDS, PersonFieldViewColumn } from 'types/views';


interface PersonFieldColumnConfigFormProps {
    column: PersonFieldViewColumn;
    onChange: (column: PersonFieldViewColumn) => void;
}

const PersonFieldColumnConfigForm: FunctionComponent<PersonFieldColumnConfigFormProps> = ({ column, onChange }) => {
    const intl = useIntl();

    const getTitle = (field: NATIVE_PERSON_FIELDS) => {
        if (column.title) {
            return column.title;
        }
        else if (field === column.config.field) {
            return column.title;
        }
        else {
            return intl.formatMessage({ id: `misc.nativePersonFields.${field}` });
        }
    };

    const onFieldChange = (field: NATIVE_PERSON_FIELDS ) => {
        onChange({
            ...column,
            config: {
                field: field,
            },
            title: getTitle(field),
        });
    };

    return (
        <TextField
            fullWidth
            label={ intl.formatMessage({ id: 'misc.views.columnDialog.editor.fieldLabels.field' }) }
            margin="normal"
            onChange={ ev => onFieldChange(ev.target.value as NATIVE_PERSON_FIELDS) }
            select
            value={ column.config?.field || Object.values(NATIVE_PERSON_FIELDS)[0] }>
            { Object.values(NATIVE_PERSON_FIELDS).map(fieldSlug => (
                <MenuItem key={ fieldSlug } value={ fieldSlug }>
                    { intl.formatMessage({ id: `misc.nativePersonFields.${fieldSlug}` }) }
                </MenuItem>
            )) }
        </TextField>
    );
};

export default PersonFieldColumnConfigForm;
