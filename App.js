Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {

    	this.add({ 
			xtype: 'textfield',
			fieldLabel: 'Search',
			name:'Search',
			width:390,
			margin : 20,
			listeners : {
				scope : this,
				change : function(el,newValue,oldValue, eOpts) {
					console.log("newValue",newValue);

					var grid = this.down('rallygrid');

					if (!_.isUndefined(grid)&&!_.isNull(grid)) {
                        store = grid.getStore();
                        store.clearFilter(true);
                    	store.filter({
                        	property: 'Description',
                        	operator: 'contains',
                        	value: newValue
                        });
					}
				}
			}
		});

    	this.loadAStore();
    },

    loadAStore : function() {
    	var me = this;

		Ext.create('Rally.data.wsapi.Store', {
			model: 'subscription',
			autoLoad: true,
			listeners : {
				load: function(store, data, success) {
					// subscription is the first object
					var sub = _.first(data);

					// load the revisionhistory model and use it to the load the rev history object.
					Rally.data.ModelFactory.getModel({
					    type: 'RevisionHistory',
					    success: function(model) {
					        model.load(sub.get("RevisionHistory"), {
							    fetch: true,
							    callback: function(result, operation) {
							    	console.log("result",result);
							    	// create a grid, using the Revisions collection store
							    	me.add({
							    		xtype : 'rallygrid',
							    		store : result.getCollection("Revisions"),
							    		columnCfgs: [
				                            'RevisionNumber',
				                            'CreationDate',
				                            'Description',
				                            'User'
				                        ],
							    	});
							    }
							});
					    }
					});
				}
			},
			fetch: ['Name', 'RevisionHistory'],
			filters : [
				// { property : "FormattedID", operator : "=", value : "US17" }
			]
		});
    }
});