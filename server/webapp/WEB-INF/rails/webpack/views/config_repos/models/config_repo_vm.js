/*
 * Copyright 2018 ThoughtWorks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Stream      = require("mithril/stream");
const _           = require("lodash");
const Materials   = require("models/config_repos/materials");
const Validatable = require("models/mixins/validatable_mixin");

function ConfigRepoVM(data) {
  this.id = Stream();
  this.pluginId = Stream();
  this.type = Stream();
  this.attributes = Stream();
  this.configuration = Stream();
  this.etag = Stream(null);

  Validatable.call(this, { errors: {} });

  this.validatePresenceOf("id");
  this.validateFormatOf("id", Validatable.DefaultOptions.forId("ID"));
  this.validatePresenceOf("pluginId");
  this.validatePresenceOf("type");

  this.allowSave = () => {
    // intentionally not inlined with `&&` so that we run all validations every time
    const parentValid = this.isValid();
    const childValid = this.attributes().isValid();
    return parentValid && childValid;
  };

  this.initialize = (data) => {
    this.id(data.id);
    this.pluginId(data.plugin_id);
    this.type(data.material.type);
    this.attributes(Materials.get(this.type(), data));
    this.configuration(data.configuration || []);
  };

  this.initialize(data);

  this.toJSON = () => {
    return {
      id: this.id(),
      plugin_id: this.pluginId(), // eslint-disable-line camelcase
      material: {
        type: this.type(),
        attributes: this.attributes().toJSON()
      },
      configuration: _.cloneDeep(this.configuration())
    };
  };

  this.clone = () => {
    const cloned = new ConfigRepoVM(this.toJSON());
    cloned.etag(this.etag());
    return cloned;
  };
}

module.exports = ConfigRepoVM;
