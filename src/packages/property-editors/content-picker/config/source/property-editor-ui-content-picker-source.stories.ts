import type { Meta, Story } from '@storybook/web-components';
import type { UmbPropertyEditorUIContentPickerSourceElement } from './property-editor-ui-content-picker-source.element.js';
import { html } from '@umbraco-cms/backoffice/external/lit';

import './property-editor-ui-content-picker-source.element.js';

export default {
	title: 'Property Editor UIs/Content Picker Start Node',
	component: 'umb-property-editor-ui-content-picker-source',
	id: 'umb-property-editor-ui-content-picker-source',
} as Meta;

export const AAAOverview: Story<UmbPropertyEditorUIContentPickerSourceElement> = () =>
	html`<umb-property-editor-ui-content-picker-source></umb-property-editor-ui-content-picker-source>`;
AAAOverview.storyName = 'Overview';
