/**
 * @file package.js
 * @copyright PropellerLabs.com 2016
 * @license Apache-2.0
 *
 * @namespace meteor-ui5-mongo
 * @description Reactive UI5 model for Meteor Mongo collections.
 */

/* globals Package */

Package.describe({
  name: 'propellerlabsio:meteor-ui5-mongo',
  version: '0.2.0',
  summary: 'UI5 with Meteor Mongo databases',
  git: 'https://github.com/propellerlabsio/meteor-ui5-mongo',
  documentation: 'README.md'
});

Package.onUse((api) => {
  api.versionsFrom('1.4.0.1');
  api.use('ecmascript');

  // Add package so we can reference Mongo collections by name, imply it
  // so UI5 app builders can do the same.
  api.use('dburles:mongo-collection-instances@0.1.3');
  api.imply('dburles:mongo-collection-instances');

  // Add our model and control files. Note OpenUI5 requires these files to be
  // served as is with none of meteor's processing which is why we use the bare and
  // isAsset options.
  api.addFiles([
    'library.js',
    'library-preload.json',
    'model/ContextBinding.js',
    'model/ContextBinding-dbg.js',
    'model/ContextBinding.js.map',
    'model/DocumentListBinding.js',
    'model/DocumentListBinding-dbg.js',
    'model/DocumentListBinding.js.map',
    'model/Model.js',
    'model/Model-dbg.js',
    'model/Model.js.map',
    'model/PropertyBinding.js',
    'model/PropertyBinding-dbg.js',
    'model/PropertyBinding.js.map',
    'model/PropertyListBinding.js',
    'model/PropertyListBinding-dbg.js',
    'model/PropertyListBinding.js.map'
  ], 'client', {
    bare: true,
    isAsset: true // Allows clients to reference model by <resourcepath>.model.mongo.Model
  });
});
