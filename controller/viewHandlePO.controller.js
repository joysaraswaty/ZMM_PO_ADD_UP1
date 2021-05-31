sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/format/NumberFormat",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"jquery.sap.global",
	"sap/ui/model/Filter"

], function(Controller, History, NumberFormat, MessageToast, MessageBox, jQuery, Filter) {
	"use strict";

	return Controller.extend("PurchaseOrdersPurchaseOrders.controller.viewHandlePO", {

		onInit: function() {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// following row commented on 3-Nov-2017 due to router issue
			// oRouter.getRoute("routeHandlePO").attachMatched(this._onRouteMatched, this);
			// following row added on 3-Nov-2017 due to router issue
			oRouter.getRoute("targetHandlePO").attachMatched(this._onRouteMatched, this);
			//this.getOwnerComponent().addDependent(this);

			this.AppInstance = this.getOwnerComponent().AppInstance;
			this.getView().byId("tabBar_ItemData").setSelectedKey("address");

		},

		formatDate: function(oValue) {

			var date = undefined;

			if (!oValue)
				date = new Date(Date.now());
			else
				date = new Date(oValue);

			var day = date.getDate();
			var month = date.getMonth();
			var year = date.getFullYear();

			return year + "-" + (month + 1) + "-" + day;
		},

		formatBoolean: function(oValue) {
			return oValue;
		},

		format_2DigitsDecimalNumber: function(inputValue) {
			if ((inputValue) && (inputValue !== "") && (inputValue !== undefined)) {
				inputValue = inputValue.toString();
				if (inputValue)
					if (inputValue.indexOf('.') != -1) {
						var places = inputValue.length - inputValue.indexOf('.') - 1;
						if (places >= 2) {
							var num = parseFloat(inputValue);
							if (num % 1 > 0)
								inputValue = num.toFixed(2);
							else
								inputValue = parseInt(num);
						}
					}
			}

			return inputValue;
		},

		isFinalDeliveryEnabled: function(oSource) {
			return ((this.getOwnerComponent().AppInstance.lastSelected_POAction === "PO_ACTION__EDIT") &&
				!(oSource.results[0].DeleteInd === "L"));
		},

		navBackToPOsList: function() {
			// following one line added due to addition of the plant field in header 4 Dec 2017
			this.getView().byId("plantHeader").setValue("");
			// following row added on 12-Dec-2017 due to approval status change enhacement
			if (this.getOwnerComponent().AppInstance.lastSelected_POApprovalStatus === "Rejected") {
				this.getView().byId("labelRevRej").setVisible(false);
				this.getView().byId("boxRrevRej").setSelected(false);
				this.getView().byId("boxRrevRej").setVisible(false);
			}
			//below two lines are added as part of Information Button on header durin only edit, hence reverting to false

			this.getView().byId("idInformationLabel").setVisible(false);
			this.getView().byId("idInformationButton").setVisible(false);
			this.getView().byId("idInformationButton").setEnabled(false);

			this.getOwnerComponent().AppInstance.navBack();

		},

		deliveryDateChange: function(oEvent) {
			// Getting the new selected date value
			var selectedDateStringValue = oEvent.getParameters().value;
			// The format specified in the XML definition of the m:DatePicker is : valueFormat="MM.dd.yyyy"
			// so this is the pattern used to parse the new selected value
			var newDate = new Date(
				selectedDateStringValue.substr(6, 4), // ...  year
				(parseInt(selectedDateStringValue.substr(0, 2), 10) - 1).toString(), // ... month
				selectedDateStringValue.substr(3, 2) // ... day
			);
			// Setting the new date and refreshing model
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/DeliveryDate", newDate);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		formatIsDocumentTypeFieldEnabled: function() {
			if (this.getOwnerComponent().AppInstance.lastSelected_POAction === "PO_ACTION__NEW")
				return true;
			else
				return false;
		},

		formatIsEmptyHeaderValue: function(value_key, value_text) {
			if (!value_key) {
				if (!value_text)
					return "";
				else
					return value_text;
			} else {
				if (!value_text)
					return "(" + value_key + ")";
				else
					return value_text + " (" + value_key + ")";
			}
		},

		fn_IsSubItemsColumnEnabled_Quantity: function(oEvent) {
			return this.getOwnerComponent().AppInstance.selectedDistributionIsQuantity;
		},

		fn_IsSubItemsColumnEnabled_Percentage: function(oEvent) {
			return this.getOwnerComponent().AppInstance.selectedDistributionIsPercentage;
		},

		fn_IsSubItemsColumnEnabled_CostCenter: function(oEvent) {
			return (this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + this.getOwnerComponent().AppInstance.lastSelected_ItemRowIndex +
				"/Acctasscat") === "K");
		},

		fn_IsSubItemsColumnEnabled_Order: function(oEvent) {
			return (this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + this.getOwnerComponent().AppInstance.lastSelected_ItemRowIndex +
				"/Acctasscat") === "F");
		},

		onInformationPress: function() {
			if (this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData().results[0].Ztstring_exp === "") {
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.show(
					"No Data Found.", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Item Text Details",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {

						}
					}
				);
			} else {
				var informationData = JSON.parse(this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData().results[0].Ztstring_exp);

				var informationModel = new sap.ui.model.json.JSONModel();
				informationModel.setData(informationData);
				this.getView().setModel(informationModel, "information");

				var oView = this.getView();
				var oDialog = oView.byId("informationDialog");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(oView.getId(), "PurchaseOrdersPurchaseOrders.view.fragmentInformation", this);
					oView.addDependent(oDialog);
				}
				oDialog.open();
			}
		},

		onInformationCloseDialog: function() {
			this.getView().byId("informationDialog").close();
		},
		// ****************************************************************************************************
		// Entering the Screen
		// ****************************************************************************************************

		_onRouteMatched: function(oEvent) {
			//alert("Matched called on loading");
			var oArgs = oEvent.getParameter("arguments").Command;
			var AppInstance = this.AppInstance;
			var _this = this;

			this.getView().setModel(new sap.ui.model.json.JSONModel({}));
			this.readAttachment();
			// Attachment data read
			// var po = this.getView().byId("inputPONumber").getValue();

			// --- Setting up scroll bar for page and bottom position for fixed footer
			function func_CheckIfPageElement(x) {
				if (x.hasOwnProperty('sId'))
					if (x['sId'].startsWith("__page"))
						return true;
				return false;
			}

			var handleToThisPageElement = sap.ui.getCore().byId(this.getView().getContent().filter(func_CheckIfPageElement)[0]['sId']);
			handleToThisPageElement.addStyleClass("scrollablePage");
			handleToThisPageElement.getFooter().addStyleClass("sapMPageFixedBottomFooter");
			// --- Done setting up

			AppInstance.lastSelected_ForNewItem_UM_PoUnit = "";
			AppInstance.lastSelected_ForNewItem_UM_PoUnitText = "";
			AppInstance.lastSelected_ForNewItem_Plant_Plant = "";
			AppInstance.lastSelected_ForNewItem_Plant_PlantText = "";

			//if (!AppInstance.handle_to_HandlePOView )
			AppInstance.handle_to_HandlePOView = this.getView();

			AppInstance.handle_to_HandlePOView.byId("inputDocumentType").setValueState(sap.ui.core.ValueState.None);
			AppInstance.handle_to_HandlePOView.byId("inputCompanyCode").setValueState(sap.ui.core.ValueState.None);
			AppInstance.handle_to_HandlePOView.byId("inputPurchasingOrganization").setValueState(sap.ui.core.ValueState.None);
			AppInstance.handle_to_HandlePOView.byId("inputSupplier").setValueState(sap.ui.core.ValueState.None);
			AppInstance.handle_to_HandlePOView.byId("inputPurchasingGroup").setValueState(sap.ui.core.ValueState.None);
			AppInstance.handle_to_HandlePOView.byId("inputCurrency").setValueState(sap.ui.core.ValueState.None);
			AppInstance.handle_to_HandlePOView.byId("inputRequisitioner").setValueState(sap.ui.core.ValueState.None);
			AppInstance.handle_to_HandlePOView.byId("inputEmail").setValueState(sap.ui.core.ValueState.None);

			//if ( !AppInstance.tablePOItems ) {
			AppInstance.tablePOItems = sap.ui.core.Fragment.byId(this.getView().createId("fragmentItemData_GeneralData"), "tablePOItems");

			//}

			//if ( !AppInstance.tablePOAddress ) {
			AppInstance.tablePOAddress = sap.ui.core.Fragment.byId(this.getView().createId("fragmentItemData_DeliveryAddress"),
				"tablePOAddress");

			//Added as part of new tab enhancement dec 2018
			AppInstance.tablePOText = sap.ui.core.Fragment.byId(this.getView().createId("fragmentItemData_ItemText"),
				"tablePOText");

			//}

			AppInstance.tablePOSubItems = this.getView().byId("tablePOSubItems");

			AppInstance.tableItemHistory = this.getView().byId("tableItemHistory");

			if (!AppInstance.tablePOSubItems) {
				AppInstance.tablePOSubItems = sap.ui.core.Fragment.byId(this.getView().createId("fragmentDistributionManagement"),
					"tablePOSubItems");
			}

			//if ( !AppInstance.dialogSubItems ) {
			AppInstance.dialogSubItems = AppInstance.handle_to_HandlePOView.byId("dialogSubItems");
			this.getView().addDependent(AppInstance.dialogSubItems);
			//}

			//if ( !AppInstance.dialogItemHistory ) {
			AppInstance.dialogItemHistory = AppInstance.handle_to_HandlePOView.byId("dialogItemHistory");
			this.getView().addDependent(AppInstance.dialogItemHistory);
			//}

			// Header Input - PO Number
			AppInstance.__inputPONumber = AppInstance.handle_to_HandlePOView.byId("inputPONumber");

			// Header Input - Document Type
			AppInstance.__inputDocumentType = AppInstance.handle_to_HandlePOView.byId("inputDocumentType");
			AppInstance.__inputDocumentType.setBusyIndicatorDelay(0);
			AppInstance.__inputDocumentType.onsaptabnext = AppInstance.__inputDocumentType.onsapenter;

			// Header Input - Company Code
			AppInstance.__inputCompanyCode = AppInstance.handle_to_HandlePOView.byId("inputCompanyCode");
			AppInstance.__inputCompanyCode.setBusyIndicatorDelay(0);
			AppInstance.__inputCompanyCode.onsaptabnext = AppInstance.__inputCompanyCode.onsapenter;

			// Header Input - Purchasing Organisation
			AppInstance.__inputPurchasingOrganization = AppInstance.handle_to_HandlePOView.byId("inputPurchasingOrganization");
			AppInstance.__inputPurchasingOrganization.setBusyIndicatorDelay(0);
			AppInstance.__inputPurchasingOrganization.onsaptabnext = AppInstance.__inputPurchasingOrganization.onsapenter;

			// Header Input - Supplier
			AppInstance.__inputSupplier = AppInstance.handle_to_HandlePOView.byId("inputSupplier");
			AppInstance.__inputSupplier.setBusyIndicatorDelay(0);
			AppInstance.__inputSupplier.onsaptabnext = AppInstance.__inputSupplier.onsapenter;

			// Header Input - Purchasing Group
			AppInstance.__inputPurchasingGroup = AppInstance.handle_to_HandlePOView.byId("inputPurchasingGroup");
			AppInstance.__inputPurchasingGroup.setBusyIndicatorDelay(0);
			AppInstance.__inputPurchasingGroup.onsaptabnext = AppInstance.__inputPurchasingGroup.onsapenter;

			// Header Input - Total PO Value
			AppInstance.__inputTotalPOValue = AppInstance.handle_to_HandlePOView.byId("inputTotalPOValue");

			// Header Input - Payment Terms
			AppInstance.__inputPaymentTerms = AppInstance.handle_to_HandlePOView.byId("inputPaymentTerms");

			// Header Input - Currency
			AppInstance.__inputCurrency = AppInstance.handle_to_HandlePOView.byId("inputCurrency");
			AppInstance.__inputCurrency.setBusyIndicatorDelay(0);
			AppInstance.__inputCurrency.onsaptabnext = AppInstance.__inputCurrency.onsapenter;

			// Header Input - Requisitioner
			AppInstance.__inputRequisitioner = AppInstance.handle_to_HandlePOView.byId("inputRequisitioner");
			AppInstance.__inputRequisitioner.setBusyIndicatorDelay(0);
			AppInstance.__inputRequisitioner.onsaptabnext = AppInstance.__inputRequisitioner.onsapenter;

			// Header Input - EMail
			AppInstance.__inputEmail = AppInstance.handle_to_HandlePOView.byId("inputEmail");

			// Header Input - Approver
			AppInstance.__inputApprover = AppInstance.handle_to_HandlePOView.byId("inputApprover");

			/*following line changed due to addition of Header Text field in header 7 feb 2018*/
			AppInstance.__inputHeaderText = AppInstance.handle_to_HandlePOView.byId("HeaderText");

			// below three lines added as part of back navigation
			_this.getView().byId("idInformationLabel").setVisible(false);
			_this.getView().byId("idInformationButton").setVisible(false);
			_this.getView().byId("idInformationButton").setEnabled(false);

			if (AppInstance.lastSelected_POAction === "PO_ACTION__NEW") {

				AppInstance.lastSelected_PONumber = "";

				AppInstance.CurrentMODEL_Header = new sap.ui.model.json.JSONModel();
				AppInstance.CurrentMODEL_Header.setData(JSON.parse(
					'{"PoNumber":"","PoItem":"00000","Vendor":"","Vendorname":"","DocType":"","DocTypetxt":"","CompCode":"","CompCodetxt":"","PurchOrg":"","PurchOrgtxt":"","Currency":"","Pmnttrms":"","Pmnttrmstxt":"","PurGroup":"","PurGrouptxt":"","PreqName":"","PreqNametxt":"","Customer":"","CustomerName":"","AddrNo":"","EMail":"","CreatedBy":"","TotalValue":"0.00","ContrArea":"","Input1":"","Input2":"","Input3":"","Input4":"","Input5":"","Input6":"","Input7":"","Input8":"","Input9":"","Input10":"","Input11":"","Input12":"","Input13":"","Input14":"","Input15":"","Input16":"","Input17":"","Input18":"","Input19":"","Input20":"","Ktopl":""}'
				));

				AppInstance.CurrentMODEL_Header.setProperty("/PoNumber", "");

				_this.fn_After_RequisitionerSelected();

				AppInstance.CurrentMODEL_Header.refresh(true);

				//$.get("model/PoItem.json").complete(function(content){
				AppInstance.CurrentMODEL_Items = new sap.ui.model.json.JSONModel();

				//var newItemJSON = content.responseJSON ;

				var selectedDocumentType = AppInstance.CurrentMODEL_Header.getProperty("/DocType");

				var _row_AccAss = "";
				var _row_AccAssTxt = "";
				var _row_ItemCat = "";
				var _row_ItemCatTxt = "";

				var _row_AU = AppInstance.lastSelected_ForNewItem_UM_PoUnit;
				var _row_AUTxt = AppInstance.lastSelected_ForNewItem_UM_PoUnitText;
				var _row_Plant = AppInstance.lastSelected_ForNewItem_Plant_Plant;
				var _row_PlantTxt = AppInstance.lastSelected_ForNewItem_Plant_PlantText;

				var _rowQuantity = "";

				if (selectedDocumentType === "NB2") {
					_row_AccAss = "K";
					_row_AccAssTxt = "Cost Center";
					_row_ItemCat = "";
					_row_ItemCatTxt = "Standard";
				} else
				if (selectedDocumentType === "NB2D") {
					_row_AccAss = "K";
					_row_AccAssTxt = "Cost Center";
					_row_ItemCat = "D";
					_row_ItemCatTxt = "Service";
					// Issue 50 language translation
					if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
						_row_AU = "LE";
						_row_AUTxt = "LE";
					} else {
						_row_AU = "AU";
						_row_AUTxt = "AU";
					}
					// Issue 50 end
					_rowQuantity = "1";
				} else
				if (selectedDocumentType === "NB3") {
					_row_AccAss = "L";
					_row_AccAssTxt = "Limit";
					_row_ItemCat = "B";
					_row_ItemCatTxt = "Limit";
					// Issue 50 language translation
					if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
						_row_AU = "LE";
						_row_AUTxt = "LE";
					} else {
						_row_AU = "AU";
						_row_AUTxt = "AU";
					}
					// Issue 50 end
					_rowQuantity = "1";
				}
				// issue 48 start
				else
				if (selectedDocumentType === "NB2Z") {
					_row_AccAss = "Z";
					_row_AccAssTxt = "Int Order";
					_row_ItemCat = "";
					_row_ItemCatTxt = "Standard";
				} else
				if (selectedDocumentType === "N2ZD") {
					_row_AccAss = "Z";
					_row_AccAssTxt = "Int Order";
					_row_ItemCat = "D";
					_row_ItemCatTxt = "Service";
					// Issue 50 language translation
					if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
						_row_AU = "LE";
						_row_AUTxt = "LE";
					} else {
						_row_AU = "AU";
						_row_AUTxt = "AU";
					}
					// Issue 50 end
					_rowQuantity = "1";
				} else
				if (selectedDocumentType === "NB3Z") {
					_row_AccAss = "L";
					_row_AccAssTxt = "Limit";
					_row_ItemCat = "B";
					_row_ItemCatTxt = "Limit";
					// Issue 50 language translation
					if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
						_row_AU = "LE";
						_row_AUTxt = "LE";
					} else {
						_row_AU = "AU";
						_row_AUTxt = "AU";
					}
					// Issue 50 end
					_rowQuantity = "1";
				} else
				if (selectedDocumentType === "NB2F") {
					_row_AccAss = "F";
					_row_AccAssTxt = "Order";
					_row_ItemCat = "";
					_row_ItemCatTxt = "Standard";
				}
				//Issue 48 end
				;

				// following line commented for adding the plant field in header 4 Dec 2017
				//var newItemJSON = JSON.parse('{"results":[{"PoNumber":"","PoItem":"","DeleteInd":"","ShortText":"","Quantity":"","Acctasscat":"'+_row_AccAss+'","Acctasscattxt":"'+_row_AccAssTxt+'","ItemCat":"'+_row_ItemCat+'","ItemCattxt":"'+_row_ItemCatTxt+'","MatlGroup":"","MatlGrouptxt":"","Plant":"","Planttxt":"","PoUnit":"","PoUnittxt":"","DeliveryDate":"","SchedLine":"","NetPrice":"","PriceUnit":"","Currency":"","OrderprUn":"","ItemValue":"","Distrib":"","Costcenter":"","AssetNo":"","Orderid":"","GlAccount":"","Costcentertxt":"","AssetNotxt":"","GlAccounttxt":"","Orderidtxt":"","PreqName":"","PckgNo":"","Limit":"","ExpValue":"","BaseUom":"","GrPrice":"","SerialNo":"","Distribkey":"","Input1":"","Input2":"","Input3":"","Input4":"","Input5":"","Input6":"","Input7":"","Input8":"","Input9":"","Input10":"","Input11":"","Input12":"","Input13":"","Input14":"","Input15":"","Input16":"","Input17":"","Input18":"","Input19":"","Input20":"","Finalinvoice":"","Delivcompleted":"","Rejection":"","Zaddress":"","Zaccount":""}]}').results[0];
				//Issue 49 start , Fill Input1 field with doc type
				/*var newItemJSON = JSON.parse('{"results":[{"PoNumber":"","PoItem":"","DeleteInd":"","ShortText":"","Quantity":"'+_rowQuantity+'","Acctasscat":"'+_row_AccAss+'","Acctasscattxt":"'+_row_AccAssTxt+'","ItemCat":"'+_row_ItemCat+'","ItemCattxt":"'+_row_ItemCatTxt+'","MatlGroup":"","MatlGrouptxt":"","Plant":"'+_row_Plant+'","Planttxt":"'+_row_PlantTxt+'","PoUnit":"'+_row_AU+'","PoUnittxt":"'+_row_AUTxt+'","DeliveryDate":"","SchedLine":"","NetPrice":"","PriceUnit":"","Currency":"","OrderprUn":"","ItemValue":"","Distrib":"","Costcenter":"","AssetNo":"","Orderid":"","GlAccount":"","Costcentertxt":"","AssetNotxt":"","GlAccounttxt":"","Orderidtxt":"","PreqName":"","PckgNo":"","Limit":"","ExpValue":"","BaseUom":"","GrPrice":"","SerialNo":"","Distribkey":"","Input1":"","Input2":"","Input3":"","Input4":"","Input5":"","Input6":"","Input7":"","Input8":"","Input9":"","Input10":"","Input11":"","Input12":"","Input13":"","Input14":"","Input15":"","Input16":"","Input17":"","Input18":"","Input19":"","Input20":"","Finalinvoice":"","Delivcompleted":"","Rejection":"","Zaddress":"","Zaccount":""}]}');*/
				var newItemJSON = JSON.parse('{"results":[{"PoNumber":"","PoItem":"","DeleteInd":"","ShortText":"","Quantity":"' + _rowQuantity +
					'","Acctasscat":"' + _row_AccAss + '","Acctasscattxt":"' + _row_AccAssTxt + '","ItemCat":"' + _row_ItemCat + '","ItemCattxt":"' +
					_row_ItemCatTxt + '","MatlGroup":"","MatlGrouptxt":"","Plant":"' + _row_Plant + '","Planttxt":"' + _row_PlantTxt +
					'","PoUnit":"' + _row_AU + '","PoUnittxt":"' + _row_AUTxt +
					'","DeliveryDate":"","SchedLine":"","NetPrice":"","PriceUnit":"","Currency":"","OrderprUn":"","ItemValue":"","Distrib":"","Costcenter":"","AssetNo":"","Orderid":"","GlAccount":"","Costcentertxt":"","AssetNotxt":"","GlAccounttxt":"","Orderidtxt":"","PreqName":"","PckgNo":"","Limit":"","ExpValue":"","BaseUom":"","GrPrice":"","SerialNo":"","Distribkey":"","Input1":"' +
					selectedDocumentType +
					'","itemTextTab":"","Input2":"","Input3":"","Input4":"","Input5":"","Input6":"","Input7":"","Input8":"","Input9":"","Input10":"","Input11":"","Input12":"","Input13":"","Input14":"","Input15":"","Input16":"","Input17":"","Input18":"","Input19":"","Input20":"","Finalinvoice":"","Delivcompleted":"","Rejection":"","Zaddress":"","Zaccount":"", "valueStateFlag":false}]}'
				);
				//Issue 49 End

				//console.log('{"results":[{"PoNumber":"","PoItem":"","DeleteInd":"","ShortText":"","Quantity":"","Acctasscat":"'+_row_AccAss+'","Acctasscattxt":"'+_row_AccAssTxt+'","ItemCat":"'+_row_ItemCat+'","ItemCattxt":"'+_row_ItemCatTxt+'","MatlGroup":"","MatlGrouptxt":"","Plant":"'+_row_Plant+'","Planttxt":"'+_row_PlantTxt+'","PoUnit":"'+_row_AU+'","PoUnittxt":"'+_row_AUTxt+'","DeliveryDate":"","SchedLine":"","NetPrice":"","PriceUnit":"","Currency":"","OrderprUn":"","ItemValue":"","Distrib":"","Costcenter":"","AssetNo":"","Orderid":"","GlAccount":"","Costcentertxt":"","AssetNotxt":"","GlAccounttxt":"","Orderidtxt":"","PreqName":"","PckgNo":"","Limit":"","ExpValue":"","BaseUom":"","GrPrice":"","SerialNo":"","Distribkey":"","Input1":"","Input2":"","Input3":"","Input4":"","Input5":"","Input6":"","Input7":"","Input8":"","Input9":"","Input10":"","Input11":"","Input12":"","Input13":"","Input14":"","Input15":"","Input16":"","Input17":"","Input18":"","Input19":"","Input20":"","Finalinvoice":"","Delivcompleted":"","Rejection":"","Zaddress":"","Zaccount":""}]}');
				console.log(newItemJSON);
				//if (AppInstance.CurrentMODEL_Header.getProperty("/Currency")) ;

				var lastLine = "00010";
				newItemJSON.results[0].PoItem = lastLine;
				newItemJSON.results[0].DeleteInd = "";
				newItemJSON.results[0].PriceUnit = 1;
				newItemJSON.results[0].DeliveryDate = new Date();
				newItemJSON.results[0].Currency = AppInstance.CurrentMODEL_Header.getProperty("/Currency");
				//Issue 48 23 July 2018
				/*newItemJSON.results[0].Zaccount = "{\"ITEMS\" : [{ \"PO_NUMBER\":\"\",\"PO_ITEM\":\""+lastLine+"\",\"SERIAL_NO\":\"01\",\"QUANTITY\":\""+_rowQuantity+"\",\"DISTR_PERC\":\"0.0\",\"NET_VALUE\":\"\",\"COSTCENTER\":\"\",\"ASSET_NO\":\"\",\"ORDERID\":\"\",\"GL_ACCOUNT\":\"\",\"COSTCENTERTXT\":\"\",\"ASSET_NOTXT\":\"\",\"GL_ACCOUNTTXT\":\"\",\"ORDERIDTXT\":\"\",\"ACTION\":\"\",\"INPUT1\":\"\",\"INPUT2\":\"\",\"INPUT3\":\"\",\"INPUT4\":\"\",\"INPUT5\":\"\",\"INPUT6\":\"\",\"INPUT7\":\"\",\"INPUT8\":\"\",\"INPUT9\":\"\",\"INPUT10\":\"\",\"NUMERIC1\":\"0.0\",\"NUMERIC2\":\"0.0\",\"NUMERIC3\":\"0.0\" }]}";*/
				newItemJSON.results[0].Zaccount = "{\"ITEMS\" : [{ \"PO_NUMBER\":\"\",\"PO_ITEM\":\"" + lastLine +
					"\",\"SERIAL_NO\":\"01\",\"QUANTITY\":\"" + _rowQuantity +
					"\",\"DISTR_PERC\":\"0.0\",\"NET_VALUE\":\"\",\"COSTCENTER\":\"\",\"ASSET_NO\":\"\",\"ORDERID\":\"\",\"GL_ACCOUNT\":\"\",\"COSTCENTERTXT\":\"\",\"ASSET_NOTXT\":\"\",\"GL_ACCOUNTTXT\":\"\",\"ORDERIDTXT\":\"\",\"ACTION\":\"\",\"INPUT1\":\"" +
					selectedDocumentType +
					"\",\"INPUT2\":\"\",\"INPUT3\":\"\",\"INPUT4\":\"\",\"INPUT5\":\"\",\"INPUT6\":\"\",\"INPUT7\":\"\",\"INPUT8\":\"\",\"INPUT9\":\"\",\"INPUT10\":\"\",\"NUMERIC1\":\"0.0\",\"NUMERIC2\":\"0.0\",\"NUMERIC3\":\"0.0\" }]}";
				newItemJSON.results[0].Zaddress = "{\"ITEMS\" : [] }";
				newItemJSON.results[0].Distribkey = "0";
				newItemJSON.results[0].itemTextTab = "";
				AppInstance.CurrentMODEL_Items.setData(newItemJSON);

				/*beware of qunatity
				var zAccStr = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/0/Zaccount") ;
				var tempJSON = JSON.parse(zAccStr);
				tempJSON.ITEMS[0].QUANTITY = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/0/Quantity") ;
				this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/0/Zaccount",JSON.stringify(tempJSON));
				****/

				AppInstance.tablePOItems.setModel(AppInstance.CurrentMODEL_Items);
				AppInstance.tablePOItems.bindRows({
					path: "/results"
				});
				AppInstance.tablePOItems.setVisibleRowCount(AppInstance.CurrentMODEL_Items.getData().results.length);

				AppInstance.tablePOAddress.setModel(AppInstance.CurrentMODEL_Items);
				AppInstance.tablePOAddress.bindRows({
					path: "/results"
				});
				AppInstance.tablePOAddress.setVisibleRowCount(AppInstance.CurrentMODEL_Items.getData().results.length);

				//added below two lines as part of new tab enhancment dec 2018
				AppInstance.tablePOText.setModel(AppInstance.CurrentMODEL_Items);
				AppInstance.tablePOText.bindRows({
					path: "/results"
				});
				AppInstance.tablePOText.setVisibleRowCount(AppInstance.CurrentMODEL_Items.getData().results.length);

				AppInstance.CurrentMODEL_Items.refresh(true);

				var allRows = AppInstance.tablePOItems.getRows();
				var lastRow = allRows[allRows.length - 1];
				lastRow.getCells().forEach(function(cell) {
					if (cell.getMetadata().getName() === "sap.m.Input") {
						cell.onsaptabnext = cell.onsapenter;
					}
				});

				AppInstance.handle_to_HandlePOView.byId("buttonSubmit").setEnabled(true);
				AppInstance.handle_to_HandlePOView.byId("buttonUpdate").setEnabled(false);
				//AppInstance.handle_to_HandlePOView.byId("buttonSimulate").setEnabled(true);

				sap.ui.core.BusyIndicator.hide();

				//}) ;

				AppInstance.__inputPONumber.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputDocumentType.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputCompanyCode.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputPurchasingOrganization.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputSupplier.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputPurchasingGroup.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputTotalPOValue.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputPaymentTerms.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputCurrency.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputRequisitioner.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputEmail.setModel(AppInstance.CurrentMODEL_Header);
				AppInstance.__inputApprover.setModel(AppInstance.CurrentMODEL_Header);
				/*following line changed due to addition of Header Text field in header 7 feb 2018*/
				AppInstance.__inputHeaderText.setModel(AppInstance.CurrentMODEL_Header);

				// following row added on 12-Dec-2017 due to approval status change enhacement
				_this.getView().byId("labelRevRej").setVisible(false);
				_this.getView().byId("boxRrevRej").setVisible(false);
				// following one line added due to addition of the plant field in header 4 Dec 2017
				this.getView().byId("plantHeader").setValue("");

			} else {
				var _this = this;
				// for adding the plant field in header 4 Dec 2017
				var plModel = new sap.ui.model.json.JSONModel();

				// Getting Header

				this.getOwnerComponent().getModel("model__transfer_po").read("/ZtgetpoheaderSet", {
					filters: [new sap.ui.model.Filter("PoNumber", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.lastSelected_PONumber),
						new sap.ui.model.Filter("PoItem", sap.ui.model.FilterOperator.EQ, "00000")
					],
					success: function(oData, oResponse) {
						console.log("Continutul transferului de HEADER : ");
						console.log(oData);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header = new sap.ui.model.json.JSONModel();
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setData(oData.results[0]);

						if ((_this.getOwnerComponent().AppInstance.lastSelected_POAction === "PO_ACTION__COPY") ||
							(_this.getOwnerComponent().AppInstance.lastSelected_POAction === "PO_ACTION__EDIT")) {
							if (_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType") === "") {
								jQuery.sap.require("sap.m.MessageBox");
								sap.m.MessageBox.show(
									"Unable to load PO with incomplete data", {
										icon: sap.m.MessageBox.Icon.INFORMATION,
										title: "Message",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function(oAction) {
											_this.getOwnerComponent().AppInstance.navBack();
										}
									}
								);

							}
						}

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/TotalValue", 0.00);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);

						if (_this.getOwnerComponent().AppInstance.lastSelected_POAction === "PO_ACTION__COPY") {
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PoNumber", "");
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Input2", "");

							//below line added to hide the  header comments section
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Ztstring_exp", "");
							_this.getOwnerComponent().AppInstance.handle_to_HandlePOView.byId("idInformationLabel").setVisible(false);
							_this.getOwnerComponent().AppInstance.handle_to_HandlePOView.byId("idInformationButton").setVisible(false);
							_this.getOwnerComponent().AppInstance.handle_to_HandlePOView.byId("idInformationButton").setEnabled(false);

							_this.getOwnerComponent().AppInstance.handle_to_HandlePOView.byId("buttonSubmit").setEnabled(true);
							_this.getOwnerComponent().AppInstance.handle_to_HandlePOView.byId("buttonUpdate").setEnabled(false);
							//_this.getOwnerComponent().AppInstance.handle_to_HandlePOView.byId("buttonSimulate").setEnabled(false);
						} else {
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PoNumber", _this.getOwnerComponent().AppInstance.lastSelected_PONumber);

							_this.getOwnerComponent().AppInstance.handle_to_HandlePOView.byId("buttonSubmit").setEnabled(false);
							_this.getOwnerComponent().AppInstance.handle_to_HandlePOView.byId("buttonUpdate").setEnabled(true);
							//_this.getOwnerComponent().AppInstance.handle_to_HandlePOView.byId("buttonSimulate").setEnabled(false);

							//below two lines added as part of Information button in header during edit PO
							/*							_this.getView().byId("idInformationLabel").setVisible(true);
														_this.getView().byId("idInformationButton").setVisible(true);*/

						}

						_this.getOwnerComponent().AppInstance.__inputPONumber.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputDocumentType.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputCompanyCode.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputPurchasingOrganization.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputSupplier.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputPurchasingGroup.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputTotalPOValue.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputPaymentTerms.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputCurrency.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputRequisitioner.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputEmail.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						_this.getOwnerComponent().AppInstance.__inputApprover.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						/*following line changed due to addition of Header Text field in header 7 feb 2018*/
						_this.getOwnerComponent().AppInstance.__inputHeaderText.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Header);

						// ***
						// Looking for the plant coresponding to the specified Company Code
						_this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetplantSet", {

							filters: [new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
								.getProperty("/CompCode"))],
							success: function(_oData, _oResponse) {
								if (oData.results.length > 0) {
									_this.getOwnerComponent().AppInstance.lastSelected_ForNewItem_Plant_Plant = _oData.results[0].Plant;
									_this.getOwnerComponent().AppInstance.lastSelected_ForNewItem_Plant_PlantText = _oData.results[0].Name1;
									/*following line added due to addition of the plant field in header 4 Dec 2017
									_this.getView().byId("plantHeader").setValue(_oData.results[0].Plant);
									we do not need to set value of plangt in header section here , it causes the selection of first filed from plant f4 help
									_this.getView().byId("plantHeader").setValue(_this.getOwnerComponent().AppInstance.lastSelected_ForNewItem_Plant_Plant);*/
								} else {}
							},
							error: function(_error) {}
						});

						// ***	                            	

						// ***
						// Looking for default unit of measure coresponding to the specified Purchasing Organization
						/*if (_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType") === "NB2")*/
						/*Issue 48 If condition changed 1 Aug 2018*/
						/*If doc type is NB2F of NB2Z or N2ZD you should call it still with NB2. NB2F and NB2Z and N2ZD exists only in Fiori but not in SAP. 
						Also when we post we need to pass NB2 and not NB2F or NB2Z or N2ZD.*/
						if (_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType") === "NB2" ||
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType") === "NB2Z" ||
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType") === "NB2F" ||
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType") === "N2ZD")
							_this.getOwnerComponent().getModel("model__f4_functions").read("/Ztgetpounit1Set", {

								filters: [
									new sap.ui.model.Filter("PurOrg", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
										.getProperty("/PurchOrg")),
									/*new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType"))*/
									new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, "NB2")
								],
								success: function(__oData, __oResponse) {
									if (oData.results.length > 0) {
										_this.getOwnerComponent().AppInstance.lastSelected_ForNewItem_UM_PoUnit = __oData.results[0].PoUnit;
										_this.getOwnerComponent().AppInstance.lastSelected_ForNewItem_UM_PoUnitText = __oData.results[0].Msehl;
									} else {}
								},
								error: function(__error) {}
							});

						// ***

					},
					error: function(error) {
						_this.getOwnerComponent().AppInstance.displayMessage(error);
						sap.ui.core.BusyIndicator.hide();
					}
				});

				// Getting Items					
				this.getOwnerComponent().getModel("model__transfer_po").read("/ZtgetpoitemNewSet", {
					filters: [new sap.ui.model.Filter("PoNumber", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.lastSelected_PONumber)],

					success: function(oData, oResponse) {
						console.log("Continutul transferului de ITEMS : ");
						console.log(oData);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items = new sap.ui.model.json.JSONModel();

						var itemsData = oData;
						itemsData.results.forEach(function(_item_element) {
							if ((_item_element.ItemCat === "D") || (_item_element.ItemCat === "9")) {
								_item_element.Limit = _item_element.NetPrice;
							}
						});

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);

						//Below code is added on 20/12/2018 for Issue 72, To add new tab in items area and display item text
						// Item text is extracted from the field Ztstring_str from first line on element.

						for (var c = 0; c < itemsData.results.length; c++)
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + c + "/itemTextTab", ""); //setting the property to empty if no po item text exists

						if (itemsData.results.length > 0) {
							var itemTextData = [];
							if (itemsData.results[0].Ztstring_str !== "") {
								var itemDataJson = JSON.parse(itemsData.results[0].Ztstring_str);
								for (var i = 0; i < itemsData.results.length; i++) {
									itemTextData[i] = "";
									for (var j = 0; j < itemDataJson.ITEMS.length; j++) {
										if (itemDataJson.ITEMS[j].POITEM === itemsData.results[i].PoItem) {
											itemTextData[i] += itemDataJson.ITEMS[j].ITEMTEXT;
											itemTextData[i] += "\n";
										}
									}
									_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + i + "/itemTextTab", itemTextData[i]);
									console.log("itemTextData during first load  :" + itemTextData[i]);
								}
							}
						}

						//		_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/0/itemTextTab", display[0]);
						//	_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/1/itemTextTab", display[1]);

						//end of issue 72

						AppInstance.lastFetchedItemIndexInCurrentPO_POItem = oData.results[oData.results.length - 1].PoItem;

						var newPOValue = 0.0;
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData().results.forEach(function(element) {
							newPOValue = newPOValue + parseFloat(element.ItemValue);
						});

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/TotalValue", newPOValue.toFixed(2));
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);

						// Getting first item to extract the default Plant Address
						var firstItem = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData().results[0];

						_this.getOwnerComponent().AppInstance.defaultPlantAddres_Name = firstItem.Name;
						_this.getOwnerComponent().AppInstance.defaultPlantAddres_Street = firstItem.Street;
						_this.getOwnerComponent().AppInstance.defaultPlantAddres_StreetNo = firstItem.StreetNo;
						_this.getOwnerComponent().AppInstance.defaultPlantAddres_PostlCod1 = firstItem.PostlCod1;
						_this.getOwnerComponent().AppInstance.defaultPlantAddres_City = firstItem.City;
						_this.getOwnerComponent().AppInstance.defaultPlantAddres_Region = firstItem.Region;
						_this.getOwnerComponent().AppInstance.defaultPlantAddres_Country = firstItem.Country;

						// for adding the plant field in header 4 Dec 2017
						plModel.setData(oData);
						_this.getView().byId("plantHeader").setModel(plModel);

						// _this.getView().byId("plantHeader").setValue(_this.AppInstance.tablePOItems.getRows()[0].getCells()[6].getValue());

						// following row added on 12-Dec-2017 due to approval status change enhacement
						if (_this.getOwnerComponent().AppInstance.lastSelected_POApprovalStatus === "Rejected") {
							_this.getView().byId("labelRevRej").setVisible(true);
							_this.getView().byId("boxRrevRej").setVisible(true);
						} else {
							_this.getView().byId("labelRevRej").setVisible(false);
							_this.getView().byId("boxRrevRej").setVisible(false);
						}

						_this.getOwnerComponent().AppInstance.tablePOItems.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Items);
						_this.getOwnerComponent().AppInstance.tablePOItems.bindRows({
							path: "/results"
						});
						_this.getOwnerComponent().AppInstance.tablePOItems.setVisibleRowCount(_this.getOwnerComponent().AppInstance.CurrentMODEL_Items
							.getData().results.length);

						// Bind address table !
						_this.getOwnerComponent().AppInstance.tablePOAddress.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Items);
						_this.getOwnerComponent().AppInstance.tablePOAddress.bindRows({
							path: "/results"
						});
						_this.getOwnerComponent().AppInstance.tablePOAddress.setVisibleRowCount(_this.getOwnerComponent().AppInstance.CurrentMODEL_Items
							.getData().results.length);

						// Bind Po ItemText tab table 
						_this.getOwnerComponent().AppInstance.tablePOText.setModel(_this.getOwnerComponent().AppInstance.CurrentMODEL_Items);
						_this.getOwnerComponent().AppInstance.tablePOText.bindRows({
							path: "/results"
						});
						_this.getOwnerComponent().AppInstance.tablePOText.setVisibleRowCount(_this.getOwnerComponent().AppInstance.CurrentMODEL_Items
							.getData().results.length);

						/*				if (_this.getOwnerComponent().AppInstance.lastSelected_POAction === "PO_ACTION__EDIT" && _this.getOwnerComponent().AppInstance
											.CurrentMODEL_Items.getData().results[0].Ztstring_exp === "") {
											_this.getView().byId("idInformationButton").setEnabled(false);
										}*/
						if (_this.getOwnerComponent().AppInstance.lastSelected_POAction === "PO_ACTION__EDIT" && _this.getOwnerComponent().AppInstance
							.CurrentMODEL_Items.getData().results[0].Ztstring_exp !== "") {
							_this.getView().byId("idInformationLabel").setVisible(true);
							_this.getView().byId("idInformationButton").setVisible(true);
							_this.getView().byId("idInformationButton").setEnabled(true);

						}
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(error) {
						_this.getOwnerComponent().AppInstance.displayMessage(error);
						console.log(error);
						sap.ui.core.BusyIndicator.hide();
					}
				});

			}
			_this.getView().byId("tabBar_ItemData").setSelectedKey("general");

			//alert(" End Called");
			//var csrfToken = this.getView().getModel().oHeaders['x-csrf-token'];
			//alert(" csrfToken"+csrfToken);

		},

		readAttachment: function() {
			var po = this.AppInstance.lastSelected_PONumber;
			this.getView().getModel("model__transfer_po").read("/ZtgetattachmentSet", {
				filters: [new Filter("ObjectId", "EQ", this.AppInstance.lastSelected_PONumber),
					new Filter("ObjectType", "EQ", "BUS2012"),
					new Filter("ObjectCat", "EQ", "BO")
				],
				success: function(oData) {

					this.getView().getModel().setProperty("/attachmentData", oData.results);
				}.bind(this),
				error: function(err) {
					console.log(err);
				}
			});
		},

		fn_Items_Quantity_Change: function(oEvent) {

			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/Quantity", oEvent.getParameters().newValue);
			var rowIndex = oEvent.getSource().getParent().getIndex();
			if (this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource().getParent().getIndex() +
					"/Distribkey").toString() === "0") {
				var zAccStr = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource().getParent().getIndex() +
					"/Zaccount");
				var tempJSON = JSON.parse(zAccStr);
				/*following line updated due to the Qunatity field not updated apart from index 0 row. And if case is added to hadle the new row addition*/
				/*tempJSON.ITEMS[0].QUANTITY = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+oEvent.getSource().getParent().getIndex()+"/Quantity") ;*/
				if (tempJSON.ITEMS.length === 1) {
					tempJSON.ITEMS[0].QUANTITY = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource()
						.getParent().getIndex() + "/Quantity");
				} else {
					tempJSON.ITEMS[rowIndex].QUANTITY = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource()
						.getParent().getIndex() + "/Quantity");
				}
				this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
					"/Zaccount", JSON.stringify(tempJSON));
			};
			this.reCalculateItemAndPOValues(oEvent.getSource().getParent().getIndex());
		},

		fn_Items_NetPrice_Change: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/NetPrice", oEvent.getParameters().newValue);
			this.reCalculateItemAndPOValues(oEvent.getSource().getParent().getIndex());
		},

		fn_Items_Per_Change: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/PriceUnit", oEvent.getParameters().newValue);
			this.reCalculateItemAndPOValues(oEvent.getSource().getParent().getIndex());
		},

		reCalculateItemAndPOValues: function(changed_row_index) {

			var newItemValue = parseFloat(this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + changed_row_index +
					"/Quantity")) *
				parseFloat(this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + changed_row_index + "/NetPrice")) /
				parseFloat(this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + changed_row_index + "/PriceUnit"));
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + changed_row_index + "/ItemValue", newItemValue);

			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

			var newPOValue = 0.0;
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData().results.forEach(function(element) {
				if (element.DeleteInd !== "L")
					newPOValue = newPOValue + parseFloat(element.ItemValue);
			});

			this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/TotalValue", newPOValue.toFixed(2));
			this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);

		},

		fn_Items_Limit_Change: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();

			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Limit", oEvent.getParameters().newValue);

			//	if (
			// (this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/Acctasscat") === "L") &&
			//	if ((this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/ItemCat") === "B") ||
			//		(this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/ItemCat") === "D") ||
			//		(this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/ItemCat") === "9"))
			//)
			//	{
			// No deed for IF because if the user is able to change the value of the Limit field it means that it is enabled
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/NetPrice", oEvent.getParameters().newValue);

			var tempJSON = JSON.parse(this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Zaccount"));
			tempJSON.ITEMS[0].NET_VALUE = oEvent.getParameters().newValue;
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Zaccount", JSON.stringify(tempJSON));

			//	}

			this.reCalculateItemAndPOValues(rowIndex);
		},

		//buttonSimulatePressed : function ( oEvent ) {
		//},

		buttonNewItemPressed: function(oEvent) {
			var AppInstance = this.AppInstance;
			//$.get("model/PoItem.json").complete(function(content){
			var aData = AppInstance.CurrentMODEL_Items.getProperty("/results");
			//var newRow = content.responseJSON.results[0];

			var selectedDocumentType = AppInstance.CurrentMODEL_Header.getProperty("/DocType");
			var _row_AccAss = "";
			var _row_AccAssTxt = "";
			var _row_ItemCat = "";
			var _row_ItemCatTxt = "";

			var _row_AU = AppInstance.lastSelected_ForNewItem_UM_PoUnit;
			var _row_AUTxt = AppInstance.lastSelected_ForNewItem_UM_PoUnitText;
			var _row_Plant = AppInstance.lastSelected_ForNewItem_Plant_Plant;
			var _row_PlantTxt = AppInstance.lastSelected_ForNewItem_Plant_PlantText;

			var _rowQuantity = "";

			if (selectedDocumentType === "NB2") {
				_row_AccAss = "K";
				_row_AccAssTxt = "Cost Center";
				_row_ItemCat = "";
				_row_ItemCatTxt = "Standard";
			} else
			if (selectedDocumentType === "NB2D") {
				_row_AccAss = "K";
				_row_AccAssTxt = "Cost Center";
				_row_ItemCat = "D";
				_row_ItemCatTxt = "Service";
				// Issue 50 language translation
				if (AppInstance.sCurrentLocale == "de") {
					_row_AU = "LE";
					_row_AUTxt = "LE";
				} else {
					_row_AU = "AU";
					_row_AUTxt = "AU";
				}
				// Issue 50 end
				_rowQuantity = "1";
			} else
			if (selectedDocumentType === "NB3") {
				_row_AccAss = "L";
				_row_AccAssTxt = "Limit";
				_row_ItemCat = "B";
				_row_ItemCatTxt = "Limit";
				// Issue 50 language translation
				if (AppInstance.sCurrentLocale == "de") {
					_row_AU = "LE";
					_row_AUTxt = "LE";
				} else {
					_row_AU = "AU";
					_row_AUTxt = "AU";
				}
				// Issue 50 end
				_rowQuantity = "1";
			}
			// Issue 48 start
			else
			if (selectedDocumentType === "NB2Z") {
				_row_AccAss = "Z";
				_row_AccAssTxt = "Int Order";
				_row_ItemCat = "";
				_row_ItemCatTxt = "Standard";
			} else
			if (selectedDocumentType === "N2ZD") {
				_row_AccAss = "Z";
				_row_AccAssTxt = "Int Order";
				_row_ItemCat = "D";
				_row_ItemCatTxt = "Service";
				// Issue 50 language translation
				if (AppInstance.sCurrentLocale == "de") {
					_row_AU = "LE";
					_row_AUTxt = "LE";
				} else {
					_row_AU = "AU";
					_row_AUTxt = "AU";
				}
				// Issue 50 end
				_rowQuantity = "1";
			} else
			if (selectedDocumentType === "NB3Z") {
				_row_AccAss = "L";
				_row_AccAssTxt = "Limit";
				_row_ItemCat = "B";
				_row_ItemCatTxt = "Limit";
				// Issue 50 language translation
				if (AppInstance.sCurrentLocale == "de") {
					_row_AU = "LE";
					_row_AUTxt = "LE";
				} else {
					_row_AU = "AU";
					_row_AUTxt = "AU";
				}
				// Issue 50 end
				_rowQuantity = "1";
			} else
			if (selectedDocumentType === "NB2F") {
				_row_AccAss = "F";
				_row_AccAssTxt = "Order";
				_row_ItemCat = "";
				_row_ItemCatTxt = "Standard";
			}
			// Issue 48  end
			;

			// following one line changed due to addition of the plant field in header 4 Dec 2017
			/*var newRow = JSON.parse('{"results":[{"PoNumber":"","PoItem":"","DeleteInd":"","ShortText":"","Quantity":"'+_rowQuantity+'","Acctasscat":"'+_row_AccAss+'","Acctasscattxt":"'+_row_AccAssTxt+'","ItemCat":"'+_row_ItemCat+'","ItemCattxt":"'+_row_ItemCatTxt+'","MatlGroup":"","MatlGrouptxt":"","Plant":"'+_row_Plant+'","Planttxt":"'+_row_PlantTxt+'","PoUnit":"'+_row_AU+'","PoUnittxt":"'+_row_AUTxt+'","DeliveryDate":"","SchedLine":"","NetPrice":"","PriceUnit":"","Currency":"","OrderprUn":"","ItemValue":"","Distrib":"","Costcenter":"","AssetNo":"","Orderid":"","GlAccount":"","Costcentertxt":"","AssetNotxt":"","GlAccounttxt":"","Orderidtxt":"","PreqName":"","PckgNo":"","Limit":"","ExpValue":"","BaseUom":"","GrPrice":"","SerialNo":"","Distribkey":"","Input1":"","Input2":"","Input3":"","Input4":"","Input5":"","Input6":"","Input7":"","Input8":"","Input9":"","Input10":"","Input11":"","Input12":"","Input13":"","Input14":"","Input15":"","Input16":"","Input17":"","Input18":"","Input19":"","Input20":"","Finalinvoice":"","Delivcompleted":"","Rejection":"","Zaddress":"","Zaccount":""}]}').results[0];*/
			/*var newRow = JSON.parse('{"results":[{"PoNumber":"","PoItem":"","DeleteInd":"","ShortText":"","Quantity":"' + _rowQuantity + '","Acctasscat":"' + _row_AccAss + '","Acctasscattxt":"' + _row_AccAssTxt + '","ItemCat":"' + _row_ItemCat + '","ItemCattxt":"' + _row_ItemCatTxt + '","MatlGroup":"","MatlGrouptxt":"","Plant":"","Planttxt":"' + _row_PlantTxt + '","PoUnit":"' + _row_AU + '","PoUnittxt":"' + _row_AUTxt + '","DeliveryDate":"","SchedLine":"","NetPrice":"","PriceUnit":"","Currency":"","OrderprUn":"","ItemValue":"","Distrib":"","Costcenter":"","AssetNo":"","Orderid":"","GlAccount":"","Costcentertxt":"","AssetNotxt":"","GlAccounttxt":"","Orderidtxt":"","PreqName":"","PckgNo":"","Limit":"","ExpValue":"","BaseUom":"","GrPrice":"","SerialNo":"","Distribkey":"","Input1":"","Input2":"","Input3":"","Input4":"","Input5":"","Input6":"","Input7":"","Input8":"","Input9":"","Input10":"","Input11":"","Input12":"","Input13":"","Input14":"","Input15":"","Input16":"","Input17":"","Input18":"","Input19":"","Input20":"","Finalinvoice":"","Delivcompleted":"","Rejection":"","Zaddress":"","Zaccount":""}]}').results[0];*/
			//Issue 49 start , Fill Input1 field with doc type
			var newRow = JSON.parse('{"results":[{"PoNumber":"","PoItem":"","DeleteInd":"","ShortText":"","Quantity":"' + _rowQuantity +
				'","Acctasscat":"' + _row_AccAss + '","Acctasscattxt":"' + _row_AccAssTxt + '","ItemCat":"' + _row_ItemCat + '","ItemCattxt":"' +
				_row_ItemCatTxt + '","MatlGroup":"","MatlGrouptxt":"","Plant":"","Planttxt":"' + _row_PlantTxt + '","PoUnit":"' + _row_AU +
				'","PoUnittxt":"' + _row_AUTxt +
				'","DeliveryDate":"","SchedLine":"","NetPrice":"","PriceUnit":"","Currency":"","OrderprUn":"","ItemValue":"","Distrib":"","Costcenter":"","AssetNo":"","Orderid":"","GlAccount":"","Costcentertxt":"","AssetNotxt":"","GlAccounttxt":"","Orderidtxt":"","PreqName":"","PckgNo":"","Limit":"","ExpValue":"","BaseUom":"","GrPrice":"","SerialNo":"","Distribkey":"","Input1":"' +
				selectedDocumentType +
				'","Input2":"","Input3":"","Input4":"","Input5":"","Input6":"","Input7":"","Input8":"","Input9":"","Input10":"","Input11":"","Input12":"","Input13":"","Input14":"","Input15":"","Input16":"","Input17":"","Input18":"","Input19":"","Input20":"","Finalinvoice":"","Delivcompleted":"","Rejection":"","Zaddress":"","Zaccount":""}]}'
			).results[0];
			//Issue 49 End

			var poItemValuesArray = [];
			AppInstance.CurrentMODEL_Items.getData().results.forEach(function(element) {
				poItemValuesArray.push(parseInt(element.PoItem));
			});
			var lastLine = Math.max.apply(Math, poItemValuesArray) + 10;

			var poItemValue = "";
			if (lastLine < 100) poItemValue = "000" + lastLine.toString();
			else if (lastLine < 1000) poItemValue = "00" + lastLine.toString();
			else if (lastLine < 10000) poItemValue = "0" + lastLine.toString();
			else poItemValue = lastLine.toString();

			newRow.PoItem = poItemValue;
			newRow.Currency = AppInstance.CurrentMODEL_Header.getProperty("/Currency");
			newRow.DeliveryDate = new Date();
			newRow.Distribkey = "0";
			newRow.PriceUnit = 1;

			newRow.Name = AppInstance.defaultPlantAddres_Name;
			newRow.Street = AppInstance.defaultPlantAddres_Street;
			newRow.StreetNo = AppInstance.defaultPlantAddres_StreetNo;
			newRow.PostlCod1 = AppInstance.defaultPlantAddres_PostlCod1;
			newRow.City = AppInstance.defaultPlantAddres_City;
			newRow.Region = AppInstance.defaultPlantAddres_Region;
			newRow.Country = AppInstance.defaultPlantAddres_Country;

			newRow.Zaccount = "{\"ITEMS\" : [{ \"PO_NUMBER\":\"\", \"PO_ITEM\":\"" + poItemValue + "\",\"SERIAL_NO\":\"\",\"QUANTITY\":\"" +
				_rowQuantity +
				"\",\"DISTR_PERC\":\"0.0\",\"NET_VALUE\":\"\",\"COSTCENTER\":\"\",\"ASSET_NO\":\"\",\"ORDERID\":\"\",\"GL_ACCOUNT\":\"\",\"COSTCENTERTXT\":\"\",\"ASSET_NOTXT\":\"\",\"GL_ACCOUNTTXT\":\"\",\"ORDERIDTXT\":\"\",\"ACTION\":\"\",\"INPUT1\":\"\",\"INPUT2\":\"\",\"INPUT3\":\"\",\"INPUT4\":\"\",\"INPUT5\":\"\",\"INPUT6\":\"\",\"INPUT7\":\"\",\"INPUT8\":\"\",\"INPUT9\":\"\",\"INPUT10\":\"\",\"NUMERIC1\":\"0.0\",\"NUMERIC2\":\"0.0\",\"NUMERIC3\":\"0.0\" }]}";

			/*code added for add new line issue after adding the plant to Header 4 Dec 2017*/
			var plRows = AppInstance.tablePOItems.getRows();
			var plLastRow = plRows[plRows.length - 1];
			/*following row changed , as the plant field is hiddedn in table, and all row will have same plant*/
			/*newRow.Plant = plLastRow.getCells()[6].getValue();*/
			newRow.Plant = _row_Plant;

			aData.push(newRow);

			AppInstance.CurrentMODEL_Items.setProperty("/results", aData);
			AppInstance.CurrentMODEL_Items.refresh(true);
			AppInstance.tablePOItems.setVisibleRowCount(AppInstance.CurrentMODEL_Items.getData().results.length);
			AppInstance.tablePOAddress.setVisibleRowCount(AppInstance.CurrentMODEL_Items.getData().results.length);
			AppInstance.tablePOText.setVisibleRowCount(AppInstance.CurrentMODEL_Items.getData().results.length);

			var allRows = AppInstance.tablePOItems.getRows();
			var lastRow = allRows[allRows.length - 1];
			lastRow.getCells().forEach(function(cell) {
				if (cell.getMetadata().getName() === "sap.m.Input") {
					cell.onsaptabnext = cell.onsapenter;
				}
			});

			//}) ;
		},

		buttonCopyAddressPressed: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();

			var _Name = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Name"),
				_Street = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Street"),
				_StreetNo = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/StreetNo"),
				_PostalCode = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/PostlCod1"),
				_City = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/City"),
				_Region = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Region"),
				_Country = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Country");

			var itemsData = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();
			itemsData.results.forEach(function(itemsElement) {
				itemsElement.Name = _Name;
				itemsElement.Street = _Street;
				itemsElement.StreetNo = _StreetNo;
				itemsElement.PostlCod1 = _PostalCode;
				itemsElement.City = _City;
				itemsElement.Region = _Region;
				itemsElement.Country = _Country;
			});
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
		},

		buttonUndoAddressPressed: function(oEvent) {

			var itemsData = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();
			var AppInstance = this.getOwnerComponent().AppInstance;
			/*following code commented and new code added due to requirement - on change of com code the plant should change and that plant address shod come in delivery addr table*/
			/*itemsData.results.forEach(function(itemsElement){

				itemsElement.Name = AppInstance.defaultPlantAddres_Name ;
				itemsElement.Street = AppInstance.defaultPlantAddres_Street ;
				itemsElement.StreetNo = AppInstance.defaultPlantAddres_StreetNo ;
				itemsElement.PostlCod1 = AppInstance.defaultPlantAddres_PostlCod1 ;
				itemsElement.City = AppInstance.defaultPlantAddres_City ;
				itemsElement.Region = AppInstance.defaultPlantAddres_Region ;
				itemsElement.Country = AppInstance.defaultPlantAddres_Country ;
				
			});
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
					
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);*/
			var rowIndex = 0;
			var noOfRows = itemsData.results.length;
			var compCode = this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/CompCode");
			var plant = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData().results[0].Plant;
			var name = "",
				street = "",
				postlCod1 = "",
				city = "",
				region = "",
				country = "";

			var del_addr = false;
			// this is required as sometime the attach function with model_f4_function get triggered when user navigate b/w pages multiple times.

			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetplantSet", {
				filters: [new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, compCode),
					new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant)
				],
				success: function(oData, oResponse) {
					name = oData.results[0].Name1;
					street = oData.results[0].Street;
					postlCod1 = oData.results[0].PostCode1;
					city = oData.results[0].City1;
					region = oData.results[0].Region;
					country = oData.results[0].Country;
					del_addr = true;
				},

				error: function(error) {
					console.log(" In Func error " + error);
				}

			});

			this.getOwnerComponent().getModel("model__f4_functions").attachRequestCompleted(function() {
				if (del_addr) {
					for (rowIndex = 0; rowIndex < noOfRows; rowIndex++) {
						AppInstance.CurrentMODEL_Items.oData.results[rowIndex].Name = name;
						AppInstance.CurrentMODEL_Items.oData.results[rowIndex].Street = street;
						AppInstance.CurrentMODEL_Items.oData.results[rowIndex].PostlCod1 = postlCod1;
						AppInstance.CurrentMODEL_Items.oData.results[rowIndex].City = city;
						AppInstance.CurrentMODEL_Items.oData.results[rowIndex].Region = region;
						AppInstance.CurrentMODEL_Items.oData.results[rowIndex].Country = country;
					}

					AppInstance.CurrentMODEL_Items.refresh(true);
					del_addr = false;
				}
			});
		},

		buttonNewSubItemPressed: function(oEvent) {
			//$.get("model/PoSubItem.json").complete(function(content){
			var aData = this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.getProperty("/");
			//var newRow = content.responseJSON.ITEMS[0];
			var newRowJSON = JSON.parse(
				'{"ITEMS" : [{"PO_NUMBER":"","PO_ITEM":"","SERIAL_NO":"","QUANTITY":"","DISTR_PERC":"","NET_VALUE":"","COSTCENTER":"","ASSET_NO":"","ORDERID":"","GL_ACCOUNT":"","COSTCENTERTXT":"","ASSET_NOTXT":"","GL_ACCOUNTTXT":"","ORDERIDTXT":"","ACTION":"","INPUT1":"","INPUT2":"","INPUT3":"","INPUT4":"","INPUT5":"","INPUT6":"","INPUT7":"","INPUT8":"","INPUT9":"","INPUT10":"","NUMERIC1":"0.0","NUMERIC2":"0.0","NUMERIC3":"0.0"}]}'
			);
			var newRow = newRowJSON.ITEMS[0];
			var itemsRowIndex = this.getOwnerComponent().AppInstance.lastSelected_ItemRowIndex;

			newRow.PO_NUMBER = this.getOwnerComponent().AppInstance.lastSelected_PONumber;
			newRow.PO_ITEM = this.getOwnerComponent().AppInstance.lastSelected_POItem;
			newRow.GL_ACCOUNT = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + itemsRowIndex + "/GlAccount");
			newRow.GL_ACCOUNTTXT = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + itemsRowIndex +
				"/GlAccounttxt");
			newRow.COSTCENTER = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + itemsRowIndex + "/Costcenter");
			newRow.COSTCENTERTXT = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + itemsRowIndex +
				"/Costcentertxt");
			newRow.ORDERID = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + itemsRowIndex + "/Orderid");
			newRow.ORDERIDTXT = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + itemsRowIndex + "/Orderidtxt");

			aData.push(newRow);
			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/", aData);
			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.refresh(true);
			this.getOwnerComponent().AppInstance.tablePOSubItems.setVisibleRowCount(this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.getData()
				.length);
			//}) ;
		},

		buttonUpdatePressed: function() {
			this.executeSubmitUpdate("C");
		},

		buttonSubmitPressed: function() {
			this.executeSubmitUpdate("P");
		},

		executeSubmitUpdate: function(action_char) {

			var AppInstance = this.getOwnerComponent().AppInstance;

			var post_ALLCONTENT_JSON = {}, // Contains the entire payload used to call the post/create/update/copy

				post_ITEMS_JSON = {
					"ITEMS": []
				}, // Contains the Items , stripped of SubItems and re-built with the new address field
				post_SUBITEMS_JSON = {
					"ITEMS": []
				}; // Idem post_ITEMS_JSON , but for SubItems

			var itemsData = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();
			var counter = 0;

			itemsData.results.forEach(function(itmElm) {
				var accJSONtmp = JSON.parse(itmElm.Zaccount);
				counter = 1;

				accJSONtmp.ITEMS.forEach(function(subitmElm) {
					if (subitmElm.PO_ITEM === itmElm.PoItem) {

						if (counter < 10)
							subitmElm.SERIAL_NO = "0" + counter.toString();
						else
							subitmElm.SERIAL_NO = counter.toString();

						counter = counter + 1;

					}

				});
				itmElm.Zaccount = JSON.stringify(accJSONtmp);
			});

			//add updated itemtext data 
			var post_ITEMSTEXT_JSON_UPDATED = {
				"ITEMS": []
			};
			/*
						itemsData.results.forEach(function(itmElm) {
							itmElm.Zstring_str = "";
							
							if(itmElm.itemTextTab !== undefined){
							var updatedItemText = (itmElm.itemTextTab).split("\n");

							var serialNo = "",
								counterItem = 1;
							for (var i = 0; i < updatedItemText.length; i++) {

								if (counterItem < 10) {
									serialNo = "0" + counterItem.toString();
								} else {
									serialNo = counterItem.toString();
								}

								var newItem = {
									"POITEM": itmElm.PoItem,
									"LINENR": serialNo,
									"ITEMTEXT": updatedItemText[i]

								};
								post_ITEMSTEXT_JSON_UPDATED.ITEMS.push(newItem);
								counterItem = counterItem + 1;
							}
							}
								//itmElm.Zstring_str = JSON.stringify(post_ITEMSTEXT_JSON_UPDATED);
							console.log("\nItemTextData :" + itmElm.Zstring_str);
						});
						*/

			/* New code for Item Tab Text to allow only 132 characters */
			itemsData.results.forEach(function(itmElm) {
				itmElm.Zstring_str = "";

				if (itmElm.itemTextTab !== undefined) {
					//	var updatedItemText = (itmElm.itemTextTab).split("\n");

					var userValues = (itmElm.itemTextTab).split("\n");

					console.log("\nAll Splitted Values after user entered: \n" + userValues);

					var total = 0,
						finalValue = []; //this will hold data till 132 char and remaining will split to next line.

					for (var x = 0; x < userValues.length; x++) {
						var tempValue = userValues[x];
						var y = 0;
						var firstLine = [];
						while (tempValue.length > 132) {
							firstLine[y] = tempValue.slice(0, 132);
							finalValue[total] = firstLine[y]
							tempValue = tempValue.substr(132); //remaining string after 132 characters

							console.log("spiltted Text lines:" + y + ":" + firstLine[y]);
							console.log("\nRemainingLine" + tempValue);
							y++;
							total++;

						}
						firstLine[y] = tempValue;
						finalValue[total] = firstLine[y];
						total++;

					}

					var updatedItemText = finalValue;

					var serialNo = "",
						counterItem = 1;
					for (var i = 0; i < updatedItemText.length; i++) {

						if (counterItem < 10) {
							serialNo = "0" + counterItem.toString();
						} else {
							serialNo = counterItem.toString();
						}

						var newItem = {
							"POITEM": itmElm.PoItem,
							"LINENR": serialNo,
							"ITEMTEXT": updatedItemText[i]

						};
						post_ITEMSTEXT_JSON_UPDATED.ITEMS.push(newItem);
						counterItem = counterItem + 1;
					}
				}
				//itmElm.Zstring_str = JSON.stringify(post_ITEMSTEXT_JSON_UPDATED);
				console.log("\nItemTextData :" + itmElm.Zstring_str);
			});

			console.log("Posting itemText: ");
			console.log(post_ITEMSTEXT_JSON_UPDATED);
			//end

			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);

			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData().results.forEach(function(element_item) {
				console.log("Processing item : " + element_item.PoItem);
				// convert price_unit to string due to Price Unit field not taking more than 99
				var priceUnitStr = "" + Math.floor(element_item.PriceUnit);
				// following line added due to item value some time going beyond back end limit e.g 87*0.37 / 10
				var itemValue3digit = AppInstance.format_3DigitsDecimalNumber(element_item.ItemValue);

				// Issue 48
				/*If doc type is NB2F or NB2Z or N2ZD you should call it still with NB2. NB2F and NB2Z and N2ZD exists only in Fiori but not in SAP. 
				Also when we post we need to pass NB2 and not NB2F or NB2Z or N2ZD.
				If doc type is NB3Z or NB3 , you should call it NB3 , and while posting it should be NB3.*/
				var itemInput1 = "";
				if ((element_item.Input1 === "NB2D" || element_item.Input1 === "NB2F" || element_item.Input1 === "NB2Z" || element_item.Input1 ===
						"N2ZD")) {
					itemInput1 = "NB2";
				} else {
					if (element_item.Input1 === "NB3" || element_item.Input1 === "NB3Z") {
						itemInput1 = "NB3";
					}
				}
				// Issue 48 end

				// Adding the Item fields to the post json
				var newItem = {
					"PO_NUMBER": (AppInstance.lastSelected_POAction === "PO_ACTION__EDIT") ? element_item.PoNumber : "",
					"PO_ITEM": element_item.PoItem,
					"DELETE_IND": (element_item.DeleteInd) === "L" ? "X" : "",
					"SHORT_TEXT": element_item.ShortText,
					// changed to make it decimal number with 3 digits after decimal - 3  july 2018
					//"QUANTITY"		: element_item.Quantity,
					"QUANTITY": parseFloat(element_item.Quantity).toFixed(3),
					"ACCTASSCAT": element_item.Acctasscat,
					"ACCTASSCATTXT": element_item.Acctasscattxt,
					"ITEM_CAT": element_item.ItemCat,
					"ITEM_CATTXT": element_item.ItemCattxt,
					"MATL_GROUP": element_item.MatlGroup,
					"MATL_GROUPTXT": element_item.MatlGrouptxt,
					"PLANT": element_item.Plant,
					"PLANTTXT": element_item.Planttxt,
					"PO_UNIT": element_item.PoUnit,
					"PO_UNITTXT": element_item.PoUnittxt,
					"DELIVERY_DATE": AppInstance.formatDateForSAP(element_item.DeliveryDate),
					"SCHED_LINE": element_item.SchedLine,
					// changed to make it decimal number with 3 digits after decimal - 3  july 2018
					//"NET_PRICE"		: element_item.NetPrice ,
					"NET_PRICE": parseFloat(element_item.NetPrice).toFixed(3),
					// "PRICE_UNIT"	: Math.floor(element_item.PriceUnit) ,
					"PRICE_UNIT": priceUnitStr,
					"CURRENCY": element_item.Currency,
					"ORDERPR_UN": element_item.PoUnit,
					//"ITEM_VALUE"	: element_item.ItemValue,	
					// changed to make it decimal number with 3 digits after decimal - 3  july 2018
					//"ITEM_VALUE"	: itemValue3digit ,
					"ITEM_VALUE": parseFloat(itemValue3digit).toFixed(3),
					"DISTRIB": /* element_item.Distribkey */ element_item.DistribKey,
					/* intentionally using wrong feild name */
					"COSTCENTER": element_item.Costcenter,
					"ASSET_NO": element_item.AssetNo,
					"ORDERID": element_item.Orderid,
					"GL_ACCOUNT": element_item.GlAccount,
					"COSTCENTERTXT": element_item.Costcentertxt,
					"ASSET_NOTXT": element_item.AssetNotxt,
					"GL_ACCOUNTTXT": element_item.GlAccounttxt,
					// changed to make order text empty asthe backend is not accepting certain long descriptions - 13  july 2018
					//"ORDERIDTXT"	: element_item.Orderidtxt ,
					"ORDERIDTXT": "",
					"PREQ_NAME": AppInstance.CurrentMODEL_Header.getProperty("/PreqName"),
					"PCKG_NO": element_item.PckgNo,
					/*"LIMIT"			: element_item.Limit ,
					"EXP_VALUE"		: element_item.Limit ,
					"BASE_UOM"		: element_item.BaseUom ,*/
					// changed due to issue 48 - 10  july 2018
					"LIMIT": (element_item.Limit) ? element_item.Limit : "0.000",
					"EXP_VALUE": (element_item.Limit) ? element_item.Limit : "0.000",
					"BASE_UOM": (element_item.BaseUom) ? element_item.BaseUom : element_item.PoUnit,

					// changed to make it decimal number with 3 digits after decimal - 3  july 2018
					//"GR_PRICE"		: element_item.NetPrice ,
					"GR_PRICE": parseFloat(element_item.NetPrice).toFixed(3),
					"SERIAL_NO": element_item.SerialNo,

					"NAME": element_item.Name,
					"CITY": element_item.City,
					"REGION": element_item.Region,
					"POSTL_COD1": element_item.PostlCod1,
					"STREET": element_item.Street,
					"STREET_NO": element_item.StreetNo,
					"COUNTRY": element_item.Country,
					// changed to make it decimal number with 3 digits after decimal - 9  july 2018
					//"CUSTOMER"		: element_item.Customer,
					"CUSTOMER": (element_item.Customer) ? (element_item.Customer) : (""),

					"NO_MORE_GR": (AppInstance.lastSelected_POAction === "PO_ACTION__EDIT") ? (element_item.Delivcompleted === true ? "X" : "") : "",
					"FINAL_INV": "",
					"PART_INV": "",
					"GR_IND": "",
					"GR_NON_VAL": "",
					"IR_IND": "",
					"FREE_ITEM": "",
					"GR_BASEDIV": "",
					"RET_ITEM": "",

					"ACTION": "",
					//"INPUT1"		: element_item.Input1,
					// Issue 48
					/*If doc type is NB2F or NB2Z or N2ZD you should call it still with NB2. NB2F and NB2Z and N2ZD exists only in Fiori but not in SAP. 
					Also when we post we need to pass NB2 and not NB2F or NB2Z or N2ZD.*/
					/*"INPUT1"		: ( element_item.Input1 ==="NB2D" || element_item.Input1 === "NB2F" || element_item.Input1 ==="NB2Z" || element_item.Input1 ==="N2ZD") ? "NB2" : element_item.Input1,*/
					"INPUT1": itemInput1,
					// Issue 48 end

					"INPUT2": element_item.Input2,
					"INPUT3": element_item.Input3,
					"INPUT4": element_item.Input4,
					"INPUT5": element_item.Input5,
					"INPUT6": element_item.Input6,
					"INPUT7": element_item.Input7,
					"NUMERIC1": 0,
					"NUMERIC2": 0,
					"NUMERIC3": 0,
					"DATE1": "0000-00-00",
					"INPUT8": element_item.Input8,
					"INPUT9": element_item.Input9,
					"INPUT10": element_item.Input10
				};
				post_ITEMS_JSON.ITEMS.push(newItem);

				// Adding the content of the SubItems of this particular Item to the overall post json
				var currentSubItemsJSON = JSON.parse(element_item.Zaccount);

				currentSubItemsJSON.ITEMS.forEach(function(subitem_element) {
					/*console.log("   checking subitem " + subitem_element.PO_ITEM+"/"+subitem_element.SERIAL_NO);*/

					if (subitem_element.PO_ITEM === element_item.PoItem) {

						var newSubItem = {
							"PO_NUMBER": (AppInstance.lastSelected_POAction === "PO_ACTION__EDIT") ? element_item.PO_NUMBER : "",
							"PO_ITEM": subitem_element.PO_ITEM,
							"SERIAL_NO": subitem_element.SERIAL_NO,
							"QUANTITY": isNaN(parseFloat(subitem_element.QUANTITY).toFixed(1).toString()) ? "1" : parseFloat(subitem_element.QUANTITY)
								.toFixed(1).toString(),
							"DISTR_PERC": parseFloat(subitem_element.DISTR_PERC).toFixed(1).toString(),
							"NET_VALUE": /*(element_item.Distribkey === "0") ? (element_item.NetPrice).toString() : */ subitem_element.NET_VALUE,
							"COSTCENTER": subitem_element.COSTCENTER,
							"ASSET_NO": subitem_element.ASSET_NO,
							"ORDERID": subitem_element.ORDERID,
							"GL_ACCOUNT": subitem_element.GL_ACCOUNT,
							"COSTCENTERTXT": subitem_element.COSTCENTERTXT,
							"ASSET_NOTXT": subitem_element.ASSET_NOTXT,
							"GL_ACCOUNTTXT": subitem_element.GL_ACCOUNTTXT,
							// changed to make order text empty asthe backend is not accepting certain long descriptions - 13  july 2018
							//"ORDERIDTXT"	: subitem_element.ORDERIDTXT,
							"ORDERIDTXT": "",
							"ACTION": "S",
							"INPUT1": element_item.Distribkey,
							"INPUT2": AppInstance.formatDateForSAP(element_item.DeliveryDate),
							"INPUT3": subitem_element.INPUT3,
							"INPUT4": subitem_element.INPUT4,
							"INPUT5": subitem_element.INPUT5,
							"INPUT6": subitem_element.INPUT6,
							"INPUT7": subitem_element.INPUT7,
							"INPUT8": subitem_element.INPUT8,
							"INPUT9": subitem_element.INPUT9,
							"INPUT10": subitem_element.INPUT10,
							"NUMERIC1": 0.00,
							"NUMERIC2": 0.00,
							"NUMERIC3": 0.00
						};
						post_SUBITEMS_JSON.ITEMS.push(newSubItem);
						/*console.log("before Post SubItems quantity:"+ subitem_element.QUANTITY);
						console.log("Post SubItems quantity:"+ newSubItem.QUANTITY);*/
					}
				});

			});

			console.log("THIS IS THE ITEMS STRING THAT WILL BE POSTED");
			console.log(post_ITEMS_JSON);

			if (AppInstance.lastSelected_POAction === "PO_ACTION__EDIT") {
				post_ALLCONTENT_JSON.PoNumber = AppInstance.CurrentMODEL_Header.getProperty("/PoNumber");
			} else {
				post_ALLCONTENT_JSON.PoNumber = "";
			}
			post_ALLCONTENT_JSON.PoItem = "";
			post_ALLCONTENT_JSON.Vendor = AppInstance.CurrentMODEL_Header.getProperty("/Vendor");
			post_ALLCONTENT_JSON
				.Vendorname = "";
			// Issue 48
			/*If doc type is NB2F or NB2Z or N2ZD you should call it still with NB2. NB2F and NB2Z and N2ZD exists only in Fiori but not in SAP. 
			Also when we post we need to pass NB2 and not NB2F or NB2Z or N2ZD.
			If doc type is NB3Z or NB3 , you should call it NB3 , and while posting it should be NB3 */
			/*post_ALLCONTENT_JSON.DocType = (AppInstance.CurrentMODEL_Header.getProperty("/DocType") === "NB2D") ? "NB2" : AppInstance.CurrentMODEL_Header.getProperty("/DocType") ;*/
			var docType = AppInstance.CurrentMODEL_Header.getProperty("/DocType");
			if (docType === "NB2D" || docType === "NB2F" || docType === "NB2Z" || docType === "N2ZD") {
				post_ALLCONTENT_JSON.DocType = "NB2";
			} else {
				if (docType === "NB3Z" || docType === "NB3") {
					post_ALLCONTENT_JSON.DocType = "NB3";
				} else
					post_ALLCONTENT_JSON.DocType = docType;
			}
			// Issue 48 end
			post_ALLCONTENT_JSON.DocTypetxt = "";
			post_ALLCONTENT_JSON.CompCode = AppInstance.CurrentMODEL_Header.getProperty("/CompCode");
			post_ALLCONTENT_JSON
				.CompCodetxt = "";
			post_ALLCONTENT_JSON.PurchOrg = AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg");
			post_ALLCONTENT_JSON
				.PurchOrgtxt = "";
			post_ALLCONTENT_JSON.Currency = AppInstance.CurrentMODEL_Header.getProperty("/Currency");
			post_ALLCONTENT_JSON
				.Pmnttrms = "";
			post_ALLCONTENT_JSON.Pmnttrmstxt = "";
			post_ALLCONTENT_JSON.PurGroup = AppInstance.CurrentMODEL_Header.getProperty(
				"/PurGroup");
			post_ALLCONTENT_JSON.PurGrouptxt = "";
			post_ALLCONTENT_JSON.PreqName = AppInstance.CurrentMODEL_Header.getProperty(
				"/PreqName");
			post_ALLCONTENT_JSON.PreqNametxt = "";
			post_ALLCONTENT_JSON.Customer = "";
			post_ALLCONTENT_JSON.CustomerName = "";
			post_ALLCONTENT_JSON
				.AddrNo = "";
			post_ALLCONTENT_JSON.EMail = AppInstance.CurrentMODEL_Header.getProperty("/EMail");
			post_ALLCONTENT_JSON.CreatedBy =
				"";
			post_ALLCONTENT_JSON.TotalValue = "0.0";
			post_ALLCONTENT_JSON.ContrArea = "";
			post_ALLCONTENT_JSON.Testrun = "";
			post_ALLCONTENT_JSON
				.Ponumber = "";

			if (this.getView().byId("boxRrevRej").getSelected()) {
				post_ALLCONTENT_JSON.Input1 = "08";
			} else {
				post_ALLCONTENT_JSON.Input1 = "";
			}
			/*post_ALLCONTENT_JSON.Input1 = "" ;*/
			/*following line changed due to addition of Header Text field in header 7 feb 2018*/
			/*post_ALLCONTENT_JSON.Input2 = "";*/
			post_ALLCONTENT_JSON.Input2 = this.getView().byId("HeaderText").getValue();
			post_ALLCONTENT_JSON.Input3 = "";
			post_ALLCONTENT_JSON
				.Input4 = "";
			post_ALLCONTENT_JSON.Input5 = "";
			post_ALLCONTENT_JSON.Input6 = "";
			post_ALLCONTENT_JSON.Input7 = "";
			post_ALLCONTENT_JSON
				.Date1 = "2017-08-04T14:30:45";
			post_ALLCONTENT_JSON.Numeric1 = "0.0";
			post_ALLCONTENT_JSON.Numeric2 = "0.0";
			post_ALLCONTENT_JSON
				.Numeric3 = "0.0";
			post_ALLCONTENT_JSON.Action = action_char;
			post_ALLCONTENT_JSON.ZtitemsStr = JSON.stringify(post_ITEMS_JSON);
			post_ALLCONTENT_JSON
				.ZtaccountsStr = JSON.stringify(post_SUBITEMS_JSON);
			post_ALLCONTENT_JSON.ZtreturnStr = "";
			post_ALLCONTENT_JSON.Ztstring_str = JSON.stringify(post_ITEMSTEXT_JSON_UPDATED);

			// ... done.

			console.log("Calling POST using following payload ...");
			console.log(post_ALLCONTENT_JSON);

			var validationResult = AppInstance.validateDataBeforePOST();

			this.byId("inputDocumentType").setValueState(sap.ui.core.ValueState.None);
			this.byId("inputCompanyCode").setValueState(sap.ui.core.ValueState.None);
			this.byId("inputPurchasingOrganization").setValueState(sap.ui.core.ValueState.None);
			this.byId("inputSupplier").setValueState(sap.ui.core.ValueState.None);
			this.byId("inputPurchasingGroup").setValueState(sap.ui.core.ValueState.None);
			this.byId("inputCurrency").setValueState(sap.ui.core.ValueState.None);
			this.byId("inputRequisitioner").setValueState(sap.ui.core.ValueState.None);
			this.byId("inputEmail").setValueState(sap.ui.core.ValueState.None);

			if (validationResult > 0) {
				if (validationResult === 1) {

					var missingFields = "";
					if (this.byId("inputDocumentType").getValue() === "") {
						missingFields = missingFields + "\nDocument Type Missing";
						this.byId("inputDocumentType").setValueState(sap.ui.core.ValueState.Error);
					}

					if (this.byId("inputCompanyCode").getValue() === "") {
						missingFields = missingFields + "\nCompany Code Missing";
						this.byId("inputCompanyCode").setValueState(sap.ui.core.ValueState.Error);
					}

					if (this.byId("inputPurchasingOrganization").getValue() === "") {
						missingFields = missingFields + "\nPurchase Organisation Missing";
						this.byId("inputPurchasingOrganization").setValueState(sap.ui.core.ValueState.Error);
					}

					if (this.byId("inputSupplier").getValue() === "") {
						missingFields = missingFields + "\nVendor Missing";
						this.byId("inputSupplier").setValueState(sap.ui.core.ValueState.Error);
					}

					if (this.byId("inputPurchasingGroup").getValue() === "") {
						missingFields = missingFields + "\nPurchase Group Missing";
						this.byId("inputPurchasingGroup").setValueState(sap.ui.core.ValueState.Error);
					}

					if (this.byId("inputCurrency").getValue() === "") {
						missingFields = missingFields + "\nCurrency Missing";
						this.byId("inputCurrency").setValueState(sap.ui.core.ValueState.Error);
					}
					if (this.byId("inputRequisitioner").getValue() === "") {
						missingFields = missingFields + "\nRequisitioner Name Missing";
						this.byId("inputRequisitioner").setValueState(sap.ui.core.ValueState.Error);
					}

					if (this.byId("inputEmail").getValue() === "") {
						missingFields = missingFields + "\nEmail Missing";
						this.byId("inputEmail").setValueState(sap.ui.core.ValueState.Error);
					}
					if (missingFields === "") {
						missingFields = "Please re-select some header data, as it is not properly selected or copied.";
					}
					console.log("************" + missingFields);

					AppInstance.displayValidationMessageToast(missingFields);
					//	AppInstance.displayValidationMessageToast("Missing header information or incorrect email");

				} else {

					AppInstance.displayValidationMessageToast("Please fill in all the highlighted missing fields information in the items table");
				}
			} else {
				sap.ui.core.BusyIndicator.show();
				this.getOwnerComponent().getModel("model__post_po").create("/ZPOPOSTSet", post_ALLCONTENT_JSON, {
					async: false,
					success: function(oData, response) {

						var _message = "Operation executed with following result\n\n";
						// following if added for issue 38 - feb 2018
						if ((AppInstance.lastSelected_POAction === "PO_ACTION__NEW") || (AppInstance.lastSelected_POAction === "PO_ACTION__COPY")) {
							// Issue 48 start
							/*If PO doc type contains NB2 or NB2X should be the text of NB2 of po doc type is NB3X should be the text from NB3. NB3 we have only 2: NB3 and NB3Z.*/
							var headerDocType = AppInstance.CurrentMODEL_Header.getProperty("/DocType");
							/*if((AppInstance.CurrentMODEL_Header.getProperty("/DocType") == "NB2") || (AppInstance.CurrentMODEL_Header.getProperty("/DocType") == "NB2D")){*/
							if (headerDocType === "NB2" || headerDocType === "NB2D" || headerDocType === "NB2Z" || headerDocType === "N2ZD" ||
								headerDocType === "NB2F") {
								_message =
									"For ‘Normal’ & ‘Service’ PO’s - PDF of PO,including Terms and Conditions must be forwarded to vendor at time of order. \n \n Operation executed with following result\n ";
								/*}else if(AppInstance.CurrentMODEL_Header.getProperty("/DocType") == "NB3"){*/
							} else if (headerDocType === "NB3" || headerDocType === "NB3Z") {
								_message =
									"For Blanket PO - PO Number (without Terms & Conditions) can be forwarded to vendor at time of order. \n \n Operation executed with following result\n ";
							}
							// Issue 48 end
							//removed "Policy compliance – Order is valid once approved. \n" from above lines from _message
						}

						if (oData.ZtreturnStr !== "")
							JSON.parse(oData.ZtreturnStr).ITEMS.forEach(function(element, index) {

								//Start of Issue74 - hiding PO number display as 47XXXXXXXX from the message received during submit po scenario.
								//added index parameter to forEach function above along with element.
								var hidePO = "";

								//PO Number Hidden is only durin Submit, hence checking if it is for new PO and PO Number is in firstline of the message.
								if (action_char === 'P' && index === 0) {

									hidePO = element.MESSAGE.replace(/[0-9]/g, "");

									var splittedMessage = element.MESSAGE.split(" ");
									var poNumber = "";
									for (var i = 0; i < splittedMessage.length; i++) {
										if (!isNaN(splittedMessage[i]))
											poNumber = splittedMessage[i];
									}

									var firstTwoDigits = poNumber.slice(0, 2);

									for (var j = 2; j < poNumber.length; j++) {
										firstTwoDigits += "X";
									}
									console.log("Splitted Message" + splittedMessage);
									console.log("PO Number" + poNumber + " Marked number:" + firstTwoDigits);

									hidePO += firstTwoDigits;

								} else {
									hidePO = element.MESSAGE;
								}

								_message += "\n" + element.TYPE + " / " + element.ID + " / " + element.NUMBER + " / " + hidePO;

								// end of Issue 74
								//commented below line   	
								//	_message += "\n"+element.TYPE+" / "+element.ID+" / "+element.NUMBER+" / "+element.MESSAGE ;
							});

						sap.ui.core.BusyIndicator.hide();
						/* This code is commented to replace messagebox with dialog box inorder to make the firstline in the message as bold
												jQuery.sap.require("sap.m.MessageBox");

												sap.m.MessageBox.show(
													(_message), {
														icon: sap.m.MessageBox.Icon.INFORMATION,
														title: "Result",
														actions: [sap.m.MessageBox.Action.OK],
														onClose: function(oAction) {
															if ((AppInstance.lastSelected_POAction === "PO_ACTION__NEW") || (AppInstance.lastSelected_POAction === "PO_ACTION__COPY"))
																if (oData.Ponumber)
																	if (oData.Ponumber !== "")
																		AppInstance.navBack();
																	// Parse response string here in order to determine if it was an error or not
														}
													}
												);
												*/

						var dialog = new sap.m.Dialog({
							title: "Result",
							type: "Message",
							icon: "sap-icon://hint",
							content: [new sap.m.FormattedText({
									htmlText: "<strong>Policy compliance – Order is valid once approved.<strong>"
								}),
								new sap.m.Text({
									text: _message
								})
							],
							beginButton: new sap.m.Button({
								text: "OK",
								press: function() {
									dialog.close();

									if ((AppInstance.lastSelected_POAction === "PO_ACTION__NEW") || (AppInstance.lastSelected_POAction ===
											"PO_ACTION__COPY"))
										if (oData.Ponumber)
											if (oData.Ponumber !== "")
												AppInstance.navBack();
								}
							}),
							afterClose: function() {
								dialog.destroy();
							}
						});

						dialog.open();
						//new code ends here
					},
					error: function(oError) {

						sap.ui.core.BusyIndicator.hide();
						console.log(oError);
						var _message = "";
						/*
																			if (oData.ZtreturnStr !== "") {
																		    var errorJSON = JSON.parse(oData.ZtreturnStr) ;
																			    errorJSON.ITEMS.forEach(function(element){
																		    	_message += "\n"+element.TYPE+" / "+element.ID+" / "+element.NUMBER+" / "+element.MESSAGE ;
																		    });
																			}
																		    */
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageBox.show(
							("Could not create Purchase Order \n\n" + _message), {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {
									/* do something */
								}
							}
						);
					}
				});

				// UPDATE : sap.ui.getCore().AppContext.modelPOPOST.create("/ZPOPOSTSet(unique_id__keys ... 'col1'='val1' .... )",testPayload,{
			}

		},

		button_pressed_Items_Delete: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var AppInstance = this.getOwnerComponent().AppInstance;
			if ((this.getOwnerComponent().AppInstance.lastSelected_POAction === "PO_ACTION__EDIT") && (parseInt(this.getOwnerComponent().AppInstance
					.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/PoItem")) <= parseInt(AppInstance.lastFetchedItemIndexInCurrentPO_POItem))) {
				if (this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/DeleteInd") === "L") {
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/DeleteInd", "");
				} else {
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/DeleteInd", "L");
				}
				//this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
				this.reCalculateItemAndPOValues(rowIndex);
			} else {
				var jsonContent = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();
				jsonContent.results.splice(rowIndex, 1);
				this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(jsonContent);
				//this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
				this.reCalculateItemAndPOValues(rowIndex);
				this.getOwnerComponent().AppInstance.tablePOItems.setVisibleRowCount(this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData()
					.results.length);
			}
		},

		button_pressed_SubItems_Delete: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();
			var jsonContent = this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.getData();
			jsonContent.splice(rowIndex, 1);
			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setData(jsonContent);
			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.refresh(true);
			this.getOwnerComponent().AppInstance.tablePOSubItems.setVisibleRowCount(this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems
				.getData()
				.length);
		},

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		openItemHistoryDialog: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();
			var AppInstance = this.getOwnerComponent().AppInstance;
			this.getOwnerComponent().getModel("model__transfer_po").read("/ZtpohistorySet", {
				filters: [new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Items.getProperty(
						"/results/" + rowIndex + "/PoNumber")),
					new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Items.getProperty("/results/" +
						rowIndex + "/PoItem")),
					new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.EQ, "")
				],
				success: function(oData, oResponse) {
					AppInstance.CurrentMODEL_ItemHistory = new sap.ui.model.json.JSONModel();
					AppInstance.CurrentMODEL_ItemHistory.setData(oData);
					AppInstance.tableItemHistory.setModel(AppInstance.CurrentMODEL_ItemHistory);
					AppInstance.tableItemHistory.setVisibleRowCount(oData.results.length);
					AppInstance.dialogItemHistory.open();
				},
				error: function(error) {}
			});
		},

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		openDistributionManagementDialog: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			this.getOwnerComponent().AppInstance.lastSelected_ItemRowIndex = rowIndex;

			var selectedItemAccountJSON = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex +
				"/Zaccount");
			var selectedPoItem = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/PoItem");
			if (!selectedPoItem)
				selectedPoItem = "00010";

			this.getOwnerComponent().AppInstance.lastSelected_POItem = selectedPoItem;
			var selectedDistribution = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex +
				"/Distribkey");
			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_MaxDistrib_Quantity = parseFloat(this.getOwnerComponent().AppInstance.CurrentMODEL_Items
				.getProperty("/results/" + rowIndex + "/Quantity"));

			var selectedDistribution_Quantity = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex +
				"/Quantity");

			this.getOwnerComponent().AppInstance.selectedDistribution = selectedDistribution;

			if (selectedDistribution !== "0") {
				if (!((selectedDistribution_Quantity === undefined) || (selectedDistribution_Quantity === null) || (
						selectedDistribution_Quantity ===
						""))) {
					if (selectedDistribution === "1") {
						this.getOwnerComponent().AppInstance.selectedDistributionIsQuantity = true;
						this.getOwnerComponent().AppInstance.selectedDistributionIsPercentage = false;
					} else {
						this.getOwnerComponent().AppInstance.selectedDistributionIsQuantity = false;
						this.getOwnerComponent().AppInstance.selectedDistributionIsPercentage = true;
					}

					// Getting the SubItems as a JSON string from the selected Item structure
					this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems = new sap.ui.model.json.JSONModel(selectedItemAccountJSON);

					var jsonContent = JSON.parse(selectedItemAccountJSON);

					this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_ALL = [];
					// Splitting the contents of the SubItems array into the elements that pertain to the selected PO_ITEM
					// ( that should be processed in the dialog ) ...
					this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_InsideDistribution = [];
					// ... and the elements that do not belong to that specific PO_ITEM
					this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_OutsideDistribution = [];
					// This splitting is done in order to process the relevant data separately
					// and afterwards rebinding the two arrays together into the initial
					// JSON string content that will be set itot the Items model
					var _this = this;
					jsonContent.ITEMS.forEach(function(element) {

						if (element.PO_ITEM === selectedPoItem) {

							//element.GL_ACCOUNT = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/GlAccount") ;
							//element.GL_ACCOUNTTXT = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/GlAccounttxt") ;

							//element.COSTCENTER = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/Costcenter") ;
							//element.COSTCENTERTXT = this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/Costcentertxt") ;

							_this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_InsideDistribution.push(element);
						} else
							_this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_OutsideDistribution.push(element);
					});
					// Splitting done

					// Setting up the model and bindings on the SubItems dialog
					_this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setData(JSON.parse(JSON.stringify(this.getOwnerComponent().AppInstance
						.CurrentMODEL_SubItems_Entries_InsideDistribution)));
					_this.getOwnerComponent().AppInstance.tablePOSubItems.setModel(this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems);
					_this.getOwnerComponent().AppInstance.tablePOSubItems.bindRows({
						path: "/"
					});
					_this.getOwnerComponent().AppInstance.tablePOSubItems.setVisibleRowCount(this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems
						.getData().length);
					// Popping up the SubItems dialog
					this.getOwnerComponent().AppInstance.dialogSubItems.open();
				} else {
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.show(
						("Cannot open multiple selection until total quantity for selected item has been specified"), {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "Information",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {}
						}
					);
				}
			} else {
				jQuery.sap.require("sap.m.MessageBox");
				sap.m.MessageBox.show(
					("Cannot open multiple selection on Single Account"), {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Information",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {}
					}
				);
			}
		},

		closeDistributionManagementDialog_Cancel: function(oEvent) {
			this.getOwnerComponent().AppInstance.dialogSubItems.close();
		},

		closeItemHistoryDialog: function(oEvent) {
			this.getOwnerComponent().AppInstance.dialogItemHistory.close();
		},

		closeDistributionManagementDialog_Save: function(oEvent) {

			var AppInstance = this.getOwnerComponent().AppInstance;

			var can_close = true;

			var itemsData = this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.getData();
			var totalQuantity = 0.0;
			var totalPercentage = 0.0;

			itemsData.forEach(function(element) {
				totalQuantity += parseFloat(element.QUANTITY);
				totalPercentage += parseFloat(element.DISTR_PERC);
			});

			if (totalQuantity !== this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_MaxDistrib_Quantity) {
				this.AppInstance.displayMessage("Total subitems summed quantity must be equal\nto the overall item quantity : " + this.getOwnerComponent()
					.AppInstance.CurrentMODEL_SubItems_MaxDistrib_Quantity);
				can_close = false;
			}

			if (totalPercentage > this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_MaxDistrib_Percentage) {
				this.AppInstance.displayMessage("Total percentage exceeds 100%");
				can_close = false;
			}

			if (can_close) {

				// First , get data back from the modified JSON SubItems model into the array
				var __SubItemsData = this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.getData();

				if (__SubItemsData.length <= 1) {
					this.AppInstance.displayMessage(
						"Less than two distribution entries. Item distribution will automatically be switched to Single.");

					var rowIndex = this.getOwnerComponent().AppInstance.lastSelected_ItemRowIndex;
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Distribkey", "0");

					__SubItemsData =
						"[{ \"PO_NUMBER\":\"\",\"PO_ITEM\":\"" +
						this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/PoItem") +
						"\",\"SERIAL_NO\":\"01\",\"QUANTITY\":\"" +
						this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Quantity") +
						"\",\"DISTR_PERC\":\"0.0\",\"NET_VALUE\":\"" +
						this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/NetPrice") +
						"\",\"COSTCENTER\":\"" +
						this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Costcenter") +
						"\",\"ASSET_NO\":\"\",\"ORDERID\":\"\",\"GL_ACCOUNT\":\"" +
						this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/GlAccount") +
						"\",\"COSTCENTERTXT\":\"" +
						this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Costcentertxt") +
						"\",\"ASSET_NOTXT\":\"\",\"GL_ACCOUNTTXT\":\"" +
						this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/GlAccounttxt") +
						"\",\"ORDERIDTXT\":\"\",\"ACTION\":\"\",\"INPUT1\":\"\",\"INPUT2\":\"\",\"INPUT3\":\"\",\"INPUT4\":\"\",\"INPUT5\":\"\",\"INPUT6\":\"\",\"INPUT7\":\"\",\"INPUT8\":\"\",\"INPUT9\":\"\",\"INPUT10\":\"\",\"NUMERIC1\":\"0.0\",\"NUMERIC2\":\"0.0\",\"NUMERIC3\":\"0.0\"}]";

				}

				__SubItemsData.forEach(function(subElement) {
					subElement.INPUT1 = AppInstance.selectedDistribution;
				});

				console.log("SubItems data here :");
				console.log(__SubItemsData);
				this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_InsideDistribution = __SubItemsData;

				// Concatenate the items in the dialog with the rest of items that were not coresponding to thte specific PO_ITEM
				this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_ALL =
					this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_InsideDistribution.concat(
						this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_OutsideDistribution
					);

				// Save the concatenation back to the Item
				var _to_write_back_to_item = "{ \"ITEMS\" : " + JSON.stringify(this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_Entries_ALL) +
					" }";
				this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + this.getOwnerComponent().AppInstance.lastSelected_ItemRowIndex +
					"/Zaccount", _to_write_back_to_item);

				this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

				console.log("To write back to Item :");
				console.log(_to_write_back_to_item);

				this.getOwnerComponent().AppInstance.dialogSubItems.close();
			}
		},
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		fn_SubItems_Quantity_Change: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + oEvent.getSource().getParent().getIndex() +
				"/QUANTITY", oEvent.getParameters().newValue);

			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + oEvent.getSource().getParent().getIndex() +
				"/DISTR_PERC",
				(parseFloat(oEvent.getParameters().newValue) * 100 / this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_MaxDistrib_Quantity)
				.toFixed(2));

			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.refresh(true);
		},

		fn_SubItems_Percentage_Change: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + oEvent.getSource().getParent().getIndex() +
				"/DISTR_PERC", oEvent.getParameters().newValue);

			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + oEvent.getSource().getParent().getIndex() +
				"/QUANTITY",
				(parseFloat(oEvent.getParameters().newValue) * this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems_MaxDistrib_Quantity /
					100).toFixed(2));

			this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.refresh(true);
		},

		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// ON FOCUS OUT HANDLERS
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

		/*
								            path:"/ZtgetcostcenterSet",
								            filters : [ new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN"),
								            			new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/CompCode")) ],
								            template: new sap.m.StandardListItem({
								              	title: "{Costcenter} {Costcentertxt}",
								              	key : "{Costcenter}"


		*/
		// Issue 48 start for order field
		fn_focusout__ItemsOrder: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();
			var newValue = oEvent.getParameters().newValue;
			var sourceInput = oEvent.getSource();
			var AppInstance = this.getOwnerComponent().AppInstance;

			var oldKey = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Orderid");
			var oldValue = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Orderidxt");

			sourceInput.setBusyIndicatorDelay(0);
			sourceInput.setBusy(true);

			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetorderSet", {

				filters: [
					new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/CompCode")),
					new sap.ui.model.Filter("Kokrs", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/ContrArea")),
					new sap.ui.model.Filter("Acctasscat", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Items.getData().results[
						rowIndex].Acctasscat),
					// Issue 48
					new sap.ui.model.Filter("Orderidtxt", sap.ui.model.FilterOperator.Contains, newValue),
					new sap.ui.model.Filter("Orderid", sap.ui.model.FilterOperator.Contains, newValue)
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {

						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Orderid", oData.results[0].Orderid);
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Orderidtxt", oData.results[0].Orderidtxt);

						// Update the Single Account Distribution content	                            	
						if (AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Distribkey").toString() === "0") {
							var zAccStr = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Zaccount");
							var tempJSON = JSON.parse(zAccStr);
							if (tempJSON.ITEMS.length === 1) {
								tempJSON.ITEMS[0].ORDERID = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Orderid");
								tempJSON.ITEMS[0].ORDERIDTXT = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Orderidtxt");
							} else {
								tempJSON.ITEMS[rowIndex].ORDERID = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Orderid");
								tempJSON.ITEMS[rowIndex].ORDERIDTXT = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Orderidtxt");
							}
							AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Zaccount", JSON.stringify(tempJSON));
						}

						AppInstance.CurrentMODEL_Items.refresh(true);

					} else {
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Orderid", oldKey);
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Orderidtxt", oldValue);
						AppInstance.CurrentMODEL_Items.refresh(true);
					}
					sourceInput.setBusy(false);
				},
				error: function(error) {}
			});
		},
		// Issue 48 end

		fn_focusout__CostCenter: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();
			var newValue = oEvent.getParameters().newValue;
			var sourceInput = oEvent.getSource();
			var AppInstance = this.getOwnerComponent().AppInstance;

			var oldKey = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Costcenter");
			var oldValue = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Costcentertxt");

			sourceInput.setBusyIndicatorDelay(0);
			sourceInput.setBusy(true);

			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetcostcenterSet", {

				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN"),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/CompCode")),
					new sap.ui.model.Filter("Costcentertxt", sap.ui.model.FilterOperator.Contains, newValue),
					new sap.ui.model.Filter("Costcenter", sap.ui.model.FilterOperator.Contains, newValue)
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {

						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Costcenter", oData.results[0].Costcenter);
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Costcentertxt", oData.results[0].Costcentertxt);

						// Update the Single Account Distribution content	                            	
						if (AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Distribkey").toString() === "0") {
							var zAccStr = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Zaccount");
							var tempJSON = JSON.parse(zAccStr);
							/*following 2 lines updated due to the Cost Center field not updated apart from index 0 row. And if case is added to hadle the new row addition*/
							/*tempJSON.ITEMS[0].COSTCENTER = AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/Costcenter") ;
							tempJSON.ITEMS[0].COSTCENTERTXT = AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/Costcentertxt") ;*/
							if (tempJSON.ITEMS.length === 1) {
								tempJSON.ITEMS[0].COSTCENTER = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Costcenter");
								tempJSON.ITEMS[0].COSTCENTERTXT = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Costcentertxt");
							} else {
								tempJSON.ITEMS[rowIndex].COSTCENTER = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Costcenter");
								tempJSON.ITEMS[rowIndex].COSTCENTERTXT = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex +
									"/Costcentertxt");
							}
							AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Zaccount", JSON.stringify(tempJSON));
						}

						AppInstance.CurrentMODEL_Items.refresh(true);

					} else {
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Costcenter", oldKey);
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Costcentertxt", oldValue);
						AppInstance.CurrentMODEL_Items.refresh(true);
					}
					sourceInput.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout_GLAccount: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();
			var newValue = oEvent.getParameters().newValue;
			var sourceInput = oEvent.getSource();
			var AppInstance = this.getOwnerComponent().AppInstance;

			var oldKey = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/GlAccount");
			var oldValue = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/GlAccounttxt");

			sourceInput.setBusyIndicatorDelay(0);
			sourceInput.setBusy(true);

			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetglaccountSet", {

				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN"),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/CompCode")),
					new sap.ui.model.Filter("GlAccounttxt", sap.ui.model.FilterOperator.Contains, newValue),
					/*following line commented due to Gl Account help issue 15 Dec 2017*/
					new sap.ui.model.Filter("GlAccount", sap.ui.model.FilterOperator.Contains, newValue)
				],
				/*new sap.ui.model.Filter("GlAccount", sap.ui.model.FilterOperator.EQ, newValue)],*/
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/GlAccount", oData.results[0].GlAccount);
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/GlAccounttxt", oData.results[0].GlAccounttxt);

						// Update the Single Account Distribution content	
						if (AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Distribkey").toString() === "0") {
							var zAccStr = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Zaccount");
							var tempJSON = JSON.parse(zAccStr);
							/*tempJSON.ITEMS[0].GL_ACCOUNT = AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/GlAccount") ;
							tempJSON.ITEMS[0].GL_ACCOUNTTXT = AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/GlAccounttxt") ;*/

							if (tempJSON.ITEMS.length === 1) {
								tempJSON.ITEMS[0].GL_ACCOUNT = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/GlAccount");
								tempJSON.ITEMS[0].GL_ACCOUNTTXT = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/GlAccounttxt");
							} else {
								tempJSON.ITEMS[rowIndex].GL_ACCOUNT = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/GlAccount");
								tempJSON.ITEMS[rowIndex].GL_ACCOUNTTXT = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex +
									"/GlAccounttxt");
							}
							AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Zaccount", JSON.stringify(tempJSON));
						}

						AppInstance.CurrentMODEL_Items.refresh(true);
					} else {
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/GlAccount", "");
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/GlAccounttxt", "");
						AppInstance.CurrentMODEL_Items.refresh(true);
					}
					sourceInput.setBusy(false);
				},
				error: function(error) {}
			});

		},

		/*

		        path : "/Ztgetpounit1Set",
		        filters : [ new sap.ui.model.Filter("PurOrg", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg")),
		        			new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType"))],
		        template: new sap.m.StandardListItem({
		          	title: "{PoUnit} {Msehl}",
		          	key : "{PoUnit}"
		        })
		      });

			var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
			                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/"+rowIndex+"/PoUnit",oSelectedObject.PoUnit);
			                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/"+rowIndex+"/PoUnittxt",oSelectedObject.Msehl);
			                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

			                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/"+rowIndex+"/MatlGroup",oSelectedObject.MatlGroup);
			                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/"+rowIndex+"/MatlGrouptxt",oSelectedObject.MatlGrouptxt);
			                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

		*/

		fn_focusout_MaterialGroup: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();
			var newValue = oEvent.getParameters().newValue;
			var sourceInput = oEvent.getSource();
			var AppInstance = this.getOwnerComponent().AppInstance;

			var oldKey = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/MatlGroup");
			var oldValue = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/MatlGrouptxt");

			sourceInput.setBusyIndicatorDelay(0);
			sourceInput.setBusy(true);

			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetmatlgroupSet", {

				filters: [
					new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN"),
					new sap.ui.model.Filter("MatlGrouptxt", sap.ui.model.FilterOperator.Contains, newValue),
					new sap.ui.model.Filter("MatlGroup", sap.ui.model.FilterOperator.Contains, newValue)
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {

						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/MatlGroup", oData.results[0].MatlGroup);
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/MatlGrouptxt", oData.results[0].MatlGrouptxt);
						AppInstance.CurrentMODEL_Items.refresh(true);
					} else {
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/MatlGroup", "");
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/MatlGrouptxt", "");
						AppInstance.CurrentMODEL_Items.refresh(true);
					}
					sourceInput.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout__UM: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var newValue = oEvent.getParameters().newValue;
			var sourceInput = oEvent.getSource();
			var AppInstance = this.getOwnerComponent().AppInstance;

			var oldKey = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/PoUnit");
			var oldValue = AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/PoUnittxt");

			sourceInput.setBusyIndicatorDelay(0);
			sourceInput.setBusy(true);

			this.getOwnerComponent().getModel("model__f4_functions").read("/Ztgetpounit1Set", {

				filters: [
					new sap.ui.model.Filter("PurOrg", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg")),
					new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/DocType")),
					new sap.ui.model.Filter("PoUnit", sap.ui.model.FilterOperator.Contains, newValue),
					new sap.ui.model.Filter("Msehl", sap.ui.model.FilterOperator.Contains, newValue)
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {

						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PoUnit", oData.results[0].PoUnit);
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PoUnittxt", oData.results[0].Msehl);
						AppInstance.CurrentMODEL_Items.refresh(true);
					} else {
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PoUnit", oldKey);
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PoUnittxt", oldValue);
						AppInstance.CurrentMODEL_Items.refresh(true);
					}
					sourceInput.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout__DocumentType: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			AppInstance.__inputDocumentType.setBusy(true);
			var _this = this;
			var oldKey = AppInstance.CurrentMODEL_Header.getProperty("/DocType");
			var oldValue = AppInstance.CurrentMODEL_Header.getProperty("/DocTypetxt");
			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetdoctypeSet", {
				filters: [
					new sap.ui.model.Filter("DocTypetxt", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputDocumentType.getValue()).toUpperCase()),
					new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputDocumentType.getValue()).toUpperCase())
				],
				success: function(oData, oResponse) {
					console.log(oData);
					if (oData.results.length > 0) {
						AppInstance.CurrentMODEL_Header.setProperty("/DocType", oData.results[0].DocType);
						AppInstance.CurrentMODEL_Header.setProperty("/DocTypetxt", oData.results[0].DocTypetxt);
						AppInstance.CurrentMODEL_Header.refresh(true);

						// Reset for the Account Assignment & Item Category fields in the Items Table
						var itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();

						var selectedDocumentType = _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType");

						var _row_AccAss = "";
						var _row_AccAssTxt = "";
						var _row_ItemCat = "";
						var _row_ItemCatTxt = "";
						var _row_AU = "";
						var _row_AUTxt = "";

						if (selectedDocumentType === "NB2") {
							_row_AccAss = "K";
							_row_AccAssTxt = "Cost Center";
							_row_ItemCat = "";
							_row_ItemCatTxt = "Standard";
						} else
						if (selectedDocumentType === "NB2D") {
							_row_AccAss = "K";
							_row_AccAssTxt = "Cost Center";
							_row_ItemCat = "D";
							_row_ItemCatTxt = "Service";
							// Issue 50 language translation
							if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
								_row_AU = "LE";
								_row_AUTxt = "LE";
							} else {
								_row_AU = "AU";
								_row_AUTxt = "AU";
							}
							// Issue 50 end
						} else
						if (selectedDocumentType === "NB3") {
							_row_AccAss = "L";
							_row_AccAssTxt = "Limit";
							_row_ItemCat = "B";
							_row_ItemCatTxt = "Limit";
							// Issue 50 language translation
							if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
								_row_AU = "LE";
								_row_AUTxt = "LE";
							} else {
								_row_AU = "AU";
								_row_AUTxt = "AU";
							}
							// Issue 50 end
						}
						// issue 48 start
						else
						if (selectedDocumentType === "NB2Z") {
							_row_AccAss = "Z";
							_row_AccAssTxt = "Int Order";
							_row_ItemCat = "";
							_row_ItemCatTxt = "Standard";
						} else
						if (selectedDocumentType === "N2ZD") {
							_row_AccAss = "Z";
							_row_AccAssTxt = "Int Order";
							_row_ItemCat = "D";
							_row_ItemCatTxt = "Service";
							// Issue 50 language translation
							if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
								_row_AU = "LE";
								_row_AUTxt = "LE";
							} else {
								_row_AU = "AU";
								_row_AUTxt = "AU";
							}
							// Issue 50 end
						} else
						if (selectedDocumentType === "NB3Z") {
							_row_AccAss = "L";
							_row_AccAssTxt = "Limit";
							_row_ItemCat = "B";
							_row_ItemCatTxt = "Limit";
							// Issue 50 language translation
							if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
								_row_AU = "LE";
								_row_AUTxt = "LE";
							} else {
								_row_AU = "AU";
								_row_AUTxt = "AU";
							}
							// Issue 50 end
						} else
						if (selectedDocumentType === "NB2F") {
							_row_AccAss = "F";
							_row_AccAssTxt = "Order";
							_row_ItemCat = "";
							_row_ItemCatTxt = "Standard";
						}
						//Issue 48 end
						;

						itemsData.results.forEach(function(element) {
							element.Acctasscat = _row_AccAss;
							element.Acctasscattxt = _row_AccAssTxt;

							element.ItemCat = _row_ItemCat;
							element.ItemCattxt = _row_ItemCatTxt;

							/*Input 1 updated as per Issue 48 logic , so comment the issue 49 logic
			                            		  //Issue 49 start , Fill Input1 field with doc type
													element.Input1 = selectedDocumentType;
													//Issue 49 End
													*/
							/* Issue 48 start 
													If doc type is NB2F or NB2Z or N2ZD you should call it still with NB2. NB2F and NB2Z and N2ZD exists only in Fiori but not in SAP. 
			Also when we post we need to pass NB2 and not NB2F or NB2Z or N2ZD.*/
							// following block commented for test on 1 Aug 2018
							/*if ( selectedDocumentType ==="NB2D" || selectedDocumentType === "NB2F" || selectedDocumentType ==="NB2Z" || selectedDocumentType ==="N2ZD"){
									element.Input1 = "NB2";
							}else{
									element.Input1 = selectedDocumentType;
							}*/
							// following line added so that in the UI we have the reference of select document for Order column
							/*element.InpuDocType = selectedDocumentType;*/
							element.Input1 = selectedDocumentType;
							// Issue 48 end

							// Issue 48 start
							/*if ((selectedDocumentType === "NB2D") || ( selectedDocumentType === "NB3" ))*/
							//if ((selectedDocumentType === "NB2D") || (selectedDocumentType === "N2ZD") || (selectedDocumentType === "NB3") || (selectedDocumentType === "NB3Z"))
							if ((selectedDocumentType === "NB2D") || (selectedDocumentType === "N2ZD") || (selectedDocumentType === "NB2F") || (
									selectedDocumentType === "NB2Z") || (selectedDocumentType === "NB3") || (selectedDocumentType === "NB3Z"))
							// Issue 48 end
								element.Quantity = 1;

							element.PoUnit = _row_AU;
							element.PoUnittxt = _row_AU;

							element.Orderid = "";
							element.Orderidtxt = "";

							element.Costcenter = "";
							element.Costcentertxt = "";

							element.GlAccount = "";
							element.GlAccounttxt = "";

							element.Limit = "";

						});

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

					} else {
						AppInstance.CurrentMODEL_Header.setProperty("/DocType", oldKey);
						AppInstance.CurrentMODEL_Header.setProperty("/DocTypetxt", oldValue);
						AppInstance.CurrentMODEL_Header.refresh(true);
					}
					AppInstance.__inputDocumentType.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout_CompanyCode: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			var _this = this;
			AppInstance.__inputCompanyCode.setBusy(true);
			var oldKey = AppInstance.CurrentMODEL_Header.getProperty("/CompCode");
			var oldValue = AppInstance.CurrentMODEL_Header.getProperty("/CompCodetxt");
			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetcompcodeSet", {
				filters: [
					new sap.ui.model.Filter("Butxt", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputCompanyCode.getValue()).toUpperCase()),
					new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputCompanyCode.getValue()).toUpperCase())
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/CompCode", oData.results[0].CompCode);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/CompCodetxt", oData.results[0].Butxt);

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/ContrArea", oData.results[0].Kokrs);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Ktopl", oData.results[0].Ktopl);

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PurchOrg", "");
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PurchOrgtxt");

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendor", "");
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendorname");

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrms", "");
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrmstxt");

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Currency", "");

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);

						_this.fn_After_CompanyCode_Select();

					} else {
						AppInstance.CurrentMODEL_Header.setProperty("/CompCode", oldKey);
						AppInstance.CurrentMODEL_Header.setProperty("/CompCodetxt", oldValue);
						AppInstance.CurrentMODEL_Header.refresh(true);
					}
					AppInstance.__inputCompanyCode.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout_PurchasingOrganization: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			var _this = this;
			AppInstance.__inputPurchasingOrganization.setBusy(true);
			var oldKey = AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg");
			var oldValue = AppInstance.CurrentMODEL_Header.getProperty("/PurchOrgtxt");
			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetpurchorgSet", {
				filters: [
					new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputPurchasingOrganization.getValue())
						.toUpperCase()),
					new sap.ui.model.Filter("PurchOrgtxt", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputPurchasingOrganization.getValue())
						.toUpperCase()),
					new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/CompCode"))
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {
						AppInstance.CurrentMODEL_Header.setProperty("/PurchOrg", oData.results[0].PurchOrg);
						AppInstance.CurrentMODEL_Header.setProperty("/PurchOrgtxt", oData.results[0].PurchOrgtxt);
						AppInstance.CurrentMODEL_Header.refresh(true);
						_this.fn_After_PurchasingOrganization_Select();
					} else {
						AppInstance.CurrentMODEL_Header.setProperty("/PurchOrg", oldKey);
						AppInstance.CurrentMODEL_Header.setProperty("/PurchOrgtxt", oldValue);
						AppInstance.CurrentMODEL_Header.refresh(true);
					}
					AppInstance.__inputPurchasingOrganization.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout_Supplier: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			AppInstance.__inputSupplier.setBusy(true);
			var oldKey = AppInstance.CurrentMODEL_Header.getProperty("/Vendor");
			var oldValue = AppInstance.CurrentMODEL_Header.getProperty("/Vendorname");
			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetvendorSet", {
				filters: [
					new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputSupplier.getValue()).toUpperCase()),
					new sap.ui.model.Filter("Vendorname", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputSupplier.getValue()).toUpperCase()),
					new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg"))
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {
						AppInstance.CurrentMODEL_Header.setProperty("/Vendor", oData.results[0].Vendor);
						AppInstance.CurrentMODEL_Header.setProperty("/Vendorname", oData.results[0].Vendorname);

						AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrms", oData.results[0].Pmnttrms);
						AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrmstxt", oData.results[0].Pmnttrmsname);

						AppInstance.CurrentMODEL_Header.setProperty("/Currency", oData.results[0].Currency);
						var itemsData = AppInstance.CurrentMODEL_Items.getData();
						itemsData.results.forEach(function(element) {
							element.Currency = oData.results[0].Currency;
						});
						AppInstance.CurrentMODEL_Items.setData(itemsData);
						AppInstance.CurrentMODEL_Items.refresh(true);

						AppInstance.CurrentMODEL_Header.refresh(true);

					} else {
						AppInstance.CurrentMODEL_Header.setProperty("/Vendor", oldKey);
						AppInstance.CurrentMODEL_Header.setProperty("/Vendorname", oldValue);
						AppInstance.CurrentMODEL_Header.refresh(true);
					}
					AppInstance.__inputSupplier.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout_PurchasingGroup: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			AppInstance.__inputPurchasingGroup.setBusy(true);
			var oldKey = AppInstance.CurrentMODEL_Header.getProperty("/PurGroup");
			var oldValue = AppInstance.CurrentMODEL_Header.getProperty("/PurGrouptxt");
			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetpurgroupSet", {
				filters: [
					new sap.ui.model.Filter("Eknam", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputPurchasingGroup.getValue()).toUpperCase()),
					new sap.ui.model.Filter("PurGroup", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputPurchasingGroup.getValue()).toUpperCase())
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {
						AppInstance.CurrentMODEL_Header.setProperty("/PurGroup", oData.results[0].PurGroup);
						AppInstance.CurrentMODEL_Header.setProperty("/PurGrouptxt", oData.results[0].Eknam);
						AppInstance.CurrentMODEL_Header.refresh(true);
					} else {
						AppInstance.CurrentMODEL_Header.setProperty("/PurGroup", oldKey);
						AppInstance.CurrentMODEL_Header.setProperty("/PurGrouptxt", oldValue);
						AppInstance.CurrentMODEL_Header.refresh(true);
					}
					AppInstance.__inputPurchasingGroup.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout_Currency: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			AppInstance.__inputCurrency.setBusy(true);
			var oldKey = AppInstance.CurrentMODEL_Header.getProperty("/Currency");
			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetcurrencySet", {
				filters: [
					new sap.ui.model.Filter("Currency", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputCurrency.getValue()).toUpperCase()),
					new sap.ui.model.Filter("Currencytxt", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputCurrency.getValue()).toUpperCase())
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {
						AppInstance.CurrentMODEL_Header.setProperty("/Currency", oData.results[0].Currency);
						AppInstance.CurrentMODEL_Header.refresh(true);

						var itemsData = AppInstance.CurrentMODEL_Items.getData();
						itemsData.results.forEach(function(element) {
							element.Currency = oData.results[0].Currency;
						});

						AppInstance.CurrentMODEL_Items.setData(itemsData);
						AppInstance.CurrentMODEL_Items.refresh(true);
					} else {
						AppInstance.CurrentMODEL_Header.setProperty("/Currency", oldKey);
						AppInstance.CurrentMODEL_Header.refresh(true);
					}
					AppInstance.__inputCurrency.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout_headerText: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			// For header Text reading Input4 is used
			AppInstance.CurrentMODEL_Header.setProperty("/Input4", oEvent.getParameters().newValue);
			AppInstance.CurrentMODEL_Header.refresh(true);
		},

		fn_After_RequisitionerSelected: function() {
			var AppInstance = this.getOwnerComponent().AppInstance;
			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetreqemailSet", {
				filters: [new sap.ui.model.Filter("Bname", sap.ui.model.FilterOperator.EQ, ""),
					new sap.ui.model.Filter("SmtpAddr", sap.ui.model.FilterOperator.EQ, "")
				],
				success: function(oData, oResponse) {
					AppInstance.CurrentMODEL_Header.setProperty("/EMail", oData.results[0].SmtpAddr);
					AppInstance.CurrentMODEL_Header.refresh(true);
				},
				error: function(error) {}
			});
		},

		fn_After_CompanyCode_Select: function() {

			// Reset for the Plant fields in the Items Table
			var _this = this;
			var itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();

			itemsData.results.forEach(function(element) {
				element.Plant = "";
				element.Planttxt = "";

				element.Costcenter = "";
				element.Costcentertxt = "";

				element.GlAccount = "";
				element.GlAccounttxt = "";

				element.Orderid = "";
				element.Orderidtxt = "";

				element.Currency = "";
			});

			_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
			_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

			//var selectedDocumentType = 	_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType");
			var AppInstance = _this.getOwnerComponent().AppInstance;

			// ***
			// Looking for the plant coresponding to the specified Company Code

			_this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetplantSet", {

				filters: [
					new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
						.getProperty(
							"/CompCode"))
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {

						var _itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();
						_itemsData.results.forEach(function(element) {
							element.Plant = oData.results[0].Plant;
							element.Planttxt = oData.results[0].Name1;

							element.Name = oData.results[0].Name1;
							element.Street = oData.results[0].Street;
							element.StreetNo = oData.results[0].HouseNum1;
							element.PostlCod1 = oData.results[0].PostCode1;
							element.City = oData.results[0].City1;
							element.Region = oData.results[0].Region;
							element.Country = oData.results[0].Country;

						});

						AppInstance.lastSelected_ForNewItem_Plant_Plant = oData.results[0].Plant;
						AppInstance.lastSelected_ForNewItem_Plant_PlantText = oData.results[0].Name1;

						// following line added due to addition of the plant field in header 4 Dec 2017
						/*_this.getView().byId("plantHeader").setValue(oData.results[0].Plant);*/
						//	_this.getView().byId("plantHeader").setValue(AppInstance.lastSelected_ForNewItem_Plant_Plant);
						var newValue = "";
						newValue = AppInstance.lastSelected_ForNewItem_Plant_PlantText + "(" + AppInstance.lastSelected_ForNewItem_Plant_Plant +
							")";
						_this.getView().byId("plantHeader").setValue(newValue);

						AppInstance.defaultPlantAddres_Name = oData.results[0].Name1;
						AppInstance.defaultPlantAddres_Street = oData.results[0].Street;
						AppInstance.defaultPlantAddres_StreetNo = oData.results[0].HouseNum1;
						AppInstance.defaultPlantAddres_PostlCod1 = oData.results[0].PostCode1;
						AppInstance.defaultPlantAddres_City = oData.results[0].City1;
						AppInstance.defaultPlantAddres_Region = oData.results[0].Region;
						AppInstance.defaultPlantAddres_Country = oData.results[0].Country;

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(_itemsData);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

					} else {}
				},
				error: function(error) {}
			});
			// ***	                            	
		},

		fn_After_PurchasingOrganization_Select: function() {
			var AppInstance = this.getOwnerComponent().AppInstance;
			var _this = this;
			var selectedDocumentType = _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType");
			/*Looking for the unit of measure coresponding to the specified Purchasing Organization*/
			/*if (selectedDocumentType === "NB2")*/
			/*Issue 48 If condition changed*/
			/*If doc type is NB2F of NB2Z or N2ZD you should call it still with NB2. NB2F and NB2Z and N2ZD exists only in Fiori but not in SAP. 
			Also when we post we need to pass NB2 and not NB2F or NB2Z or N2ZD.*/
			/* for N2ZD the UOm should be AU always , so N2ZD is considered here */
			if (selectedDocumentType === "NB2" || selectedDocumentType === "NB2Z" || selectedDocumentType === "NB2F") {
				selectedDocumentType = "NB2";
				_this.getOwnerComponent().getModel("model__f4_functions").read("/Ztgetpounit1Set", {

					filters: [
						new sap.ui.model.Filter("PurOrg", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg")),
						/*Issue 48 following one line changed*/
						/*new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/DocType"))*/
						new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, selectedDocumentType)
					],
					success: function(oData, oResponse) {
						if (oData.results.length > 0) {

							var itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();
							itemsData.results.forEach(function(element) {
								element.PoUnit = oData.results[0].PoUnit;
								element.PoUnittxt = oData.results[0].Msehl;
							});
							AppInstance.lastSelected_ForNewItem_UM_PoUnit = oData.results[0].PoUnit;
							AppInstance.lastSelected_ForNewItem_UM_PoUnitText = oData.results[0].Msehl;
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
							_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

						} else {}
					},
					error: function(error) {}
				});
			} /* added due to Issue 48 */
		},

		fn_focusout_Requisitioner: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			AppInstance.__inputRequisitioner.setBusy(true);
			var _this = this;
			var oldKey = AppInstance.CurrentMODEL_Header.getProperty("/PreqName");
			var oldValue = AppInstance.CurrentMODEL_Header.getProperty("/PreqNametxt");
			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetpreqnameSet", {
				filters: [
					new sap.ui.model.Filter("PreqName", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputRequisitioner.getValue()).toUpperCase()),
					new sap.ui.model.Filter("NameTextc", sap.ui.model.FilterOperator.Contains, (AppInstance.__inputRequisitioner.getValue()).toUpperCase())
				],
				success: function(oData, oResponse) {
					if (oData.results.length > 0) {
						AppInstance.CurrentMODEL_Header.setProperty("/PreqName", oData.results[0].PreqName);
						AppInstance.CurrentMODEL_Header.setProperty("/PreqNametxt", oData.results[0].NameTextc);
						AppInstance.CurrentMODEL_Header.refresh(true);
						//_this.fn_After_RequisitionerSelected(oData.results[0].PreqName);
					} else {
						AppInstance.CurrentMODEL_Header.setProperty("/PreqName", oldKey);
						AppInstance.CurrentMODEL_Header.setProperty("/PreqNametxt", oldValue);
						AppInstance.CurrentMODEL_Header.refresh(true);
					}
					AppInstance.__inputRequisitioner.setBusy(false);
				},
				error: function(error) {}
			});
		},

		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// HELPERS FOR TABLE ITEMS INPUTS
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

		// Items Table Helper Function - Account Assignment
		fn_val_hlp_req__Items_AccountAssignment: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var AppInstance = this.getOwnerComponent().AppInstance;
			var selectDialog = new sap.m.SelectDialog({
				title: "Account Assignment",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Acctasscat", oSelectedObject.Acctasscat);
					AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Acctasscattxt", oSelectedObject.Acctasscattxt);

					AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/ItemCat", "");
					AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/ItemCattxt", "");

					switch (oSelectedObject.Acctasscat) {
						case "K":
							AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Orderid", "");
							AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Orderidtxt", "");
							break;
						case "F":
							AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Costcenter", "");
							AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Costcentertxt", "");
							break;
						default:
							break;

					}

					AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Limit", "");
					AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/ItemCat", "");

					AppInstance.CurrentMODEL_Items.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Acctasscattxt", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Acctasscat", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetacctassSet",
				filters: [new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty(
					"/DocType"))],
				template: new sap.m.StandardListItem({
					title: "{Acctasscat} {Acctasscattxt}",
					key: "{Acctasscat}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// Items Table Helper Function - Items Category
		fn_val_hlp_req__Items_ItemCategory: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var AppInstance = this.getOwnerComponent().AppInstance;
			var distributionComboBox = sap.ui.core.Fragment.byId(this.getView().createId("fragmentItemData_GeneralData"),
				"comboSelectDistribution");
			var selectDialog = new sap.m.SelectDialog({
				title: "Items Category",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/ItemCat", oSelectedObject.ItemCat);
					AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/ItemCattxt", oSelectedObject.Ptext);

					if ((oSelectedObject.ItemCat === "B") || (oSelectedObject.ItemCat === "9") || (oSelectedObject.ItemCat === "D")) {
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Limit", "");

						//if (AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/Acctasscat") === "L") {

						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Quantity", 1);

						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PoUnit", "AU");
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PoUnittxt", "AU");

						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/NetPrice", AppInstance.CurrentMODEL_Items.getProperty(
							"/results/" + rowIndex + "/Limit"));

						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Zaccount",
							"{\"ITEMS\" : [{ \"PO_NUMBER\":\"\",\"PO_ITEM\":\"" +
							AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/PoItem") +
							"\",\"SERIAL_NO\":\"01\",\"QUANTITY\":\"" +
							AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Quantity") +
							"\",\"DISTR_PERC\":\"0.0\",\"NET_VALUE\":\"" +
							AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/NetPrice") + "\",\"COSTCENTER\":\"" +
							AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Costcenter")

							+ "\",\"ASSET_NO\":\"\",\"ORDERID\":\"\",\"GL_ACCOUNT\":\"" +
							AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/GlAccount") + "\",\"COSTCENTERTXT\":\"" +
							AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Costcentertxt") +
							"\",\"ASSET_NOTXT\":\"\",\"GL_ACCOUNTTXT\":\"" +
							AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/GlAccounttxt") +
							"\",\"ORDERIDTXT\":\"\",\"ACTION\":\"\",\"INPUT1\":\"\",\"INPUT2\":\"\",\"INPUT3\":\"\",\"INPUT4\":\"\",\"INPUT5\":\"\",\"INPUT6\":\"\",\"INPUT7\":\"\",\"INPUT8\":\"\",\"INPUT9\":\"\",\"INPUT10\":\"\",\"NUMERIC1\":\"0.0\",\"NUMERIC2\":\"0.0\",\"NUMERIC3\":\"0.0\" }]}"
						);

						//if ((oSelectedObject.ItemCat === "D") || (oSelectedObject.ItemCat === "B")) {
						AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Distribkey", "0");
						// if you manage to trigger this , remove the above block because it's a duplicate of the one in the combo change event !
						//	}

					}

					AppInstance.CurrentMODEL_Items.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Ptext", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("ItemCat", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetitemcatSet",
				filters: [new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty(
						"/DocType")),
					new sap.ui.model.Filter("Acctasscat", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Items.getProperty("/results/" +
						rowIndex + "/Acctasscat")),
					new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")
				],
				template: new sap.m.StandardListItem({
					title: "{ItemCat} {Ptext}",
					key: "{ItemCat}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();

		},

		// Items Table Helper Function - Short Text
		fn_val_hlp_req__Items_ShortText: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/ShortText", oEvent.getParameters().newValue);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		// Items Table Helper Function - Material Group
		fn_val_hlp_req__Items_MaterialGroup: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Material Group",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/MatlGroup", oSelectedObject.MatlGroup);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/MatlGrouptxt",
						oSelectedObject
						.MatlGrouptxt);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("MatlGrouptxt", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("MatlGroup", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetmatlgroupSet",
				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")],
				template: new sap.m.StandardListItem({
					title: "{MatlGroup} {MatlGrouptxt}",
					key: "{MatlGroup}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();

		},

		// Items Table Helper Function - Plant
		fn_val_hlp_req__Items_Plant: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Plant",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Plant", oSelectedObject.Plant);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Planttxt", oSelectedObject.Name1);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Name", oSelectedObject.Name1);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Street", oSelectedObject.Street);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/StreetNo", oSelectedObject.HouseNum1);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PostlCod1", oSelectedObject.PostCode1);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/City", oSelectedObject.City1);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Region", oSelectedObject.Region);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Country", oSelectedObject.Country);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
					_this.getView().byId("plantHeader").setValue("1234");

				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetplantSet",
				filters: [new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
					.getProperty("/CompCode"))],
				template: new sap.m.StandardListItem({
					title: "{Plant} {Name1}",
					key: "{Plant}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();

		},

		// Items Table Helper Function - Plant this is added due to addition of plant feild in header 4 Dec 2017
		fn_val_hlp_req__Header_Plant: function(oEvent) {

			var rowIndex = 0;
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Plant",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();

					// _this.getView().byId("plantHeader").setValue(oSelectedObject.Plant);
					_this.getView().byId("plantHeader").setValue(oSelectedObject.Name1 + "(" + oSelectedObject.Plant + ")");

					// fill the Item table with same value of plant
					for (rowIndex = 0; rowIndex < _this.AppInstance.tablePOItems.getRows().length; rowIndex++) {
						//	_this.AppInstance.tablePOItems.getRows()[rowIndex].getCells()[6].setValue(oSelectedObject.Plant);

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Plant", oSelectedObject.Plant);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Planttxt", oSelectedObject.Name1);
						// update delivery address table
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Name", oSelectedObject.Name1);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Street", oSelectedObject.Street);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/StreetNo", oSelectedObject.HouseNum1);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PostlCod1", oSelectedObject
							.PostCode1);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/City", oSelectedObject.City1);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Region", oSelectedObject.Region);
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Country", oSelectedObject.Country);

						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
					}

				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetplantSet",
				filters: [new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
					.getProperty("/CompCode"))],
				template: new sap.m.StandardListItem({
					title: "{Plant} {Name1}",
					key: "{Plant}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();

		},

		// Items Table Helper Function - Unit of Measure
		fn_val_hlp_req__Items_UnitOfMeasure: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Unit of Measure",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PoUnit", oSelectedObject.PoUnit);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/PoUnittxt", oSelectedObject.Msehl);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					//filters.push(new sap.ui.model.Filter("PurOrg", sap.ui.model.FilterOperator.Contains, value));
					//	filters.push(new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				//path:"/Ztgetpounit1Set(PurOrg='"+this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg")+"',DocType='"+this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType")+"')",
				path: "/Ztgetpounit1Set",
				filters: [],
				/*			filters: [new sap.ui.model.Filter("PurOrg", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
									.getProperty("/PurchOrg")),
								new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
									.getProperty(
										"/DocType"))
							],
							*/
				template: new sap.m.StandardListItem({
					title: "{PoUnit} {Msehl}",
					key: "{PoUnit}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// Items Table Helper Function - Order
		fn_val_hlp_req__Items_Order: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Order",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Orderid", oSelectedObject.Orderid);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Orderidtxt", oSelectedObject
						.Orderidtxt);

					// Update the Single Account Distribution content	                            	
					if (_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Distribkey").toString() ===
						"0") {
						var zAccStr = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Zaccount");
						var tempJSON = JSON.parse(zAccStr);
						tempJSON.ITEMS[0].ORDERID = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex +
							"/Orderid");
						tempJSON.ITEMS[0].ORDERIDTXT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex +
							"/Orderidtxt");
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Zaccount", JSON.stringify(
							tempJSON));
					};

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Orderidtxt", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Orderid", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetorderSet",
				filters: [new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
						.getProperty("/CompCode")),
					new sap.ui.model.Filter("Kokrs", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty(
						"/ContrArea")),
					// Issue 48
					new sap.ui.model.Filter("Acctasscat", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Items
						.getData().results[rowIndex].Acctasscat)
					// Issue 48
				],
				template: new sap.m.StandardListItem({
					title: "{Orderid} {Orderidtxt}",
					key: "{Orderid}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// Items Table Helper Function - Account
		fn_val_hlp_req__Items_Account: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Account",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/GlAccount", oSelectedObject.GlAccount);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/GlAccounttxt",
						oSelectedObject
						.GlAccounttxt);

					// Update the Single Account Distribution content	
					if (_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Distribkey").toString() ===
						"0") {
						var zAccStr = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Zaccount");
						var tempJSON = JSON.parse(zAccStr);
						/*following 2 lines updated due to the GL Account field not updated apart from index 0 row. And if case is added to hadle the new row addition*/
						/*tempJSON.ITEMS[0].GL_ACCOUNT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/GlAccount") ;
						tempJSON.ITEMS[0].GL_ACCOUNTTXT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/GlAccounttxt") ;*/
						if (tempJSON.ITEMS.length === 1) {
							tempJSON.ITEMS[0].GL_ACCOUNT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex +
								"/GlAccount");
							tempJSON.ITEMS[0].GL_ACCOUNTTXT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" +
								rowIndex + "/GlAccounttxt");
						} else {
							tempJSON.ITEMS[rowIndex].GL_ACCOUNT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" +
								rowIndex + "/GlAccount");
							tempJSON.ITEMS[rowIndex].GL_ACCOUNTTXT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" +
								rowIndex + "/GlAccounttxt");
						}
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Zaccount", JSON.stringify(
							tempJSON));
					};

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					_filters = [];
				if (value.length) {
					_filters.push(new sap.ui.model.Filter("GlAccount", sap.ui.model.FilterOperator.Contains, value));
					_filters.push(new sap.ui.model.Filter("GlAccounttxt", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(_filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetglaccountSet",
				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN"),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty(
						"/CompCode"))
				],
				template: new sap.m.StandardListItem({
					title: "{GlAccount} {GlAccounttxt}",
					key: "{GlAccount}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// Items Table Helper Function - Cost Center
		fn_val_hlp_req__Items_CostCenter: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Cost Center",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Costcenter", oSelectedObject
						.Costcenter);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Costcentertxt",
						oSelectedObject.Costcentertxt);

					// Update the Single Account Distribution content	                            	
					if (_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Distribkey").toString() ===
						"0") {
						var zAccStr = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex + "/Zaccount");
						var tempJSON = JSON.parse(zAccStr);
						/*following 2 lines updated due to the Cost Center field not updated apart from index 0 row. And if case is added to hadle the new row addition*/
						/*tempJSON.ITEMS[0].COSTCENTER = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/Costcenter") ;
						tempJSON.ITEMS[0].COSTCENTERTXT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/"+rowIndex+"/Costcentertxt") ;*/
						if (tempJSON.ITEMS.length === 1) {
							tempJSON.ITEMS[0].COSTCENTER = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + rowIndex +
								"/Costcenter");
							tempJSON.ITEMS[0].COSTCENTERTXT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" +
								rowIndex + "/Costcentertxt");
						} else {
							tempJSON.ITEMS[rowIndex].COSTCENTER = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" +
								rowIndex + "/Costcenter");
							tempJSON.ITEMS[rowIndex].COSTCENTERTXT = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" +
								rowIndex + "/Costcentertxt");
						}
						_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + rowIndex + "/Zaccount", JSON.stringify(
							tempJSON));
					};

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Costcenter", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Costcentertxt", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetcostcenterSet",
				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN"),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty(
						"/CompCode"))
				],
				template: new sap.m.StandardListItem({
					title: "{Costcenter} {Costcentertxt}",
					key: "{Costcenter}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// Items Table Helper Function - Distribution
		fn_val_hlp_req__Items_Distribution: function(oEvent) {
			var selectedKey = oEvent.getParameters().selectedItem.getKey();
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/Distribkey", selectedKey);

			if (selectedKey === "0")
				this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
					"/Zaccount",
					"{\"ITEMS\" : [{ \"PO_NUMBER\":\"\",\"PO_ITEM\":\"" +
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource().getParent().getIndex() +
						"/PoItem") +
					"\",\"SERIAL_NO\":\"01\",\"QUANTITY\":\"" +
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource().getParent().getIndex() +
						"/Quantity") + "\",\"DISTR_PERC\":\"0.0\",\"NET_VALUE\":\"" +
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource().getParent().getIndex() +
						"/NetPrice") + "\",\"COSTCENTER\":\"" +
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource().getParent().getIndex() +
						"/Costcenter")

					+ "\",\"ASSET_NO\":\"\",\"ORDERID\":\"\",\"GL_ACCOUNT\":\"" +
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource().getParent().getIndex() +
						"/GlAccount") + "\",\"COSTCENTERTXT\":\"" +
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource().getParent().getIndex() +
						"/Costcentertxt") + "\",\"ASSET_NOTXT\":\"\",\"GL_ACCOUNTTXT\":\"" +
					this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getProperty("/results/" + oEvent.getSource().getParent().getIndex() +
						"/GlAccounttxt") +
					"\",\"ORDERIDTXT\":\"\",\"ACTION\":\"\",\"INPUT1\":\"\",\"INPUT2\":\"\",\"INPUT3\":\"\",\"INPUT4\":\"\",\"INPUT5\":\"\",\"INPUT6\":\"\",\"INPUT7\":\"\",\"INPUT8\":\"\",\"INPUT9\":\"\",\"INPUT10\":\"\",\"NUMERIC1\":\"0.0\",\"NUMERIC2\":\"0.0\",\"NUMERIC3\":\"0.0\" }]}"
				);
			//
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		// Items Table Helper Function - Final Invoice
		fn_val_hlp_req_Items_FinalInvoice: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/Delivcompleted", oEvent.getParameters().selected);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		// Address fields change
		fn_liveChange_Address__Name: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/Name", oEvent.getParameters().newValue);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		fn_liveChange_Address__Street: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/Street", oEvent.getParameters().newValue);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		fn_liveChange_Address__StreetNo: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/StreetNo", oEvent.getParameters().newValue);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		fn_liveChange_Address__PostalCode: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/PostlCod1", oEvent.getParameters().newValue);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		fn_liveChange_Address__City: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/City", oEvent.getParameters().newValue);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		fn_liveChange_Address__Region: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/Region", oEvent.getParameters().newValue);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},
		fn_liveChange_Address__Country: function(oEvent) {
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setProperty("/results/" + oEvent.getSource().getParent().getIndex() +
				"/Country", oEvent.getParameters().newValue);
			this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
		},

		/*
					// -------------------------
					
					handleSuggestDocumentType : function (oEvent) {
						var searchText = oEvent.getParameters().value ;
						this.getOwnerComponent().AppInstance.__inputDocumentType.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
						if (searchText.length > 0) {
							this.getOwnerComponent().AppInstance.__inputDocumentType.bindAggregation("suggestionItems","/ZtgetdoctypeSet",new sap.ui.core.Item({
								text : "{DocType} {DocTypetxt}"
							}));
						}

					},
					
					handleSuggestDocumentType_Submit : function (oEvent) {
						var _key = oEvent.getParameters().value.split(/ (.+)/)[0];
						var _text = oEvent.getParameters().value.split(/ (.+)/)[1];

						this.getOwnerComponent().AppInstance.__inputDocumentType.setModel(this.getOwnerComponent().AppInstance.CurrentMODEL_Header);
						this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/DocType",_key);
			            this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/DocTypetxt",_text);
			
			            this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);
					},
		*/

		// HEADER Helper Function - Document Type
		fn_val_hlp_req__DocumentType: function(oEvent) {
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Document Type",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/DocType", oSelectedObject.DocType);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/DocTypetxt", oSelectedObject.DocTypetxt);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);

					// Reset for the Account Assignment & Item Category fields in the Items Table
					var itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();

					var selectedDocumentType = _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType");

					var _row_AccAss = "";
					var _row_AccAssTxt = "";
					var _row_ItemCat = "";
					var _row_ItemCatTxt = "";
					var _row_AU = "";
					var _row_AUTxt = "";

					if (selectedDocumentType === "NB2") {
						_row_AccAss = "K";
						_row_AccAssTxt = "Cost Center";
						_row_ItemCat = "";
						_row_ItemCatTxt = "Standard";
					} else
					if (selectedDocumentType === "NB2D") {
						_row_AccAss = "K";
						_row_AccAssTxt = "Cost Center";
						_row_ItemCat = "D";
						_row_ItemCatTxt = "Service";
						// Issue 50 language translation
						if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
							_row_AU = "LE";
							_row_AUTxt = "LE";
						} else {
							_row_AU = "AU";
							_row_AUTxt = "AU";
						}
						// Issue 50 end
					} else
					if (selectedDocumentType === "NB3") {
						_row_AccAss = "L";
						_row_AccAssTxt = "Limit";
						_row_ItemCat = "B";
						_row_ItemCatTxt = "Limit";
						// Issue 50 language translation
						if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
							_row_AU = "LE";
							_row_AUTxt = "LE";
						} else {
							_row_AU = "AU";
							_row_AUTxt = "AU";
						}
						// Issue 50 end
					}
					// issue 48 start
					else
					if (selectedDocumentType === "NB2Z") {
						_row_AccAss = "Z";
						_row_AccAssTxt = "Int Order";
						_row_ItemCat = "";
						_row_ItemCatTxt = "Standard";
					} else
					if (selectedDocumentType === "N2ZD") {
						_row_AccAss = "Z";
						_row_AccAssTxt = "Int Order";
						_row_ItemCat = "D";
						_row_ItemCatTxt = "Service";
						// Issue 50 language translation
						if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
							_row_AU = "LE";
							_row_AUTxt = "LE";
						} else {
							_row_AU = "AU";
							_row_AUTxt = "AU";
						}
						// Issue 50 end
					} else
					if (selectedDocumentType === "NB3Z") {
						_row_AccAss = "L";
						_row_AccAssTxt = "Limit";
						_row_ItemCat = "B";
						_row_ItemCatTxt = "Limit";
						// Issue 50 language translation
						if (_this.getOwnerComponent().AppInstance.sCurrentLocale == "de") {
							_row_AU = "LE";
							_row_AUTxt = "LE";
						} else {
							_row_AU = "AU";
							_row_AUTxt = "AU";
						}
						// Issue 50 end
					} else
					if (selectedDocumentType === "NB2F") {
						_row_AccAss = "F";
						_row_AccAssTxt = "Order";
						_row_ItemCat = "";
						_row_ItemCatTxt = "Standard";
					}
					//Issue 48 end
					;

					itemsData.results.forEach(function(element) {
						element.Acctasscat = _row_AccAss;
						element.Acctasscattxt = _row_AccAssTxt;

						element.ItemCat = _row_ItemCat;
						element.ItemCattxt = _row_ItemCatTxt;

						element.PoUnit = _row_AU;
						element.PoUnittxt = _row_AU;

						/*Input 1 updated as per Issue 48 logic , so comment the issue 49 logic
	                            		  //Issue 49 start , Fill Input1 field with doc type
											element.Input1 = selectedDocumentType;
											//Issue 49 End
											*/

						/* Issue 48 start 
													If doc type is NB2F or NB2Z or N2ZD you should call it still with NB2. NB2F and NB2Z and N2ZD exists only in Fiori but not in SAP. 
			Also when we post we need to pass NB2 and not NB2F or NB2Z or N2ZD.*/
						// following block commented for test on 1 Aug 2018
						/*if ( selectedDocumentType ==="NB2D" || selectedDocumentType === "NB2F" || selectedDocumentType ==="NB2Z" || selectedDocumentType ==="N2ZD"){
								element.Input1 = "NB2";
						}else{
								element.Input1 = selectedDocumentType;
						}*/

						// following line added so that in the UI we have the reference of select document for Order column
						/*element.InpuDocType = selectedDocumentType;*/
						element.Input1 = selectedDocumentType;
						// Issue 48 end

						// Issue 48 start
						/*if ((selectedDocumentType === "NB2D") || ( selectedDocumentType === "NB3" ))*/
						//if ((selectedDocumentType === "NB2D") || (selectedDocumentType === "N2ZD") || (selectedDocumentType === "NB3") || (selectedDocumentType === "NB3Z"))
						if ((selectedDocumentType === "NB2D") || (selectedDocumentType === "N2ZD") || (selectedDocumentType === "NB2F") || (
								selectedDocumentType === "NB2Z") || (selectedDocumentType === "NB3") || (selectedDocumentType === "NB3Z"))
						// Issue 48 end
							element.Quantity = "1";

						element.Orderid = "";
						element.Orderidtxt = "";

						element.Costcenter = "";
						element.Costcentertxt = "";

						element.GlAccount = "";
						element.GlAccounttxt = "";

						element.Limit = "";
					});

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("DocTypetxt", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetdoctypeSet",
				filters: [],
				template: new sap.m.StandardListItem({
					title: "{DocType} {DocTypetxt}",
					key: "{DocType}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// HEADER Helper Function - Company Code
		fn_val_hlp_req__CompanyCode: function(oEvent) {
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Company Code",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/CompCode", oSelectedObject.CompCode);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/CompCodetxt", oSelectedObject.Butxt);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/ContrArea", oSelectedObject.Kokrs);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Ktopl", oSelectedObject.Ktopl);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PurchOrg", "");
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PurchOrgtxt");

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendor", "");
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendorname");

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrms", "");
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrmstxt");

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Currency", "");

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);

					_this.fn_After_CompanyCode_Select();

				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Butxt", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetcompcodeSet",
				filters: [],
				template: new sap.m.StandardListItem({
					title: "{CompCode} {Butxt}",
					key: "{CompCode}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// HEADER Helper Function - Purchasing Organization
		fn_val_hlp_req__PurchasingOrganization: function(oEvent) {
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Purchasing Organization",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PurchOrg", oSelectedObject.PurchOrg);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PurchOrgtxt", oSelectedObject.PurchOrgtxt);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendor", "");
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendorname");

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrms", "");
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrmstxt");

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Currency", "");

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);

					var itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();

					var selectedDocumentType = _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/DocType");

					itemsData.results.forEach(function(element) {
						element.Currency = "";
					});
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

					var AppInstance = _this.getOwnerComponent().AppInstance;

					_this.fn_After_PurchasingOrganization_Select();

				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("PurchOrgtxt", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetpurchorgSet",
				filters: [new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.EQ, ""),
					new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
						.getProperty(
							"/CompCode"))
				],
				template: new sap.m.StandardListItem({
					title: "{PurchOrg} {PurchOrgtxt}",
					key: "{PurchOrg}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// HEADER Helper Function - Supplier (Vendor)
		fn_val_hlp_req__Supplier: function(oEvent) {
			var _this = this;
			/*var selectDialog = new sap.m.SelectDialog({
	        					title: "Supplier",
	                            confirm: function(oevent){
	                            	var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject() ;
	                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendor",oSelectedObject.Vendor);
	                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendorname",oSelectedObject.Vendorname);
	                            	
	                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrms",oSelectedObject.Pmnttrms);
	                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrmstxt",oSelectedObject.Pmnttrmsname);
	                            	
	                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Currency",oSelectedObject.Currency);
	                            	
	                            	var itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData() ;
	                            	
	                            	itemsData.results.forEach(function(element) {
	                            		  element.Currency = oSelectedObject.Currency ;
	                            	});
	                            	
	                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
	                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);
	                            	
	                            	_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);
	                            },
	                            cancel: function(oevent){}
                          });*/

			var tableSelectDialog = new sap.m.TableSelectDialog({
				title: "Supplier",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendor", oSelectedObject.Vendor);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Vendorname", oSelectedObject.Vendorname);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrms", oSelectedObject.Pmnttrms);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrmstxt", oSelectedObject.Pmnttrmsname);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Currency", oSelectedObject.Currency);

					var itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();

					itemsData.results.forEach(function(element) {
						element.Currency = oSelectedObject.Currency;
					});

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);
				},
				cancel: function(oevent) {},
				columns: [
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Vendor"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Name"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Name2"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Search Term"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "City"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Address"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Country"
						})
					}),
					new sap.m.Column({
						header: new sap.m.Label({
							text: "Currency"
						})
					})
				],
				items: {
					path: "/ZtgetvendorSet",
					template: new sap.m.ColumnListItem({
						cells: [
							new sap.m.Text({
								text: "{Vendor}"
							}),
							new sap.m.Text({
								text: "{Vendorname}"
							}),
							new sap.m.Text({
								text: "{Name2}"
							}),
							new sap.m.Text({
								text: "{Sortl}"
							}),
							new sap.m.Text({
								text: "{Ort01}"
							}),
							new sap.m.Text({
								text: "{Stras}"
							}),
							new sap.m.Text({
								text: "{Land1}"
							}),
							new sap.m.Text({
								text: "{Currency}"
							})
						]
					})
				}
			});

			tableSelectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				var oFilters;
				if (value.length) {
					filters.push(new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
						.getProperty("/PurchOrg")));
					filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Vendorname", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Name2", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Sortl", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Ort01", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Stras", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Land1", sap.ui.model.FilterOperator.Contains, value));
					//filters.push(new sap.ui.model.Filter("Currency", sap.ui.model.FilterOperator.Contains, value));
				} else {
					filters.push(new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
						.getProperty("/PurchOrg")));
				}
				oFilters = new sap.ui.model.Filter(filters, true);

				binding.filter(oFilters, sap.ui.model.FilterType.Application);
			});

			tableSelectDialog.bindAggregation("items", {
				path: "/ZtgetvendorSet",
				filters: [new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
					.getProperty("/PurchOrg"))],
				template: new sap.m.ColumnListItem({
					cells: [
						new sap.m.Text({
							text: "{Vendor}"
						}),
						new sap.m.Text({
							text: "{Vendorname}"
						}),
						new sap.m.Text({
							text: "{Name2}"
						}),
						new sap.m.Text({
							text: "{Sortl}"
						}),
						new sap.m.Text({
							text: "{Ort01}"
						}),
						new sap.m.Text({
							text: "{Stras}"
						}),
						new sap.m.Text({
							text: "{Land1}"
						}),
						new sap.m.Text({
							text: "{Currency}"
						})
					]
				})
			});

			tableSelectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			tableSelectDialog.open();

			/*selectDialog.attachSearch(function (_oEvent) {
                          		var binding = _oEvent.getParameter("itemsBinding"),
									value = _oEvent.getParameter("value"),
									filters = [];
									// following block due to enhancement of columns in f4 help - feb 2018
								// if(value.length){
								// 	filters.push(new sap.ui.model.Filter("Vendorname", sap.ui.model.FilterOperator.Contains, value));
								// 	filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.Contains, value));
								// }
								// binding.filter(filters);
								var oFilters;
				if (value.length) {
					filters.push(new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg")));
					filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Vendorname", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Name2", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Sortl", sap.ui.model.FilterOperator.Contains, value));
					// filters.push(new sap.ui.model.Filter("Currency", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Ort01", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Stras", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Land1", sap.ui.model.FilterOperator.Contains, value));
				}else{
					filters.push(new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg")));
				}
				oFilters = new sap.ui.model.Filter(filters, true);
				// binding.filter(filters,false);
				binding.filter(oFilters, sap.ui.model.FilterType.Application);
                     }) ;*/

			/*selectDialog.bindAggregation("items",{
						            path:"/ZtgetvendorSet",
						            filters : [new sap.ui.model.Filter("PurchOrg", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty("/PurchOrg"))],
						            template: new sap.m.StandardListItem({
						              	title: "{Vendor}, {Vendorname}, {Name2}, {Sortl}, {Ort01}, {Stras},{Land1}",
										// title: "{Vendor} {Vendorname} {Name2} {Sortl} {Currency} {Ort01} {Stras} {Land1}",
						              	key : "{Vendor}"
						            })
						          });
		        			
		        			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
							selectDialog.open();*/
		},

		// HEADER Helper Function - Purchasing Group
		fn_val_hlp_req__PurchasingGroup: function(oEvent) {
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Purchasing Group",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PurGroup", oSelectedObject.PurGroup);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PurGrouptxt", oSelectedObject.Eknam);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Eknam", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("PurGroup", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetpurgroupSet",
				filters: [],
				template: new sap.m.StandardListItem({
					title: "{PurGroup} {Eknam}",
					key: "{PurGroup}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// HEADER Helper Function - Payment Terms
		fn_val_hlp_req__PaymentTerms: function(oEvent) {
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Payment Terms",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrms", oSelectedObject.Pmnttrms);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Pmnttrmstxt", oSelectedObject.Pmnttrmsname);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Pmnttrmsname", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetpaymentSet",
				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")],
				template: new sap.m.StandardListItem({
					title: "{Pmnttrmsname}",
					key: "{Pmnttrms}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// HEADER Helper Function - Currency
		fn_val_hlp_req__Currency: function(oEvent) {
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Currency",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/Currency", oSelectedObject.Currency);

					var itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();

					itemsData.results.forEach(function(element) {
						element.Currency = oSelectedObject.Currency;
					});

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Currencytxt", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Currency", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetcurrencySet",
				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")],
				template: new sap.m.StandardListItem({
					title: "{Currency} {Currencytxt}",
					key: "{Currency}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// HEADER Helper Function - Requisitioner
		fn_val_hlp_req__Requisitioner: function(oEvent) {
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Requisitioner",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PreqName", oSelectedObject.PreqName);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.setProperty("/PreqNametxt", oSelectedObject.NameTextc);

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Header.refresh(true);

					//_this.fn_After_RequisitionerSelected(oSelectedObject.PreqName);

					var itemsData = _this.getOwnerComponent().AppInstance.CurrentMODEL_Items.getData();
					itemsData.results.forEach(function(element) {
						element.PreqName = oSelectedObject.PreqName;
					});

					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.setData(itemsData);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_Items.refresh(true);

				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("NameTextc", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("PreqName", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetpreqnameSet",
				filters: [],
				template: new sap.m.StandardListItem({
					title: "{PreqName} {NameTextc}",
					key: "{PreqName}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// HEADER Helper Function - EMail
		fn_val_hlp_req__EMail: function(oEvent) {
			var AppInstance = this.getOwnerComponent().AppInstance;
			AppInstance.CurrentMODEL_Header.setProperty("/EMail", oEvent.getParameters().newValue);
			AppInstance.CurrentMODEL_Header.refresh(true);
		},

		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// HELPERS FOR TABLE SUBITEMS INPUTS
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

		// SubItems Table Helper Function - Order
		fn_val_hlp_req__SubItems_Order: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Order",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/ORDERID", oSelectedObject.Orderid);
					this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/ORDERIDTXT", oSelectedObject.Orderidtxt);
					this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Orderid", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetorderSet",
				filters: [new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header
						.getProperty("/CompCode")),
					new sap.ui.model.Filter("Kokrs", sap.ui.model.FilterOperator.EQ, sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance
						.CurrentMODEL_Header.getProperty("/ContrArea"))
				],
				template: new sap.m.StandardListItem({
					title: "{Orderid} {Orderidtxt}",
					key: "{Orderid}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// SubItems Table Helper Function - Account
		fn_val_hlp_req__SubItems_Account: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Account",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/GL_ACCOUNT", oSelectedObject.GlAccount);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/GL_ACCOUNTTXT", oSelectedObject.GlAccounttxt);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("GlAccount", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("GlAccounttxt", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetglaccountSet",
				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN"),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty(
						"/CompCode"))
				],
				template: new sap.m.StandardListItem({
					title: "{GlAccount} {GlAccounttxt}",
					key: "{GlAccount}"
				})
			});

			selectDialog.setModel(_this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		// SubItems Table Helper Function - Cost Center
		fn_val_hlp_req__SubItems_CostCenter: function(oEvent) {

			var rowIndex = oEvent.getSource().getParent().getIndex();
			var _this = this;
			var selectDialog = new sap.m.SelectDialog({
				title: "Cost Center",
				confirm: function(oevent) {
					var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject();
					_this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/COSTCENTER", oSelectedObject.Costcenter);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/COSTCENTERTXT", oSelectedObject.Costcentertxt);
					_this.getOwnerComponent().AppInstance.CurrentMODEL_SubItems.refresh(true);
				},
				cancel: function(oevent) {}
			});

			selectDialog.attachSearch(function(_oEvent) {
				var binding = _oEvent.getParameter("itemsBinding"),
					value = _oEvent.getParameter("value"),
					filters = [];
				if (value.length) {
					filters.push(new sap.ui.model.Filter("Costcenter", sap.ui.model.FilterOperator.Contains, value));
					filters.push(new sap.ui.model.Filter("Costcentertxt", sap.ui.model.FilterOperator.Contains, value));
				}
				binding.filter(filters);
			});

			selectDialog.bindAggregation("items", {
				path: "/ZtgetcostcenterSet",
				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN"),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, _this.getOwnerComponent().AppInstance.CurrentMODEL_Header.getProperty(
						"/CompCode"))
				],
				template: new sap.m.StandardListItem({
					title: "{Costcenter} {Costcentertxt}",
					key: "{Costcenter}"
				})
			});

			selectDialog.setModel(this.getOwnerComponent().getModel("model__f4_functions"));
			selectDialog.open();
		},

		//
		fn_focusout_Distribution__CostCenter: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();
			var newValue = oEvent.getParameters().newValue;
			var sourceInput = oEvent.getSource();
			var AppInstance = this.getOwnerComponent().AppInstance;

			var oldKey = AppInstance.CurrentMODEL_SubItems.getProperty("/" + rowIndex + "/COSTCENTER");
			var oldValue = AppInstance.CurrentMODEL_SubItems.getProperty("/" + rowIndex + "/COSTCENTERTXT");

			sourceInput.setBusyIndicatorDelay(0);
			sourceInput.setBusy(true);

			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetcostcenterSet", {
				filters: [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN"),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, AppInstance.CurrentMODEL_Header.getProperty("/CompCode")),
					new sap.ui.model.Filter("Costcenter", sap.ui.model.FilterOperator.Contains, newValue),
					new sap.ui.model.Filter("Costcentertxt", sap.ui.model.FilterOperator.Contains, newValue)
				],

				success: function(oData, oResponse) {
					if (oData.results.length > 0) {
						AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/COSTCENTER", oData.results[0].Costcenter);
						AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/COSTCENTERTXT", oData.results[0].Costcentertxt);
						AppInstance.CurrentMODEL_SubItems.refresh(true);
					} else {
						AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/COSTCENTER", "");
						AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/COSTCENTERTXT", "");
						AppInstance.CurrentMODEL_SubItems.refresh(true);
					}
					sourceInput.setBusy(false);
				},
				error: function(error) {}
			});
		},

		fn_focusout_Distribution__Account: function(oEvent) {
			var rowIndex = oEvent.getSource().getParent().getIndex();
			var newValue = oEvent.getParameters().newValue;
			var sourceInput = oEvent.getSource();
			var AppInstance = this.getOwnerComponent().AppInstance;

			var oldKey = AppInstance.CurrentMODEL_SubItems.getProperty("/" + rowIndex + "/GL_ACCOUNT");
			var oldValue = AppInstance.CurrentMODEL_SubItems.getProperty("/" + rowIndex + "/GL_ACCOUNTTXT");

			sourceInput.setBusyIndicatorDelay(0);
			sourceInput.setBusy(true);

			this.getOwnerComponent().getModel("model__f4_functions").read("/ZtgetglaccountSet", {
				filters: [
					new sap.ui.model.Filter("GlAccount", sap.ui.model.FilterOperator.Contains, newValue),
					new sap.ui.model.Filter("GlAccounttxt", sap.ui.model.FilterOperator.Contains, newValue)
				],

				success: function(oData, oResponse) {
					if (oData.results.length > 0) {
						AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/GL_ACCOUNT", oData.results[0].GlAccount);
						AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/GL_ACCOUNTTXT", oData.results[0].GlAccounttxt);
						AppInstance.CurrentMODEL_SubItems.refresh(true);
					} else {
						AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/GL_ACCOUNT", "");
						AppInstance.CurrentMODEL_SubItems.setProperty("/" + rowIndex + "/GL_ACCOUNTTXT", "");
						AppInstance.CurrentMODEL_SubItems.refresh(true);
					}
					sourceInput.setBusy(false);
				},
				error: function(error) {}
			});
		},

		handleUploadPress: function(oEvent) {
			//var oFileUploader = this.byId("fileUploader");
			var oFileUploader = this.getView().byId("toggleItemData_Attachment").getAggregation("content")[0];
			if (!oFileUploader.getValue()) {
				MessageToast.show("Choose a file first");
				return;
			}

			// Start
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();

			//	var csrfToken = this.getView().getModel().oHeaders['x-csrf-token'];
			//	alert(" - csrfToken -  "+csrfToken);
			var that = this;
			var oView = this.getView();
			var oFileUploader = this.getView().byId("toggleItemData_Attachment").getAggregation("content")[0];

			/*aasdasdasd*/
			var token = this.getView().getModel("model__transfer_po").getSecurityToken();

			if (!this.busyInd) {
				this.busyInd = new sap.m.BusyDialog();
			}
			//this.busyInd.open();
			var sPoNumber = this.getView().byId("inputPONumber").getValue();
			var sFileName = oFileUploader.getValue();
			var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
			var BASE64_MARKER = 'data:' + file.type + ';base64,';
			var filename = file.name;
			var fileSize = file.size;
			var fileType = file.type;
			var oSlugData = sPoNumber + "/" + filename;
			var sAttachService = window.location.origin + "/sap/opu/odata/sap/ZODATA_22256_PO_CR_CH_SERVICE_SRV/ZtgetattachmentSet"

		
		//	var datas =oFileUploader.getFocusDomRef().files[0];

		var reader = new FileReader();
	/*	oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({

  name: 'x-csrf-token',

  value: token

  }));

  oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({

  name: 'slug',

  value: oSlugData

  }));

  oFileUploader.setUploadUrl(sAttachService);



  	if (!oFileUploader.getValue()) {
				MessageToast.show("Choose a file first");
  	}
  	else
{
  oFileUploader.upload();

  }*/
  
  

			// On load set file contents to text view
			reader.onload = (function(theFile) {
				return function(evt) {
					//var sObjService = window.location.origin + "/sap/opu/odata/sap/ZODATA_22256_PO_CR_CH_SERVICE_SRV/ZtgetattachmentSet";
					var sAttachService = window.location.origin + "/sap/opu/odata/sap/ZODATA_22256_PO_CR_CH_SERVICE_SRV/ZtgetattachmentSet"
					var base64Index = evt.target.result.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
					var base64 = evt.target.result.substring(base64Index);
	
					$.ajaxSetup({
						cache: false
					});

					jQuery.ajax({
						url: sAttachService,
						type: "POST",
						async: true,
						dataType: 'json',
						data: base64,
						cache: false,
						beforeSend: function(xhr) {
							xhr.setRequestHeader("X-CSRF-Token", token);
							xhr.setRequestHeader("Content-Type", "application/json");
							xhr.setRequestHeader("slug", oSlugData);
							//xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

						},
						success: function(odata, textStatus, XMLHttpRequest) {

							oBusyDialog.close();

							sap.m.MessageToast.show("File Uploded Successfully.", {
								autoClose: true

							});
							oFileUploader.setValue("");
							that.readAttachment();
						}.bind(this),
						error: function(odata) {
							oBusyDialog.close();
							if (odata.responseJSON && odata.responseJSON.error && odata.responseJSON.error.message && odata.responseJSON.error.message
								.value) {
								if (odata.responseJSON.error.message.value == "Service provider did not return any business data.") {
									sap.m.MessageToast.show("File uploaded Successfully.", {
										autoClose: true
									});
									oFileUploader.setValue("");
									
								} else {
									
									var msg = "";
									var errArr = odata.responseJSON.error.innererror.errordetails;
									for (var i = 0; i < errArr.length; i++) {

										if (errArr[i].code != "/IWBEP/CX_MGW_TECH_EXCEPTION") {
											msg = msg + errArr[i].message + "\n";
										} else {
											msg = odata.responseJSON.error.message.value;
										}
									}
									sap.m.MessageBox.show(
										msg, {
											icon: sap.m.MessageBox.Icon.ERROR,
											title: "Error",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function(oAction) {}
										}
									);
								}
							} else {
								oBusyDialog.close();
								sap.m.MessageToast.show("File upload failed");
								console.log(odata);
							}

						}

					});
				};
			})(file);
			reader.readAsDataURL(file);

			// End

		},
	/*handleUploadComplete: function(oEvent) {
			var oBusyDialog = new sap.m.BusyDialog();
			var sResponse = oEvent.getParameter('response');
			var oFileUploader = this.getView().byId("toggleItemData_Attachment").getAggregation("content")[0];
			if (sResponse) {
			
                   
                    	oBusyDialog.close();

							sap.m.MessageToast.show("File Uploded Successfully.", {
								autoClose: true
							});
								oFileUploader.setValue("");
			}
		},
		*/

		handleDelete: function(oEvent) {

			var ObjectId = this.getView().byId("inputPONumber").getValue();
			var ObjectType = "BUS2012";
			var ObjectCat = "BO";
			var oItem = oEvent.getParameter("listItem");
			var oModel = this.getView().getModel("model__transfer_po");

			var DocumentId = oItem.getBindingContext().getProperty().DocumentId;
			var Surl = "/ZtgetattachmentSet(ObjectId='" + ObjectId + "',ObjectType='" + ObjectType + "',ObjectCat='" + ObjectCat +
				"',DocumentId='" + DocumentId + "')/$value";
			//alert(" Surl - "+Surl);
			//sconsole.log(Surl);

			oModel.remove(Surl, {
				success: function(oData, oResponse) {
					// Success 
					this.readAttachment();
				}.bind(this),
				error: function(oError) {
					// Error 
					console.log(" Delete failed");
					alert(" Delete Failed");
				}
			});

		},
		onListItemPress: function(oEvent) {
			//debugger;
			//this.odataModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZODATA_22256_PO_CR_CH_SERVICE_SRV");
			// insert url parameters    
			var ObjectId = this.getView().byId("inputPONumber").getValue();
			var ObjectType = "BUS2012";
			var ObjectCat = "BO";
			var DocumentId = oEvent.getSource().getBindingContext().getObject().DocumentId;

			var Surl = window.location.origin + "/sap/opu/odata/sap/ZODATA_22256_PO_CR_CH_SERVICE_SRV/" +
				"ZtgetattachmentSet(ObjectId='" + ObjectId + "',ObjectType='" + ObjectType + "',ObjectCat='" + ObjectCat + "',DocumentId='" +
				DocumentId + "')/$value";
		/*var context = oEvent.getSource().getBindingContext();
		var saveData = (function(){
			var a = document.createElement('a');
			document.body.appendChild(a);
			return function(data, filename)
			{
				var blob= new Blob([data], {
					type:filetype
				}),
				url = window.URL.createObjectURL(blob);
				a.href= url;
				a.download = filename;
				a.click();
				window.URL.revokeObjectURL(url);
				a.remove();
				
			};
		}());
		var oModel = this.getView().getModel("model__transfer_po");
		var DocumentId = oEvent.getSource().getBindingContext().getProperty().DocumentId;
		var filename= oEvent.getSource().getBindingContext().getProperty().FileName;
		var filetype = oEvent.getSource().getBindingContext().getProperty().MimeType;
	    var Surl = window.location.origin +"/sap/opu/odata/sap/ZODATA_22256_PO_CR_CH_SERVICE_SRV/" +
				"ZtgetattachmentSet(ObjectId='" + ObjectId + "',ObjectType='" + ObjectType + "',ObjectCat='" + ObjectCat + "',DocumentId='" +
				DocumentId + "')/$value";
				var data = jQuery.ajax({
						url: Surl,
						type: "GET",
						async: false,
					    ContentType: "image/jpg; Charset=UTF-8",
						cache: false,
						success: function(odata){
							sap.m.MessageToast.show("Success");
						}
				});
				filetype =filetype+";charset=UTF-8";
				saveData(data.responseText, filename, filetype);*/
	
			       	
			    
			window.open(Surl, '_blank');
			// }});
			/*	// CAll oData start                                   
			this.odataModel.read("/ZtgetattachmentSet(ObjectId='" + ObjectId + "',ObjectType='" + ObjectType +"',ObjectCat='" +ObjectCat + "',DocumentId='" + DocumentId + "')/$value",                                                
		null,                                                
       null,                                               
		false,                                               
			function(oData, oResponse) {                                                          
				alert("File fetched successfully");                                                         
				var response = oResponse.requestUri;                                                            
				sap.m.URLHelper.redirect(response, true);               
				}                                   
				);*/
			//alert("hi");  
		}

	});
});