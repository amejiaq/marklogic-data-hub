(:
  Copyright (c) 2021 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
:)
xquery version "1.0-ml";

declare namespace search = "http://marklogic.com/appservices/search";

declare variable $options as element(search:options) external;

element search:options {
  $options/@*,
  for $el in $options/element()
  return
    if ($el[self::search:constraint and @name = "entityType"]) then
      <constraint name="entityType" xmlns="http://marklogic.com/appservices/search">
        <custom facet="false">
          <parse apply="parse" ns="org:example" at="/custom-data-modules/my-entity-type-constraint.xqy"/>
        </custom>
      </constraint>
    else $el
}
