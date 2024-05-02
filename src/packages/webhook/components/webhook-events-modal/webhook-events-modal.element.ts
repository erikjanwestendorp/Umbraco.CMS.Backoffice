import { UmbWebhookEventRepository } from '../../repository/event/webhook-event.repository.js';
import type { UmbWebhookEventModel } from '../../types.js';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { css, html, customElement, property, state, repeat } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

import type { UmbModalContext } from '@umbraco-cms/backoffice/modal';
import { UmbSelectionManager } from '@umbraco-cms/backoffice/utils';

@customElement('umb-webhook-events-modal')
export class UmbWebhookEventsModalElement extends UmbLitElement {
	@property({ attribute: false })
	modalContext?: UmbModalContext;

	@property({ attribute: false })
	events: Array<UmbWebhookEventModel> = [];

	@state()
	_events: Array<UmbWebhookEventModel> = [];

	#repository = new UmbWebhookEventRepository(this);

	#selectionManager = new UmbSelectionManager(this);

	constructor() {
		super();

		this.#requestEvents();
	}

	connectedCallback(): void {
		super.connectedCallback();
		this.#selectionManager.setSelectable(true);
		this.#selectionManager.setMultiple(true);
		this.#selectionManager.setSelection(this.events.map((item) => item.alias));

		this.observe(this.#selectionManager.selection, (selection) => {
			this.modalContext?.setValue(selection);
		});
	}

	async #requestEvents() {
		const { data } = await this.#repository.requestEvents();

		if (!data) return;

		this._events = data.items;
	}

	#submit() {
		this.modalContext?.submit();
	}

	#close() {
		this.modalContext?.reject();
	}

	render() {
		return html`<umb-body-layout headline="Select languages">
			<uui-box>
				${repeat(
					this._events,
					(item) => item.alias,
					(item) => html`
						<uui-menu-item
							label=${item.eventName}
							selectable
							@selected=${() => this.#selectionManager.select(item.alias)}
							@deselected=${() => this.#selectionManager.deselect(item.alias)}
							?selected=${this.events.includes(item)}></uui-menu-item>
							<uui-icon slot="icon" name="icon-globe"></uui-icon>
						</uui-menu-item>
					`,
				)}
			</uui-box>
			<div slot="actions">
				<uui-button label="Close" @click=${this.#close}></uui-button>
				<uui-button label="Submit" look="primary" color="positive" @click=${this.#submit}></uui-button>
			</div>
		</umb-body-layout> `;
	}

	static styles = [UmbTextStyles, css``];
}

export default UmbWebhookEventsModalElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-webhook-events-modal': UmbWebhookEventsModalElement;
	}
}
