sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("PurchaseOrdersPurchaseOrders.controller.viewManagePOs", {

		_onRouteMatched: function(oEvent) {

			var thisView = this.getView();
			var AppInstance = this.getOwnerComponent().AppInstance;

			sap.ui.core.BusyIndicator.show();

			this.getOwnerComponent().getModel("model__get_po_list").callFunction("/displayall", {
				method: "GET",
				urlParameters: {
					PO_ALL: ""
				},
				success: function(oData, oResponse) {

					AppInstance.modelGetPOs_Content = new sap.ui.model.json.JSONModel();
					AppInstance.modelGetPOs_Content.setData(oData);
					thisView.setModel(AppInstance.modelGetPOs_Content);
					if (oData.results.length === 0) {

						AppInstance.tablePOs.getColumns()[6].setFilterValue("");
						AppInstance.tablePOs.getBinding("rows").filter(null);
					} else {
						AppInstance.tablePOs.getColumns()[6].setFilterValue(oData.results[0].User);
						AppInstance.tablePOs.getBinding("rows").filter([new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.Contains,oData.results[0].User)]);
					}
					/*Issue 42 table load issue. following row commented*/
					/*AppInstance.tablePOs.setVisibleRowCount(AppInstance.tablePOs.getBinding().getLength());*/
					sap.ui.core.BusyIndicator.hide();

				},
				error: function(error) {
					sap.ui.getCore().AppContext.ShowMessage(error);
				}
			});

			AppInstance.tablePOs.attachSort(function() {
				// AppInstance.tablePOs.setVisibleRowCount(AppInstance.tablePOs.getBinding().getLength());
			});

			// for open text app
			/*if ((this.getOwnerComponent().getComponentData().startupParameters.PoId)) {
					console.log("in test section ");
					var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
					this.getOwnerComponent().AppInstance.lastSelected_POAction = "PO_ACTION__EDIT" ;
					this.getOwnerComponent().AppInstance.lastSelected_PONumber = startupParams.PoId;
					this.getOwnerComponent().AppInstance.lastSelected_POApprovalStatus = "In Release";
					//this.getOwnerComponent().AppInstance.modelGetPOs_Content.getProperty("StatusText", oEvent.getSource().getBindingContext()) ;
					sap.ui.core.UIComponent.getRouterFor(this).navTo("targetHandlePO", { Command : "NAVIGATE" });
					//oRouter.navTo("targetHandlePO", { Command : "NAVIGATE" }, true);
					this.getOwnerComponent().AppInstance.openTextNav = true;
				}*/

		},

		//onAfterRendering : function () {
		/*	
			var handleToPanel = this.getView().byId("expandablePanelPOs") ;
			
			var height = $(window).height()*0.85 ;
			handleToPanel.setHeight(height+"px");
			
			$(window).resize(function () {
				var _height = $(window).height()*0.85 ;
				handleToPanel.setHeight(_height+"px");
			}) ;
		*/
		//},

		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// following row commented on 3-Nov-2017 due to router issue
			// oRouter.getRoute("routeManagePOs").attachMatched(this._onRouteMatched, this);
			// following row added on 3-Nov-2017 due to router issue
			oRouter.getRoute("targetManagePOs").attachMatched(this._onRouteMatched, this);
			this.getOwnerComponent().AppInstance.tablePOs = this.getView().byId("tableManagePOs");

			// code to get user language
			this.getOwnerComponent().AppInstance.sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			console.log("Language :" + this.getOwnerComponent().AppInstance.sCurrentLocale);
			//this.getOwnerComponent().AppInstance.tablePOs = this.getView().byId("tableManagePOs") ;

			/*if ((this.getOwnerComponent().getComponentData().startupParameters.PoId)) {
				console.log("in test section ");
				var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
				this.getOwnerComponent().AppInstance.lastSelected_POAction = "PO_ACTION__EDIT" ;
				this.getOwnerComponent().AppInstance.lastSelected_PONumber = startupParams.PoId;
				this.getOwnerComponent().AppInstance.lastSelected_POApprovalStatus = "In Release";
				//this.getOwnerComponent().AppInstance.modelGetPOs_Content.getProperty("StatusText", oEvent.getSource().getBindingContext()) ;
				//sap.ui.core.UIComponent.getRouterFor(this).navTo("targetHandlePO", { Command : "NAVIGATE" });
				oRouter.navTo("targetHandlePO", { Command : "NAVIGATE" }, true);
			}else{
				oRouter.getRoute("targetManagePOs").attachMatched(this._onRouteMatched, this);	
			}*/

		},

		clearAllFilters: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			var thisView = this.getView();
			var table = this.getOwnerComponent().AppInstance.tablePOs;

			/*Issue 42 table load issue. following 2 rows commented*/
			/*code change start 7 Nov 2017*/
			/*var AppInstance = this.getOwnerComponent().AppInstance ;
			AppInstance.tablePOs.setVisibleRowCount(AppInstance.modelGetPOs_Content.aBindings[0].oList.length);*/
			/*code change end*/

			var iColCounter = 0;
			table.clearSelection();
			var iTotalCols = table.getColumns().length;
			var oListBinding = table.getBinding();
			if (oListBinding) {
				oListBinding.aSorters = null;
				oListBinding.aFilters = null;
			}
			table.getModel().refresh(true);
			for (iColCounter = 0; iColCounter < iTotalCols; iColCounter++) {
				table.getColumns()[iColCounter].setSorted(false);
				table.getColumns()[iColCounter].setFilterValue("");
				table.getColumns()[iColCounter].setFiltered(false);
			}
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel("model__get_po_list").callFunction("/displayall", {
				method: "GET",
				urlParameters: {
					PO_ALL: "X"
				},

				success: function(oData, oResponse) {

					AppInstance.modelGetPOs_Content = new sap.ui.model.json.JSONModel();
					AppInstance.modelGetPOs_Content.setData(oData);

					thisView.setModel(AppInstance.modelGetPOs_Content);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {

				}
			});
		},

		// Edit existing Purchase Order
		runNavigationToEditPO: function(oEvent) {
			sap.ui.core.BusyIndicator.show();

			this.getOwnerComponent().AppInstance.lastSelected_POAction = "PO_ACTION__EDIT";

			this.getOwnerComponent().AppInstance.lastSelected_PONumber =
				this.getOwnerComponent().AppInstance.modelGetPOs_Content.getProperty("PoNumber", oEvent.getSource().getBindingContext());
			// following row added on 12-Dec-2017 due to approval status change enhacement
			this.getOwnerComponent().AppInstance.lastSelected_POApprovalStatus =
				this.getOwnerComponent().AppInstance.modelGetPOs_Content.getProperty("StatusText", oEvent.getSource().getBindingContext());
			// following row commented on 3-Nov-2017 due to router issue
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("routeHandlePO", { Command : "NAVIGATE" });
			// following row added on 3-Nov-2017 due to router issue
			sap.ui.core.UIComponent.getRouterFor(this).navTo("targetHandlePO", {
				Command: "NAVIGATE"
			});
		},

		// Copy Purchase Order
		runNavigationToCopyPO: function(oEvent) {
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().AppInstance.lastSelected_POAction = "PO_ACTION__COPY";

			var selectedIndices = this.getOwnerComponent().AppInstance.tablePOs.getSelectedIndices();
			var handle_to_this = this;

			if (selectedIndices.length < 1) {
				this.getOwnerComponent().AppInstance.displayMessage("No selection made in the POs table !");
				sap.ui.core.BusyIndicator.hide();
			} else {

				this.getOwnerComponent().getModel("model__get_po_list").read("/ZgetpotableSet", {
					success: function(oData, oResponse) {
						sap.ui.core.BusyIndicator.show();

						handle_to_this.getOwnerComponent().AppInstance.lastSelected_PONumber =
							handle_to_this.getOwnerComponent().AppInstance.tablePOs.getContextByIndex(selectedIndices[0]).getObject().PoNumber;
						// following row commented on 3-Nov-2017 due to router issue	  
						// sap.ui.core.UIComponent.getRouterFor(handle_to_this).navTo("routeHandlePO", { Command : "NAVIGATE" });
						// following row added on 3-Nov-2017 due to router issue
						sap.ui.core.UIComponent.getRouterFor(handle_to_this).navTo("targetHandlePO", {
							Command: "NAVIGATE"
						});
					}
				});
			}
		},

		// Create New Purchase Order
		runNavigationToNewPO: function(oEvent) {
			this.getOwnerComponent().AppInstance.lastSelected_POAction = "PO_ACTION__NEW";
			this.getOwnerComponent().AppInstance.lastSelected_PONumber = undefined;
			// following row commented on 3-Nov-2017 due to router issue	 
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("routeHandlePO", { Command : "NAVIGATE" });
			// following row added on 3-Nov-2017 due to router issue
			sap.ui.core.UIComponent.getRouterFor(this).navTo("targetHandlePO", {
				Command: "NAVIGATE"
			});
		}
	});
});