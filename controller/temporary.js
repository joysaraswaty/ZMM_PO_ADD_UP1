//			sap.ui.getCore().AppContext = new Object();

		//	sap.ui.getCore().AppContext.MaxModelEntities = 150 ;

			

		//	sap.ui.getCore().AppContext.serviceGetPOsURL = "https://sgate.kaokonnections.com/sap/opu/odata/SAP/zodata_22256_get_po_list_srv"
		//	sap.ui.getCore().AppContext.modelGetPOs = new sap.ui.model.odata.v2.ODataModel(sap.ui.getCore().AppContext.serviceGetPOsURL);
		//	sap.ui.getCore().AppContext.modelGetPOs_Content = undefined ;
			
		//	sap.ui.getCore().AppContext.serviceTransferURL = "https://sgate.kaokonnections.com/sap/opu/odata/sap/ZODATA_22256_PO_F4_FUNCTIONS_SRV" ;
		//	sap.ui.getCore().AppContext.modelTransfer = new sap.ui.model.odata.v2.ODataModel(sap.ui.getCore().AppContext.serviceTransferURL,{
		//		sizeLimit : 65536,
		//		useBatch : false
		//	}); 
			
		//	sap.ui.getCore().AppContext.servicePOItemsDetailsURL = "https://sgate.kaokonnections.com/sap/opu/odata/sap/ZODATA_22256_PO_CR_CH_SERVICE_SRV" ;
		//	sap.ui.getCore().AppContext.modelPOItemsDetails = new sap.ui.model.odata.v2.ODataModel(sap.ui.getCore().AppContext.servicePOItemsDetailsURL);
			

		//	sap.ui.getCore().AppContext.servicePOPOST = "https://sgate.kaokonnections.com/sap/opu/odata/SAP/ZODATA_22256_PO_POSTING_SRV"
		//	sap.ui.getCore().AppContext.modelPOPOST = new sap.ui.model.odata.v2.ODataModel(sap.ui.getCore().AppContext.servicePOPOST,{
		//		useBatch : false,
		//		json : true
		//	});
			

				//sap.ui.getCore().AppContext.CurrentMODEL_Header = undefined ;
				//sap.ui.getCore().AppContext.CurrentMODEL_Items = undefined ;
				
		//		sap.ui.getCore().AppContext.CurrentMODEL_SubItems = undefined ;
		//			sap.ui.getCore().AppContext.CurrentMODEL_SubItems_Entries_ALL = undefined ;
		//			sap.ui.getCore().AppContext.CurrentMODEL_SubItems_Entries_InsideDistribution = undefined ;
		//			sap.ui.getCore().AppContext.CurrentMODEL_SubItems_Entries_OutsideDistribution = undefined ;
					
			//		sap.ui.getCore().AppContext.CurrentMODEL_SubItems_Entries_OutsideDistribution = undefined ;
					
				//	sap.ui.getCore().AppContext.CurrentMODEL_SubItems_MaxDistrib_Quantity = undefined ;
			//		sap.ui.getCore().AppContext.CurrentMODEL_SubItems_MaxDistrib_Percentage = 100 ;
				
		//		sap.ui.getCore().AppContext.CurrentMODEL_Address = undefined ;
				
			
		//	sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___HEADER = undefined ;
			

			// sap.ui.getCore().AppContext.jsonPOSubItems_JSONContent = undefined ;
		// sap.ui.getCore().AppContext.jsonPOSubItems_Model = undefined ;
			
		//	sap.ui.getCore().AppContext.jsonPOAddress_JSONContent = undefined ;
		//	sap.ui.getCore().AppContext.jsonPOAddress_Model = undefined ;
			
				// sap.ui.getCore().AppContext.tablePOs = undefined ;
			
				//sap.ui.getCore().AppContext.tablePOItems = undefined ;
				//sap.ui.getCore().AppContext.tablePOAdress = undefined ;
				//sap.ui.getCore().AppContext.tablePOSubItems = undefined ;
				
				//	sap.ui.getCore().AppContext.dialogSubItems = undefined ;
				
				//sap.ui.getCore().AppContext.selectedDistributionIsQuantity = false ;
				//sap.ui.getCore().AppContext.selectedDistributionIsPercentage = false ;
				
				//sap.ui.getCore().AppContext.lastSelected_PONumber = "" ;
				//sap.ui.getCore().AppContext.lastSelected_POItem = "" ;
				//sap.ui.getCore().AppContext.lastSelected_ItemRowIndex = "" ;
				//sap.ui.getCore().AppContext.lastSelected_POAction = undefined ; // "PO_ACTION__NEW" , "PO_ACTION__COPY" , "PO_ACTION_EDIT"
				
				
				//sap.ui.getCore().AppContext.defaultPlantAddres_Name = undefined ;
				//sap.ui.getCore().AppContext.defaultPlantAddres_Street = undefined ;
				//sap.ui.getCore().AppContext.defaultPlantAddres_StreetNo = undefined ;
				//sap.ui.getCore().AppContext.defaultPlantAddres_PostlCod1 = undefined ;
				//sap.ui.getCore().AppContext.defaultPlantAddres_City = undefined ;
				//sap.ui.getCore().AppContext.defaultPlantAddres_Region = undefined ;
				//sap.ui.getCore().AppContext.defaultPlantAddres_Country = undefined ;
				
				
				
				
		<script type="text/javascript" src="controller/js/JSON_Objects.js"></script>
		
		<script type="text/javascript" src="controller/js/ShowMessage.js"></script>
		<script type="text/javascript" src="controller/js/ShowToast.js"></script>
		<script type="text/javascript" src="controller/js/SubItems.js"></script>
		<script type="text/javascript" src="controller/js/GetItemsTableElementByIndex.js"></script>
		
		<script type="text/javascript" src="controller/js/FETCH_PoHeader.js"></script>
		<script type="text/javascript" src="controller/js/FETCH_PoItems.js"></script>
		<script type="text/javascript" src="controller/js/FETCH_PoAddress.js"></script>
		
		<script type="text/javascript" src="controller/js/SumUPTotalPOValue.js"></script>
		<script type="text/javascript" src="controller/js/customControls/customTableActionButton.js"></script>
		<script type="text/javascript" src="controller/js/customControls/calculableInput.js"></script>

		<script type="text/javascript" src="controller/js/customControls/customAssistedInput.js"></script>
		<script type="text/javascript" src="controller/js/customControls/customAssistedInputsbyField/assistedInput_AccountAssignment.js"></script>
		<script type="text/javascript" src="controller/js/customControls/customAssistedInputsbyField/assistedInput_ItemCategory.js"></script>	
		<script type="text/javascript" src="controller/js/customControls/customAssistedInputsbyField/assistedInput_MaterialGroup.js"></script>
		<script type="text/javascript" src="controller/js/customControls/customAssistedInputsbyField/assistedInput_Plant.js"></script>
		<script type="text/javascript" src="controller/js/customControls/customAssistedInputsbyField/assistedInput_UnitOfMeasure.js"></script>
		<script type="text/javascript" src="controller/js/customControls/customAssistedInputsbyField/assistedInput_Order.js"></script>
		<script type="text/javascript" src="controller/js/customControls/customAssistedInputsbyField/assistedInput_Account.js"></script>
		<script type="text/javascript" src="controller/js/customControls/customAssistedInputsbyField/assistedInput_CostCenter.js"></script>
		<script type="text/javascript" src="controller/js/customControls/customAssistedInputsbyField/assistedInput_MultipleAccounts.js"></script>