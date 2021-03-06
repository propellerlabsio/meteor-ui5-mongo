/**
 * @file meteor-ui5-mongo.model.ContextBinding.js
 * @copyright PropellerLabs.com 2016
 * @license Apache-2.0
 */
/* eslint-disable */

sap.ui.define([
    'sap/ui/model/ContextBinding',
    'sap/ui/model/ChangeReason'
  ],
  function(ContextBinding, ChangeReason) {
    "use strict";

    /**
     * @summary Constructor for ContextBinding
     *
     * @class
     * @description Provides a specialized context binding that can be used to
     * bind to a single document in a Meteor Mongo Collection.  It is this type
     * of ContextBinding that is used when, for example, an object header is
     * bound to a path like "/Orders(<_id>)".
     *
     * Each instance of this class observes changes on a query handle to provide reactive updates via firing
     * events.
     *
     * @param {meteor-ui5-mongo.model.Model} oModel
     * @param {String} sPath
     * @param {Object} oContext
     * @param {Object} [mParameters]
     * @public
     * @alias meteor-ui5-mongo.model.ContextBinding
     * @extends sap.ui.model.ContextBinding
     */
    var cContextBinding = ContextBinding.extend("meteor-ui5-mongo.model.ContextBinding", {

      constructor: function(oModel, sPath, oContext, mParameters, oEvents) {
        // Call super constructor
        ContextBinding.call(this, oModel, sPath, oContext, mParameters, oEvents);

        // Execute query.  Although, for reasons I don't understand yet, UI5 is
        // able to get the property values for this context without running a query,
        // We need to do so so we can observe changes and reactively update the
        // data in the front end
        this._runQuery();

        // Don't know what this does but it's needed - copied from ClientModel.js
        var that = this;
        oModel.createBindingContext(sPath, oContext, mParameters, function(oContext) {
          that.bInitial = false;
          that.oElementContext = oContext;
        });
      }
    });

    /**
     * @summary Clean-up no longer needed resources when this ContextBinding is
     * destroyed.
     *
     * @description Stop observing changes in the existing query or it will run
     * forever.
     * @public
     */
    cContextBinding.prototype.destroy = function() {
      if (this._oQueryHandle) {
        this._oQueryHandle.stop();
      }
    };


    /**
     * @summary Check for changes or optionally force refresh
     *
     * @description Code copied from sap.ui.model.ClientContextBinding
     * @public
     */
    cContextBinding.prototype.refresh = function(bForceUpdate) {
      var that = this;
      //recreate Context: force update
      this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
        if (that.oElementContext === oContext && !bForceUpdate) {
          that.oModel.checkUpdate(true, oContext);
        } else {
          that.oElementContext = oContext;
          that._fireChange();
        }
      }, true);
    };

    /**
     * @description Code copied from sap.ui.model.ClientContextBinding
     * @public
     */
    cContextBinding.prototype.initialize = function() {
      var that = this;
      //recreate Context: force update
      this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
        that.oElementContext = oContext;
        that._fireChange();
      }, true);
    };

    /**
     * @description Code copied from sap.ui.model.ClientContextBinding
     * @public
     */
    cContextBinding.prototype.setContext = function(oContext) {
      var that = this;
      if (this.oContext != oContext) {
        this.oContext = oContext;
        this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
          that.oElementContext = oContext;
          that._fireChange();
        });
      }
    };

    /**
     * @summary Execute Mongo query for current path and context and observe changes.
     *
     * @description This method runs the query for this ContextBinding and provides
     * reactivity by observing changes in the query and firing events on change.
     * @private
     */
    cContextBinding.prototype._runQuery = function() {
      // Stop observing changes in any existing query.  Will run forever otherwise.
      if (this._oQueryHandle) {
        this._oQueryHandle.stop();
      }

      // Run query
      const oCursor = this.oModel.runQuery(this.sPath, this.oContext);

      // Create query handle so we can observe changes
      this._oQueryHandle = oCursor.observeChanges({
        addedBefore: (id, fields, before) => {
          this.fireDataReceived();
          this._fireChange(ChangeReason.add);
        },

        changed: (id, fields) => {
          this._fireChange(ChangeReason.change);
        },

        removed: (id) => {
          this._fireChange(ChangeReason.remove);
        }
      });
    }

    return cContextBinding;

  });
