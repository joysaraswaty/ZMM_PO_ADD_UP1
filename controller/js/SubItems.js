sap.ui.getCore().AppContext.dialogSubItemsTriggered = function ( poNumber , poItem , idDistribution , quantity) {

			var __poNumber = poNumber ;
			var __poItem = poItem ;
			var __idDistribution = idDistribution ;
			var __quantity = quantity ;
			
			var columnQuantityEnabled = undefined ;
			var columnPercentageEnabled = undefined ;
			

			switch(__idDistribution) {
			    case "":
			        //code block
			        break;
			    case "1":
			        columnQuantityEnabled = true ;
			        columnPercentageEnabled = false ;
			        break;
			    case "2":
			        columnQuantityEnabled = false ;
			        columnPercentageEnabled = true ;
			    	break;
			    default:
			        break;
			}
			

			// FOARTE IMPORTANT : Conditie de no action daca idDistribution == 0 - !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			//  - !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			//  - !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			
			
			sap.ui.getCore().AppContext.tableSubItems = new sap.ui.table.Table({
						selectionMode : sap.ui.table.SelectionMode.None }
					);
					
			sap.ui.getCore().AppContext.tableSubItems.addColumn(new sap.ui.table.Column({
					    label: '',
					    width: '10%',
					    template: new  sap.ui.commons.layout.HorizontalLayout({
					      content: [
					        new sap.ui.commons.Button({
					          style: sap.ui.commons.ButtonStyle.Reject,
					          icon: 'sap-icon://delete',
					          
					          press : function (oEvent) {
					    	
					    	 			// var mData = sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.getData();
					    	 			// mData.results.splice(oEvent.getSource().getParent().getIndex(),1) ;
					    	 			// sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.setData(mData);
					    	 			// sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.getData().refresh();
										// sap.ui.getCore().AppContext.tablePOItems.setVisibleRowCount(sap.ui.getCore().AppContext.tablePOItems.getVisibleRowCount()-1);
									
									
					    			}
					          
					        })
					      ]
					    })
					  }));
								  
			sap.ui.getCore().AppContext.tableSubItems.addColumn(new sap.ui.table.Column({
			                     label : new sap.ui.commons.Label({ text : "Quantity" , tooltip : "Quantity" }),
			                     template : new sap.m.Input({ value : "{Quantity}" , enabled : columnQuantityEnabled }),
			                     width : "18%"
			              }));
			              
			sap.ui.getCore().AppContext.tableSubItems.addColumn(new sap.ui.table.Column({
			                     label : new sap.ui.commons.Label({ text : "Percentage" , tooltip : "Percentage" }),
			                     template : new sap.m.Input({ value : "{DistrPerc}" , enabled : columnPercentageEnabled}),
			                     width : "18%"
			              }));          
			         
			sap.ui.getCore().AppContext.tableSubItems.addColumn(new sap.ui.table.Column({
			                     label : new sap.ui.commons.Label({ text : "G/L Account" , tooltip : "G/L Account" }),
			                     template : new sap.m.Input({ value : "{GlAccount}"}),
			                     width : "18%"
			              }));
	
	
			sap.ui.getCore().AppContext.tableSubItems.addColumn(new sap.ui.table.Column({
			                     label : new sap.ui.commons.Label({ text : "Cost Center" , tooltip : "Cost Center" }),
			                     template : new sap.m.Input({ value : "{Costcenter}"}),
			                     width : "18%"
			              }));  
			              
			              
			sap.ui.getCore().AppContext.tableSubItems.addColumn(new sap.ui.table.Column({
			                     label : new sap.ui.commons.Label({ text : "Order" , tooltip : "Order" }),
			                     template : new sap.m.Input({ value : "{Orderid}"}),
			                     width : "18%"
			              }));                


			
			sap.ui.getCore().AppContext.modelPOItemsDetails.read("/ZtgetpoaccountSet",
			{
				filters : [ new sap.ui.model.Filter("PoNumber", sap.ui.model.FilterOperator.EQ, __poNumber),
							new sap.ui.model.Filter("PoItem", sap.ui.model.FilterOperator.EQ, __poItem)] ,
				
			 	success : function(oData, oResponse) {
					
// TRE SA FACI CEVA CU UN JSON LOCAL AICI !!!
					
					
					sap.ui.getCore().AppContext.jsonPOSubItems_JSONContent = oData ;
					
			 		sap.ui.getCore().AppContext.jsonPOSubItems_Model = new sap.ui.model.json.JSONModel();
	        		sap.ui.getCore().AppContext.jsonPOSubItems_Model.setData(oData);

					sap.ui.getCore().AppContext.tableSubItems.setModel(sap.ui.getCore().AppContext.jsonPOSubItems_Model);

					sap.ui.getCore().AppContext.tableSubItems.bindRows({ path : "/results" });
					sap.ui.getCore().AppContext.tableSubItems.setVisibleRowCount(sap.ui.getCore().AppContext.tableSubItems.getBinding().getLength()) ;
					
					
								  
				if (!sap.ui.getCore().AppContext.dialogSubItems) {
					 sap.ui.getCore().AppContext.dialogSubItems = new sap.m.Dialog({
						title: 'Available SubItems',
						
						content: [sap.ui.getCore().AppContext.tableSubItems,
						
						new sap.m.Button({
							icon : "sap-icon://sys-add",
							text: '',
							press: function () {
									// Execute Add New Subitem
									var aData = sap.ui.getCore().AppContext.jsonPOSubItems_Model.getProperty("/results");
									var newRow = {};
									aData.push(newRow);
									sap.ui.getCore().AppContext.jsonPOSubItems_Model.setProperty("/results", aData);
					 				sap.ui.getCore().AppContext.tableSubItems.bindRows({path: "/results"} );
					 				sap.ui.getCore().AppContext.tableSubItems.setVisibleRowCount(sap.ui.getCore().AppContext.tableSubItems.getVisibleRowCount()+1);
					 				
					 				
							}
						})],
						
						beginButton: new sap.m.Button({
							text: 'Save Changes',
							press: function () {
								sap.ui.getCore().AppContext.dialogSubItems.close();
							}
						})
					});
	 
					sap.ui.getCore().AppContext.handle_to_HandlePOView.addDependent(sap.ui.getCore().AppContext.dialogSubItems);
				}
	 
				sap.ui.getCore().AppContext.dialogSubItems.open();
		  
								  
				 },
				 	error : function(error) {
		       		alert(error.message);
				 	}
				 });
				
		 sap.ui.getCore().AppContext.handle_to_HandlePOView.dialogSubItemsTriggered = this ;	
					
} ;