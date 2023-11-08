import { DOCUMENT_ENTITY_TYPE } from '../../index.js';
import { DOCUMENT_REPOSITORY_ALIAS } from '../../repository/manifests.js';
import { UmbTrashEntityAction } from '@umbraco-cms/backoffice/entity-action';

export const manifests = [
	{
		type: 'entityAction',
		alias: 'Umb.EntityAction.Document.Trash',
		name: 'Trash Document Entity Action',
		weight: 900,
		api: UmbTrashEntityAction,
		meta: {
			icon: 'icon-trash',
			label: 'Trash',
			repositoryAlias: DOCUMENT_REPOSITORY_ALIAS,
			entityTypes: [DOCUMENT_ENTITY_TYPE],
		},
		conditions: [
			{
				alias: 'Umb.Condition.UserPermission',
				match: 'Umb.UserPermission.Document.Delete',
			},
		],
	},
];
