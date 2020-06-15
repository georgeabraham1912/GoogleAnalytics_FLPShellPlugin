//Boostrap Google Analytics
(function (i, s, o, g, r, a, m) {
	i['GoogleAnalyticsObject'] = r;
	i[r] = i[r] || function () {
		(i[r].q = i[r].q || []).push(arguments)
	}, i[r].l = 1 * new Date();
	a = s.createElement(o), m = s.getElementsByTagName(o)[0];
	a.async = 1;
	a.src = g;
	m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast"
], function (Component, Button, Bar, MessageToast) {

	return Component.extend("com.googleanalytics.flp.shell.plugin.Component", {

		metadata: {
			"manifest": "json"
		},

		init: function () {
			var rendererPromise = this._getRenderer();
			this.initGoogleAnalytics();
		},

		initGoogleAnalytics: function () {
			//Get GA tracking ID from Portal configuration
			// Please refer to the Deploying and Configuring Shell Plugin Document
			// and create a parameter in the Portal Admin page with same below name (case sensitive)
			var trackingID = this.getComponentData().config.trackingID;
			if (trackingID) {
				var siteService = this.getSiteService();
				if (siteService) {
					//Initalize the tracker
					ga('create', trackingID, 'auto');
					this.registerPortalSiteNavigationEvents(siteService);
				}
			}
		},

		registerPortalSiteNavigationEvents: function (siteService) {
			//Track app and page navigation events
			siteService.subscribeOnAppNavigation(function (target) {
				var pageSemanticObj = target.semanticObject;
				ga('send', 'pageview', {
					'page': pageSemanticObj
				});
			}.bind(this));
		},

		getSiteService: function () {
			try {
				return sap.ushell.Container.getService('SiteService');
			} catch (exception) {
				return null;
			}
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}
	});
});