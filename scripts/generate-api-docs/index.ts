/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

// I didn't like any of the TS -> MD API doc generators so I hacked up my own ¯\_(ツ)_/¯

import {Application} from 'typedoc';
import {readFileSync, writeFileSync, unlinkSync} from 'fs';
import * as Sqrl from 'squirrelly';

const API_DOCS_JSON_FILE = 'apidocs.json';
const API_DOCS_TEMPLATE = 'scripts/generate-api-docs/api-doc-template.md';
const README_FILE = 'README.md';
const TSCONFIG_DOCS_FILE = 'scripts/generate-api-docs/tsconfig.docs.json';
const API_DOC_TAG = '<!-- API DOC -->';
const API_DOC_TAG_END = '<!-- END API DOC -->';

const app = new Application();
app.options.setValue('tsconfig', TSCONFIG_DOCS_FILE);
app.generateJson(['src/index.ts'], 'apidocs.json');

const typeToString = (type: any): string => {
  const typeName = type.name;

  if (!type.typeArguments) {
    return typeName;
  }

  return `${typeName}<${type.typeArguments.map(typeToString).join(', ')}>`;
};

const parameterToString = (param: any): string => {
  const name = param.name;
  const type = typeToString(param.type);
  const defaultValue = param.defaultValue;
  const isOptional = param?.flags?.isOptional;

  return `${name}${isOptional ? '?' : ''}: ${type}${defaultValue ? ` = ${defaultValue}` : ''}`;
};

const parametersToString = (params: any[]): string => params?.map(parameterToString).join(', ');

const modifiersToString = (flags: any): string =>
  [
    flags?.isPublic && 'public',
    flags?.isProtected && 'protected',
    flags?.isPrivate && 'private',
    flags?.isStatic && 'static'
  ]
    .filter(Boolean)
    .join(' ');

const typedocMethodToSimpleMember = (member: any) => ({
  name: member.name,
  returnType: typeToString(member.signatures[0].type),
  modifiers: modifiersToString(member.flags),
  parameters: parametersToString(member.signatures[0].parameters),
  comment: member?.comment?.shortText,
  order: member.sources[0].line
});

const simpleMemberToTemplateObject = (m: any) => ({
  text: m.comment,
  order: m.order,
  title: `${m.modifiers ? `${m.modifiers} ` : ''}${m.name}(${m.parameters ? m.parameters : ''}): ${m.returnType}`,
  tocTitle: m.name
});

const apiDocs = JSON.parse(readFileSync(API_DOCS_JSON_FILE, 'utf8'));
const scd4xClassMembers = apiDocs.children
  .find(child => child.originalName === 'src/index.ts')
  .children.find(child => child.name === 'SCD4x')
  .children.filter(member => member.kindString === 'Method')
  .map(typedocMethodToSimpleMember)
  .map(simpleMemberToTemplateObject)
  .sort((a, b) => a.order - b.order);

const data = {
  members: scd4xClassMembers
};

Sqrl.autoEscaping(false);
const apiDocMd = Sqrl.renderFile(API_DOCS_TEMPLATE, data);

const readmeFileByLine = readFileSync(README_FILE, 'utf8').split('\n');
const apiDocStartIndex = readmeFileByLine.findIndex(line => line === API_DOC_TAG);
const apiDocEndIndex = readmeFileByLine.findIndex(line => line === API_DOC_TAG_END);

const resultReadme =
  readmeFileByLine.slice(0, apiDocStartIndex + 1).join('\n') +
  '\n' +
  apiDocMd +
  '\n' +
  readmeFileByLine.slice(apiDocEndIndex).join('\n');

writeFileSync(README_FILE, resultReadme);
unlinkSync(API_DOCS_JSON_FILE);
