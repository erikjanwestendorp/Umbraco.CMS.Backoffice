import { UUITextStyles } from '@umbraco-ui/uui-css/lib';
import { css, CSSResultGroup, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UmbModalHandler, UmbModalService } from '..';
import { umbCurrentUserService } from 'src/auth/current-user/current-user.service';
import type { ManifestExternalLoginProvider, ManifestUserDashboard, UserDetails } from '@umbraco-cms/models';
import { umbExtensionsRegistry } from '@umbraco-cms/extensions-registry';
import '../../../../../auth/external-login-providers/external-login-provider-extension.element';
import '../../../../../auth/current-user/user-dashboards/user-dashboard-extension.element';
import {
	UmbCurrentUserHistoryStore,
	UmbCurrentUserHistoryItem,
} from 'src/auth/current-user/current-user-history.store';
import { UmbLitElement } from 'src/core/element/lit-element.element';

@customElement('umb-modal-layout-current-user')
export class UmbModalLayoutCurrentUserElement extends UmbLitElement {
	static styles: CSSResultGroup = [
		UUITextStyles,
		css`
			:host {
				display: block;
			}
			:host,
			umb-workspace-entity {
				width: 100%;
				height: 100%;
			}
			#main {
				padding: var(--uui-size-space-5);
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-3);
			}
			#umbraco-id-buttons {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-3);
			}
			umb-external-login-provider-extension:not(:last-child) {
				margin-bottom: var(--uui-size-space-3);
				display: block;
			}
			#recent-history {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-3);
			}
			#recent-history-items {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-4);
			}
			.history-item {
				display: grid;
				grid-template-columns: 32px 1fr;
				grid-template-rows: 1fr;
				color: var(--uui-color-interactive);
				text-decoration: none;
			}
			.history-item uui-icon {
				margin-top: 2px;
			}
			.history-item:hover {
				color: var(--uui-color-interactive-emphasis);
			}
			.history-item > div {
				color: inherit;
				text-decoration: none;
				display: flex;
				flex-direction: column;
				line-height: 1.4em;
			}
			.history-item > div > span {
				font-size: var(--uui-size-4);
				opacity: 0.5;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
			}
		`,
	];

	@property({ attribute: false })
	modalHandler?: UmbModalHandler;

	@state()
	private _currentUser?: UserDetails;

	@state()
	private _externalLoginProviders: Array<ManifestExternalLoginProvider> | null = null;

	@state()
	private _userDashboards: Array<ManifestUserDashboard> | null = null;

	@state()
	private _history: Array<UmbCurrentUserHistoryItem> = [];

	private _modalService?: UmbModalService;
	private _currentUserHistoryStore?: UmbCurrentUserHistoryStore;

	constructor() {
		super();

		this.consumeAllContexts(['umbModalService', 'umbCurrentUserHistoryStore'], (instances) => {
			this._modalService = instances['umbModalService'];
			this._currentUserHistoryStore = instances['umbCurrentUserHistoryStore'];
			this._observeHistory();
		});

		this._observeCurrentUser();
		this._observeExternalLoginProviders();
		this._observeUserDashboards();
	}

	private _observeExternalLoginProviders() {
		this.observe<ManifestExternalLoginProvider[]>(
			umbExtensionsRegistry.extensionsOfType('externalLoginProvider'),
			(loginProvider) => {
				this._externalLoginProviders = loginProvider;
			}
		);
	}

	private async _observeCurrentUser() {
		this.observe<UserDetails>(umbCurrentUserService.currentUser, (currentUser) => {
			if(currentUser) {
				this._currentUser = currentUser;
			}
		});
	}
	private async _observeHistory() {
		if (this._currentUserHistoryStore) {
			this.observe<Array<UmbCurrentUserHistoryItem>>(this._currentUserHistoryStore.getLatestHistory(), (history) => {
				if(history) {
					this._history = history;
				}
			});
		}
	}

	private _observeUserDashboards() {
		this.observe<ManifestUserDashboard[]>(umbExtensionsRegistry.extensionsOfType('user-dashboard'), (userDashboard) => {
			this._userDashboards = userDashboard;
		});
	}

	private _close() {
		this.modalHandler?.close();
	}

	private _edit() {
		if (!this._currentUser) return;

		history.pushState(null, '', '/section/users/view/users/user/' + this._currentUser.key); //TODO Change to a tag with href and make dynamic
		this._close();
	}

	private _changePassword() {
		if (!this._modalService) return;

		this._modalService.changePassword({ requireOldPassword: umbCurrentUserService.isAdmin });
	}

	private _renderHistoryItem(item: UmbCurrentUserHistoryItem) {
		return html`
			<a href=${item.path} class="history-item">
				<uui-icon name="umb:link"></uui-icon>
				<div>
					<b>${Array.isArray(item.label) ? item.label[0] : item.label}</b>
					<span>
						${Array.isArray(item.label)
							? item.label.map((label, index) => {
									if (index === 0) return;
									return html`
										<span>${label}</span>
										${index !== item.label.length - 1 ? html`<span>${'>'}</span>` : nothing}
									`;
							  })
							: nothing}
					</span>
				</div>
			</a>
		`;
	}

	private _logout() {
		umbCurrentUserService.logout();
	}

	render() {
		return html`
			<umb-workspace-entity headline="${this._currentUser?.name || ''}">
				<div id="main">
					<uui-box>
						<b slot="headline">Your profile</b>
						<uui-button look="primary" @click=${this._edit}>Edit</uui-button>
						<uui-button look="primary" @click=${this._changePassword}>Change password</uui-button>
					</uui-box>
					<uui-box>
						<b slot="headline">External login providers</b>
						${this._externalLoginProviders?.map(
							(provider) =>
								html`<umb-external-login-provider-extension
									.externalLoginProvider=${provider}></umb-external-login-provider-extension>`
						)}
					</uui-box>
					<div>
						${this._userDashboards?.map(
							(provider) =>
								html`<umb-user-dashboard-extension .userDashboard=${provider}></umb-user-dashboard-extension>`
						)}
					</div>
					<uui-box>
						<b slot="headline">Recent History</b>
						<div id="recent-history-items">
							${this._history.reverse().map((item) => html` ${this._renderHistoryItem(item)} `)}
						</div>
					</uui-box>
				</div>
				<div slot="actions">
					<uui-button @click=${this._close} look="secondary">Close</uui-button>
					<uui-button @click=${this._logout} look="primary" color="danger">Logout</uui-button>
				</div>
			</umb-workspace-entity>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'umb-modal-layout-current-user': UmbModalLayoutCurrentUserElement;
	}
}
