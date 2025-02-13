import "@material/mwc-button";
import "@polymer/paper-checkbox/paper-checkbox";
import "@polymer/paper-input/paper-input";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import yaml from "js-yaml";

import "../../../components/entity/ha-entity-picker";
import "../../../components/ha-code-editor";
import "../../../resources/ha-style";
import { EventsMixin } from "../../../mixins/events-mixin";

const ERROR_SENTINEL = {};
/*
 * @appliesMixin EventsMixin
 */
class HaPanelDevState extends EventsMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="ha-style">
        :host {
          -ms-user-select: initial;
          -webkit-user-select: initial;
          -moz-user-select: initial;
          display: block;
          padding: 16px;
          direction: ltr;
        }

        .inputs {
          max-width: 400px;
        }

        mwc-button {
          margin-top: 8px;
        }

        .entities th {
          text-align: left;
        }

        .entities tr {
          vertical-align: top;
        }

        .entities tr:nth-child(odd) {
          background-color: var(--table-row-background-color, #fff);
        }

        .entities tr:nth-child(even) {
          background-color: var(--table-row-alternative-background-color, #eee);
        }
        .entities td {
          padding: 4px;
        }
        .entities paper-icon-button {
          height: 24px;
          padding: 0;
        }
        .entities td:nth-child(3) {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .entities a {
          color: var(--primary-color);
        }
      </style>

      <div class="inputs">
        <p>
          Set the representation of a device within 牧养犬.<br />
          This will not communicate with the actual device.
        </p>

        <ha-entity-picker
          autofocus
          hass="[[hass]]"
          value="{{_entityId}}"
          on-change="entityIdChanged"
          allow-custom-entity
        ></ha-entity-picker>
        <paper-input
          label="State"
          required
          autocapitalize="none"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          value="{{_state}}"
          class="state-input"
        ></paper-input>
        <p>State attributes (YAML, optional)</p>
        <ha-code-editor
          mode="yaml"
          value="[[_stateAttributes]]"
          error="[[!validJSON]]"
          on-value-changed="_yamlChanged"
        ></ha-code-editor>
        <mwc-button on-click="handleSetState" disabled="[[!validJSON]]" raised
          >Set State</mwc-button
        >
      </div>

      <h1>Current entities</h1>
      <table class="entities">
        <tr>
          <th>Entity</th>
          <th>State</th>
          <th hidden$="[[narrow]]">
            Attributes
            <paper-checkbox checked="{{_showAttributes}}"></paper-checkbox>
          </th>
        </tr>
        <tr>
          <th>
            <paper-input
              label="Filter entities"
              type="search"
              value="{{_entityFilter}}"
            ></paper-input>
          </th>
          <th>
            <paper-input
              label="Filter states"
              type="search"
              value="{{_stateFilter}}"
            ></paper-input>
          </th>
          <th hidden$="[[!computeShowAttributes(narrow, _showAttributes)]]">
            <paper-input
              label="Filter attributes"
              type="search"
              value="{{_attributeFilter}}"
            ></paper-input>
          </th>
        </tr>
        <tr hidden$="[[!computeShowEntitiesPlaceholder(_entities)]]">
          <td colspan="3">No entities</td>
        </tr>
        <template is="dom-repeat" items="[[_entities]]" as="entity">
          <tr>
            <td>
              <paper-icon-button
                on-click="entityMoreInfo"
                icon="hass:open-in-new"
                alt="More Info"
                title="More Info"
              >
              </paper-icon-button>
              <a href="#" on-click="entitySelected">[[entity.entity_id]]</a>
            </td>
            <td>[[entity.state]]</td>
            <template
              is="dom-if"
              if="[[computeShowAttributes(narrow, _showAttributes)]]"
            >
              <td>[[attributeString(entity)]]</td>
            </template>
          </tr>
        </template>
      </table>
    `;
  }

  static get properties() {
    return {
      hass: {
        type: Object,
      },

      parsedJSON: {
        type: Object,
        computed: "_computeParsedStateAttributes(_stateAttributes)",
      },

      validJSON: {
        type: Boolean,
        computed: "_computeValidJSON(parsedJSON)",
      },

      _entityId: {
        type: String,
        value: "",
      },

      _entityFilter: {
        type: String,
        value: "",
      },

      _stateFilter: {
        type: String,
        value: "",
      },

      _attributeFilter: {
        type: String,
        value: "",
      },

      _state: {
        type: String,
        value: "",
      },

      _stateAttributes: {
        type: String,
        value: "",
      },

      _showAttributes: {
        type: Boolean,
        value: true,
      },

      _entities: {
        type: Array,
        computed:
          "computeEntities(hass, _entityFilter, _stateFilter, _attributeFilter)",
      },
    };
  }

  entitySelected(ev) {
    var state = ev.model.entity;
    this._entityId = state.entity_id;
    this._state = state.state;
    this._stateAttributes = yaml.safeDump(state.attributes);
    ev.preventDefault();
  }

  entityIdChanged() {
    var state = this.hass.states[this._entityId];
    this._state = state.state;
    this._stateAttributes = yaml.safeDump(state.attributes);
  }

  entityMoreInfo(ev) {
    ev.preventDefault();
    this.fire("hass-more-info", { entityId: ev.model.entity.entity_id });
  }

  handleSetState() {
    if (!this._entityId) {
      alert("Entity is a mandatory field");
      return;
    }
    this.hass.callApi("POST", "states/" + this._entityId, {
      state: this._state,
      attributes: this.parsedJSON,
    });
  }

  computeEntities(hass, _entityFilter, _stateFilter, _attributeFilter) {
    return Object.keys(hass.states)
      .map(function(key) {
        return hass.states[key];
      })
      .filter(function(value) {
        if (!value.entity_id.includes(_entityFilter.toLowerCase())) {
          return false;
        }

        if (!value.state.includes(_stateFilter.toLowerCase())) {
          return false;
        }

        if (_attributeFilter !== "") {
          var attributeFilter = _attributeFilter.toLowerCase();
          var colonIndex = attributeFilter.indexOf(":");
          var multiMode = colonIndex !== -1;

          var keyFilter = attributeFilter;
          var valueFilter = attributeFilter;

          if (multiMode) {
            // we need to filter keys and values separately
            keyFilter = attributeFilter.substring(0, colonIndex).trim();
            valueFilter = attributeFilter.substring(colonIndex + 1).trim();
          }

          var attributeKeys = Object.keys(value.attributes);

          for (var i = 0; i < attributeKeys.length; i++) {
            var key = attributeKeys[i];

            if (key.includes(keyFilter) && !multiMode) {
              return true; // in single mode we're already satisfied with this match
            }
            if (!key.includes(keyFilter) && multiMode) {
              continue;
            }

            var attributeValue = value.attributes[key];

            if (
              attributeValue !== null &&
              JSON.stringify(attributeValue)
                .toLowerCase()
                .includes(valueFilter)
            ) {
              return true;
            }
          }

          // there are no attributes where the key and/or value can be matched
          return false;
        }

        return true;
      })
      .sort(function(entityA, entityB) {
        if (entityA.entity_id < entityB.entity_id) {
          return -1;
        }
        if (entityA.entity_id > entityB.entity_id) {
          return 1;
        }
        return 0;
      });
  }

  computeShowEntitiesPlaceholder(_entities) {
    return _entities.length === 0;
  }

  computeShowAttributes(narrow, _showAttributes) {
    return !narrow && _showAttributes;
  }

  attributeString(entity) {
    var output = "";
    var i;
    var keys;
    var key;
    var value;

    for (i = 0, keys = Object.keys(entity.attributes); i < keys.length; i++) {
      key = keys[i];
      value = entity.attributes[key];
      if (!Array.isArray(value) && value instanceof Object) {
        value = JSON.stringify(value, null, "  ");
      }
      output += key + ": " + value + "\n";
    }

    return output;
  }

  _computeParsedStateAttributes(stateAttributes) {
    try {
      return stateAttributes.trim() ? yaml.safeLoad(stateAttributes) : {};
    } catch (err) {
      return ERROR_SENTINEL;
    }
  }

  _computeValidJSON(parsedJSON) {
    return parsedJSON !== ERROR_SENTINEL;
  }

  _yamlChanged(ev) {
    this._stateAttributes = ev.detail.value;
  }
}

customElements.define("developer-tools-state", HaPanelDevState);
