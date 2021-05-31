sap.ui.getCore().AppContext.FETCH_PoItems = function () {


// 				if ( sap.ui.getCore().AppContext.lastSelected_POAction === "PO_ACTION__NEW" ) {
// 					sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS.setData( { results : [] } );
// 					sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS.updateBindings();
// 					SetUpModel();
// 					SetUpFields();
// 				}
				
// 				else {
						
// 						// If thre's no new PO creation ... fetching data for existing PO and populating fields
// 						sap.ui.getCore().AppContext.modelPOItemsDetails.read("/ZtgetpoitemSet",
// 											{
// 												filters : [ new sap.ui.model.Filter("PoNumber", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().AppContext.lastSelected_PONumber) ],
												
// 												success : function(oData, oResponse) {
// 														sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS = oData;
// 														SetUpModel();
// 														SetUpFields();
// 												},
// 												error : function(error) {
// 									        		sap.ui.getCore().AppContext.ShowMessage(error);
// 												}
// 											});
				
// 				}
		
		
		
// function SetUpModel() {
// 		sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL = new sap.ui.model.json.JSONModel();
// 		sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.setData(sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS);             
// 		sap.ui.getCore().AppContext.tablePOItems.setModel(sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL);
// } ;

function SetUpFields() {

sap.ui.getCore().AppContext.tablePOItems.unbindRows();
sap.ui.getCore().AppContext.tablePOItems.setModel();


			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({ width: '6%',
					    template: new sap.m.Button({ style: sap.m.ButtonType.Default, icon: 'sap-icon://sys-cancel-2', press : function (oEvent) {
					    	
					    	//  			var mData = sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.getData();
					    	//  			mData.results.splice(oEvent.getSource().getParent().getIndex(),1) ;
					    	//  			sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.setData(mData);
					    	//  			sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.getData().refresh();
					    	 			
					    	//  			var numrows = sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.length ;
					    	 			
										// sap.ui.getCore().AppContext.tablePOItems.setVisibleRowCount(numrows);
									
					    } }) }));
					    	

					  


// ------------------------------ Account Assignment ------------------------------

			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Account Assignment" , tooltip : "Account Assignment" }),
		                     template :  new sap.m.Input({
					                      type: sap.m.InputType.Text,
					                      showSuggestion: true,
		                     			  value : "{Acctasscat}" ,
		                     			  showValueHelp: true,
		                     			  valueHelpRequest: function (oEvent) {
		                     			  	
							                      			var __parentRowIndex = oEvent.getSource().getParent().getIndex() ;
							                      			
							                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetacctassSet",
																{
																	filters : [new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, "NB")],
																	
																	success : function(oData, oResponse) {
																		var helperModel =  new sap.ui.model.json.JSONModel();
													        			helperModel.setData(oData);
							
													        			var selectDialog = new sap.m.SelectDialog({
													        					title: "Select Account Assignment",
													                            confirm: function(oevent){
													                            	var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject() ;
													                            	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(__parentRowIndex,1).setValue(oSelectedObject.Acctasscat);
													                            },
													                            cancel: function(oevent){}
												                          });
												                          
												                          selectDialog.bindAggregation("items",{
																		            path:"/results",
																		            template: new sap.m.StandardListItem({
																		              	title: "{Acctasscat}"
																		            })
																		          });
													        			
													        			selectDialog.setModel(helperModel);
																		selectDialog.open();

																	},
																	error : function(error) {
														        		sap.ui.getCore().AppContext.ShowMessage(error);
																	}
																});
                    					}
		                     }),
		                     
		                     width : "10%"
		              })) ;		              
		              
					  

// ------------------------------ Item Category ------------------------------

			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Item Category" , tooltip : "Item Category" }),
		                     template :  new sap.m.Input({
					                      type: sap.m.InputType.Text,
					                      showSuggestion: true,
		                     			  value : "{ItemCat}" ,
		                     			  showValueHelp: true,
		                     			  valueHelpRequest: function (oEvent) {
		                     			  	
							                      			var __parentRowIndex = oEvent.getSource().getParent().getIndex() ;
							                      			
							                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetitemcatSet",
																{
																	filters : [ new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, "NB"),
																				new sap.ui.model.Filter("Acctasscat", sap.ui.model.FilterOperator.EQ, sap.ui.getCore().AppContext.GetItemsTableElementByIndex(__parentRowIndex,1).getValue()),
																				new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")],
																					
																	success : function(oData, oResponse) {
																		var helperModel =  new sap.ui.model.json.JSONModel();
													        			helperModel.setData(oData);
							
													        			var selectDialog = new sap.m.SelectDialog({
													        					title: "Select Item Category",
													                            confirm: function(oevent){
													                            	var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject() ;
													                            	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(__parentRowIndex,2).setValue(oSelectedObject.ItemCat);
													                            },
													                            cancel: function(oevent){}
												                          });
												                          
												                          selectDialog.bindAggregation("items",{
																		            path:"/results",
																		            template: new sap.m.StandardListItem({
																		              	title: "{ItemCat}"
																		            })
																		          });
													        			
													        			selectDialog.setModel(helperModel);
																		selectDialog.open();

																	},
																	error : function(error) {
														        		sap.ui.getCore().AppContext.ShowMessage(error);
																	}
																});
                    					}
		                     }),
		                     
		                     width : "10%"
		              })) ;		
   
// ------------------------------ Short Text ------------------------------          
		              
		    sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Short Text" , tooltip : "Short Text" }),
		                     template : new sap.m.Input({ value : "{ShortText}"}),
		                     width : "10%"
		              }));
		              
// ------------------------------ Material Group ------------------------------

			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Material Group" , tooltip : "Material Group" }),
		                     template :  new sap.m.Input({
					                      type: sap.m.InputType.Text,
					                      showSuggestion: true,
		                     			  value : "{MatlGroup}" ,
		                     			  showValueHelp: true,
		                     			  valueHelpRequest: function (oEvent) {
		                     			  	
							                      			var __parentRowIndex = oEvent.getSource().getParent().getIndex() ;
							                      			
							                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetmatlgroupSet",
																{
																	filters : [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")],
																	
																	success : function(oData, oResponse) {
																		var helperModel =  new sap.ui.model.json.JSONModel();
													        			helperModel.setData(oData);
							
													        			var selectDialog = new sap.m.SelectDialog({
													        					title: "Select Account Assignment",
													                            confirm: function(oevent){
													                            	var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject() ;
													                            	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(__parentRowIndex,4).setValue(oSelectedObject.MatlGroup);
													                            },
													                            cancel: function(oevent){}
												                          });
												                          
												                          selectDialog.bindAggregation("items",{
																		            path:"/results",
																		            template: new sap.m.StandardListItem({
																		              	title: "{MatlGroup}"
																		            })
																		          });
													        			
													        			selectDialog.setModel(helperModel);
																		selectDialog.open();

																	},
																	error : function(error) {
														        		sap.ui.getCore().AppContext.ShowMessage(error);
																	}
																});
                    					}
		                     }),
		                     
		                     width : "10%"
		              })) ;		              
		              		              
		          
// ------------------------------ Plant ------------------------------

			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Plant" , tooltip : "Plant" }),
		                     template :  new sap.m.Input({
					                      type: sap.m.InputType.Text,
					                      showSuggestion: true,
		                     			  value : "{Plant}" ,
		                     			  showValueHelp: true,
		                     			  valueHelpRequest: function (oEvent) {
		                     			  	
							                      			var __parentRowIndex = oEvent.getSource().getParent().getIndex() ;
							                      			
							                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetplantSet",
																{
																	filters : [new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, "1000")],
																	
																	success : function(oData, oResponse) {
																		var helperModel =  new sap.ui.model.json.JSONModel();
													        			helperModel.setData(oData);
							
													        			var selectDialog = new sap.m.SelectDialog({
													        					title: "Select Plant",
													                            confirm: function(oevent){
													                            	var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject() ;
													                            	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(__parentRowIndex,5).setValue(oSelectedObject.Plant);
													                            },
													                            cancel: function(oevent){}
												                          });
												                          
												                          selectDialog.bindAggregation("items",{
																		            path:"/results",
																		            template: new sap.m.StandardListItem({
																		              	title: "{Plant}"
																		            })
																		          });
													        			
													        			selectDialog.setModel(helperModel);
																		selectDialog.open();

																	},
																	error : function(error) {
														        		sap.ui.getCore().AppContext.ShowMessage(error);
																	}
																});
                    					}
		                     }),
		                     
		                     width : "10%"
		              })) ;		              
		              
					  		              
// ------------------------------ Delivery Date ------------------------------		              

		    sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Delivery Date" , tooltip : "Delivery Date" }),
		                     template : new sap.m.Input({ value : "{DeliveryDate}" , pattern : "MM/dd/yy"}),
		                     width : "11%"
		              })); 
		              
		              
// ------------------------------ Quantity ------------------------------			              
		              
		    sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Quantity" , tooltip : "Quantity"}),
		                     
		                     template : sap.ui.getCore().AppContext.calculableInput("{Quantity}", function(rowIndex,selectedValue){
		                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,13).setValue(
		                     		sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,7).getValue()*sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,9).getValue()/sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,11).getValue()
		                     		);
	sap.ui.getCore().AppContext.SumUPTotalPOValue();
		                     }),
		                     
		                     width : "10%"
		              }));
		              
		              
// ------------------------------ Unit of Measure ------------------------------

			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Unit of Measure" , tooltip : "Unit of Measure" }),
		                     template :  new sap.m.Input({
					                      type: sap.m.InputType.Text,
					                      showSuggestion: true,
		                     			  value : "{PoUnit}" ,
		                     			  showValueHelp: true,
		                     			  valueHelpRequest: function (oEvent) {
		                     			  	
							                      			var __parentRowIndex = oEvent.getSource().getParent().getIndex() ;
							                      			
							                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetpounitSet",
																{
																	filters : [new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")],
																	
																	success : function(oData, oResponse) {
																		var helperModel =  new sap.ui.model.json.JSONModel();
													        			helperModel.setData(oData);
							
													        			var selectDialog = new sap.m.SelectDialog({
													        					title: "Select Unit of Measure",
													                            confirm: function(oevent){
													                            	var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject() ;
													                            	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(__parentRowIndex,8).setValue(oSelectedObject.PoUnit);
													                            },
													                            cancel: function(oevent){}
												                          });
												                          
												                          selectDialog.bindAggregation("items",{
																		            path:"/results",
																		            template: new sap.m.StandardListItem({
																		              	title: "{PoUnit}"
																		            })
																		          });
													        			
													        			selectDialog.setModel(helperModel);
																		selectDialog.open();

																	},
																	error : function(error) {
														        		sap.ui.getCore().AppContext.ShowMessage(error);
																	}
																});
                    					}
		                     }),
		                     
		                     width : "10%"
		              })) ;		              		          
		              

// ------------------------------ Net Price ------------------------------

		              
		    sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Net Price" , tooltip : "Net Price" }),
		                     template : sap.ui.getCore().AppContext.calculableInput("{NetPrice}", function(rowIndex,selectedValue){
		                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,13).setValue(
		                     		sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,7).getValue()*sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,9).getValue()/sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,11).getValue()
		                     		);
	sap.ui.getCore().AppContext.SumUPTotalPOValue();					                     		
		                     }),
		                     width : "10%"
		              }));
		              
// ------------------------------ Currency ------------------------------		              
		              
		    sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Currency" , tooltip : "Currency" }),
		                     template : new sap.ui.commons.Label({ text : "{Currency}"}),
		                     width : "8%"
		              }));
			
// ------------------------------ Per ------------------------------			
			
			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Per" , tooltip : "Per"}),
		                     template : sap.ui.getCore().AppContext.calculableInput("{PriceUnit}", function(rowIndex,selectedValue){
		                     	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,13).setValue(
		                     		sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,7).getValue()*sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,9).getValue()/sap.ui.getCore().AppContext.GetItemsTableElementByIndex(rowIndex,11).getValue()
		                     		);
	sap.ui.getCore().AppContext.SumUPTotalPOValue();
		                     }),
		                     width : "4%"
		              }));
		              
		              
// ------------------------------ Order ------------------------------

			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Order" , tooltip : "Order" }),
		                     template :  new sap.m.Input({
					                      type: sap.m.InputType.Text,
					                      showSuggestion: true,
		                     			  value : "{Orderid}" ,
		                     			  showValueHelp: true,
		                     			  valueHelpRequest: function (oEvent) {
		                     			  	
							                      			var __parentRowIndex = oEvent.getSource().getParent().getIndex() ;
							                      			
							                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetorderSet",
																{
																	filters : [new sap.ui.model.Filter("CompCode", sap.ui.model.FilterOperator.EQ, "1000"),
																			   new sap.ui.model.Filter("Kokrs", sap.ui.model.FilterOperator.EQ, "1000")],
																	
																	success : function(oData, oResponse) {
																		var helperModel =  new sap.ui.model.json.JSONModel();
													        			helperModel.setData(oData);
							
													        			var selectDialog = new sap.m.SelectDialog({
													        					title: "Select Order",
													                            confirm: function(oevent){
													                            	var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject() ;
													                            	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(__parentRowIndex,12).setValue(oSelectedObject.Orderid);
													                            },
													                            cancel: function(oevent){}
												                          });
												                          
												                          selectDialog.bindAggregation("items",{
																		            path:"/results",
																		            template: new sap.m.StandardListItem({
																		              	title: "{Orderid}"
																		            })
																		          });
													        			
													        			selectDialog.setModel(helperModel);
																		selectDialog.open();

																	},
																	error : function(error) {
														        		sap.ui.getCore().AppContext.ShowMessage(error);
																	}
																});
                    					}
		                     }),
		                     
		                     width : "10%"
		              })) ;		              		          
		              
		              		              
// ------------------------------ Item Value ------------------------------		  


		   sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Item Value" , tooltip : "Item Value" }),
		                     template :  new sap.m.Input({ value : "{Limit}"}),
		                     width : "10%"
		              }));
		              
		              
// ------------------------------ Account ------------------------------

			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Account" , tooltip : "Account" }),
		                     template :  new sap.m.Input({
					                      type: sap.m.InputType.Text,
					                      showSuggestion: true,
		                     			  value : "{GlAccount}" ,
		                     			  showValueHelp: true,
		                     			  valueHelpRequest: function (oEvent) {
		                     			  	
							                      			var __parentRowIndex = oEvent.getSource().getParent().getIndex() ;
							                      			
							                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetglaccountSet",
																{
																	filters : [new sap.ui.model.Filter("Ktopl", sap.ui.model.FilterOperator.EQ, "0010"),
																				new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")],
																	
																	success : function(oData, oResponse) {
																		var helperModel =  new sap.ui.model.json.JSONModel();
													        			helperModel.setData(oData);
							
													        			var selectDialog = new sap.m.SelectDialog({
													        					title: "Select Account",
													                            confirm: function(oevent){
													                            	var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject() ;
													                            	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(__parentRowIndex,14).setValue(oSelectedObject.GlAccount);
													                            },
													                            cancel: function(oevent){}
												                          });
												                          
												                          selectDialog.bindAggregation("items",{
																		            path:"/results",
																		            template: new sap.m.StandardListItem({
																		              	title: "{GlAccount}"
																		            })
																		          });
													        			
													        			selectDialog.setModel(helperModel);
																		selectDialog.open();

																	},
																	error : function(error) {
														        		sap.ui.getCore().AppContext.ShowMessage(error);
																	}
																});
                    					}
		                     }),
		                     
		                     width : "10%"
		              })) ;		   		              
		              

// ------------------------------ Cost Center ------------------------------

			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Cost Center" , tooltip : "Cost Center" }),
		                     
		                     template : new sap.m.Input({
					                      type: sap.m.InputType.Text,
					                      showSuggestion: true,
		                     			  value : "{Costcenter}" ,
		                     			  showValueHelp: true,
		                     			  valueHelpRequest: function (oEvent) {
		                     			  	
							                      			var __parentRowIndex = oEvent.getSource().getParent().getIndex() ;
							                      			
							                      			sap.ui.getCore().AppContext.modelTransfer.read("/ZtgetcostcenterSet",
																{
																	filters : [ new sap.ui.model.Filter("Kokrs", sap.ui.model.FilterOperator.EQ, "1000"),
																				new sap.ui.model.Filter("Spras", sap.ui.model.FilterOperator.EQ, "EN")],
																	
																	success : function(oData, oResponse) {
																		var helperModel =  new sap.ui.model.json.JSONModel();
													        			helperModel.setData(oData);
							
													        			var selectDialog = new sap.m.SelectDialog({
													        					title: "Select Cost Center",
													                            confirm: function(oevent){
													                            	var oSelectedObject = oevent.getParameter("selectedItem").getBindingContext().getObject() ;
													                            	sap.ui.getCore().AppContext.GetItemsTableElementByIndex(__parentRowIndex,15).setValue(oSelectedObject.Costcenter);
													                            },
													                            cancel: function(oevent){}
												                          });
												                          
												                          selectDialog.bindAggregation("items",{
																		            path:"/results",
																		            template: new sap.m.StandardListItem({
																		              	title: "{Costcenter}"
																		            })
																		          });
													        			
													        			selectDialog.setModel(helperModel);
																		selectDialog.open();

																	},
																	error : function(error) {
														        		sap.ui.getCore().AppContext.ShowMessage(error);
																	}
																});
                    					}
		                     }),
		                     
		                     
		                     width : "10%"
		              })) ;		   		              



// ------------------------------ Multiple Accounts ------------------------------

			sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Multiple Accounts" , tooltip : "Multiple Accounts" }),
		                     template: new sap.m.ComboBox({items: [
						              new sap.ui.core.ListItem({key: "", text: "Single Account"}),
						              new sap.ui.core.ListItem({key: "1", text: "Distrib by Quantity"}),
						              new sap.ui.core.ListItem({key: "2", text: "Distrib by Percentage"})
        						],selectedKey : "{Distribkey}"}),
        						
		                    	width : "20%"
		              })) ;		   		              
		              
		              
		              
// ------------------------------ Multiple Accounts Edit ------------------------------		        

		              	sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({ width: '6%',
					    template: new sap.m.Button({ style: sap.m.ButtonType.Default, icon: 'sap-icon://menu', press : function (oEvent) {

					    		var __selectedPONumber = sap.ui.getCore().AppContext.lastSelected_PONumber ;
					    		var __selectedPOItem = sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.getProperty("/results/"+oEvent.getSource().getParent().getIndex()+"/PoItem");
					    		var __selectedDistribAction = sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.getProperty("/results/"+oEvent.getSource().getParent().getIndex()+"/Distribkey");
					    		var __selectedQuantity = sap.ui.getCore().AppContext.CURRENT_PO__STRUCTURE___ITEMS___MODEL.getProperty("/results/"+oEvent.getSource().getParent().getIndex()+"/Quantity");
					    		
					    		sap.ui.getCore().AppContext.dialogSubItemsTriggered( __selectedPONumber , __selectedPOItem , __selectedDistribAction , __selectedQuantity ) ;
				
									
					    } }) }));


// ------------------------------ Limit ------------------------------	      
	      
	      sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Limit" , tooltip : "Limit"}),
		                     template : new sap.m.Input({ value : "{Limit}"}),
		                     width : "6%"
	      }));
	      
	      
// ------------------------------ Last ------------------------------	      
	      
	      sap.ui.getCore().AppContext.tablePOItems.addColumn(new sap.ui.table.Column({
		                     label : new sap.ui.commons.Label({ text : "Last" , tooltip : "Last"}),
		                     template : new sap.m.CheckBox({ value : "{Limit}"}),
		                     width : "6%"
	      }));
		              
	
		sap.ui.getCore().AppContext.tablePOItems.bindRows({path : "/results" });
		//sap.ui.getCore().AppContext.tablePOItems.setVisibleRowCount(sap.ui.getCore().AppContext.tablePOItems.getBinding().getLength()) ;
		

		sap.ui.getCore().AppContext.SumUPTotalPOValue();
		        	
	}


};