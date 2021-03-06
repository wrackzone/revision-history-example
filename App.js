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
						if (newValue!=="") {
							store.filter({
								property: 'Description',
								operator: 'contains',
								value: newValue
							});
						} else {
							store.load();
						}
					}
				}
			}
		});

		this.loadAStore();
	},

	loadAStore : function() {
		var me = this;

		Ext.create('Rally.data.wsapi.Store', {
			// model: 'subscription',
			model : me.getSetting("type"),
			autoLoad: true,
			listeners : {
				load: function(store, data, success) {
					// subscription is the first object
					var sub = null;
					if (me.getSetting("type")==="subscription") {
						sub = _.first(data);
					} else {
						// get current workspace
						console.log("Workspace",me.getContext().getWorkspace());
						sub = _.first(_.filter(data,function(d) {
							return me.getContext().getWorkspace().ObjectID === d.get("ObjectID");
						}));
					}

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
	},

	getSettingsFields: function() {
        var me = this;

        var typesStore = new Ext.data.ArrayStore({
            fields: ['type'],
            data : [['workspace'],['subscription']]
        }); 

        return [ {
                name: 'type',
                xtype: 'combo',
                store : typesStore,
                valueField : 'type',
                displayField : 'type',
                queryMode : 'local',
                forceSelection : true,
                boxLabelAlign: 'after',
                fieldLabel: 'Search the revision history of this type',
                margin: '0 0 15 50',
                labelStyle : "width:200px;",
                afterLabelTpl: 'Revision History Type'
            }
		] ;
    },
    config: {
        defaultSettings: {
            type : "subscription"
        }
    }

});
