/* globals sap */
sap.ui.define(
  [
    'jquery.sap.global',
    'sap/ui/core/library'
  ],
  function (      // eslint-disable-line
  ) {
    // Declare the library
    const libary = sap.ui.getCore().initLibrary({
      name: 'meteor-ui5-mongo',

      version: '0.2.1',

      dependencies: [],

      types: [
        'model.ContextBinding',
        'model.DocumentListBinding',
        'model.Model',
        'model.PropertyBinding',
        'model.PropertyListBinding'
      ],

      interfaces: [],

      controls: [],

      elements: []

    });

    return libary;
  }
);
