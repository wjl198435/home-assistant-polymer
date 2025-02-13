import {
  LitElement,
  property,
  TemplateResult,
  html,
  customElement,
  CSSResult,
  css,
} from "lit-element";
import "../../components/ha-card";
import { HomeAssistant } from "../../types";
import {
  CoreFrontendUserData,
  getOptimisticFrontendUserDataCollection,
} from "../../data/frontend";

@customElement("ha-advanced-mode-card")
class AdvancedModeCard extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public coreUserData?: CoreFrontendUserData;

  protected render(): TemplateResult | void {
    return html`
      <ha-card>
        <div class="card-header">
          <div class="title">Advanced mode</div>
          <ha-switch
            .checked=${this.coreUserData && this.coreUserData.showAdvanced}
            .disabled=${this.coreUserData === undefined}
            @change=${this._advancedToggled}
          ></ha-switch>
        </div>
        <div class="card-content">
          牧养犬 hides advanced features and options by default. You can make
          these features accessible by checking this toggle. This is a
          user-specific setting and does not impact other users using Home
          Assistant.
        </div>
      </ha-card>
    `;
  }

  private async _advancedToggled(ev) {
    getOptimisticFrontendUserDataCollection(this.hass.connection, "core").save({
      showAdvanced: ev.currentTarget.checked,
    });
  }

  static get styles(): CSSResult {
    return css`
      .card-header {
        display: flex;
      }
      .title {
        flex: 1;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-advanced-mode-card": AdvancedModeCard;
  }
}
