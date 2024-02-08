import type {
	MediaTypeItemResponseModel,
	MediaTypeResponseModel,
	MediaTypeTreeItemResponseModel,
} from '@umbraco-cms/backoffice/backend-api';

type UmbMockMediaTypeModelHack = MediaTypeResponseModel & MediaTypeTreeItemResponseModel & MediaTypeItemResponseModel;

export interface UmbMockMediaTypeModel extends Omit<UmbMockMediaTypeModelHack, 'type'> {}

export const data: Array<UmbMockMediaTypeModel> = [
	{
		name: 'Media Type 1',
		id: 'media-type-1-id',
		parent: null,
		description: 'Media type 1 description',
		alias: 'mediaType1',
		icon: 'icon-bug',
		properties: [],
		containers: [],
		allowedAsRoot: false,
		variesByCulture: false,
		variesBySegment: false,
		isElement: false,
		allowedMediaTypes: [],
		compositions: [],
		isFolder: false,
		hasChildren: false,
	},
];