// ==UserScript==
// @id             iitc-plugin-ingress-strategy-manager@ancooper
// @name           IITC plugin: ingress strategy manager
// @version        0.1.2.46
// @downloadURL    https://raw.github.com/ancooper/ISM/master/build/build.tamper.js
// @description    ingress strategy manager for ingress over IITC
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// ==/UserScript==

function wrapper() {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if(typeof window.plugin !== 'function') window.plugin = function() {};

    Array.prototype.remove = function () {
    	var what, a = arguments, L = a.length, ax;
    	while (L && this.length) {
    		what = a[--L];
    		while ((ax = this.indexOf(what)) !== -1) {
    			this.splice(ax, 1);
    		}
    	}
    	return this;
    };

    // PLUGIN START ////////////////////////////////////////////////////////

    // Overrides IITC methods
    window.portalRenderLimit.cleanUpOverLimitPortalLevel = function () {
    	var currentMinLevel = window.getMinPortalLevel();
    	for (var i = 0; i < currentMinLevel; i++) {
    		portalsLayers[i].eachLayer(function (item) {
    			var itemGuid = item.options.guid;
    			// check if 'item' is a portal
    			if (getTypeByGuid(itemGuid) != TYPE_PORTAL) return true;
    			// Don’t remove if it is selected.
    			if (itemGuid == window.selectedPortal) return true;
    			// Don’t remove if it is strategic.
    			if (window.operation.portals.indexOf(itemGuid) != -1) return true;
    			portalsLayers[i].removeLayer(item);
    		});
    	}
    }
    // End overrides

    window.plugin.ism = function () { };
    window.plugin.ism.operation = {};
	/*
	window.plugin.ism.addIsmControl = function() {
	  var IsmControl = new L.Control.Draw({
		draw: {
		  rectangle: false,
		  polygon: {
			title: 'Add a polygon\n\n'
			  + 'Click on the button, then click on the map to\n'
			  + 'define the start of the polygon. Continue clicking\n'
			  + 'to draw the line you want. Click the first or last\n'
			  + 'point of the line (a small white rectangle) to\n'
			  + 'finish. Double clicking also works.'
		  },

		  polyline: {
			title: 'Add a (poly) line.\n\n'
			  + 'Click on the button, then click on the map to\n'
			  + 'define the start of the line. Continue clicking\n'
			  + 'to draw the line you want. Click the <b>last</b>\n'
			  + 'point of the line (a small white rectangle) to\n'
			  + 'finish. Double clicking also works.'
		  },

		  circle: {
			title: 'Add a circle.\n\n'
			  + 'Click on the button, then click-AND-HOLD on the\n'
			  + 'map where the circle’s center should be. Move\n'
			  + 'the mouse to control the radius. Release the mouse\n'
			  + 'to finish.'
		  },

		  marker: {
			title: 'Add a marker.\n\n'
			  + 'Click on the button, then click on the map where\n'
			  + 'you want the marker to appear.'
		  },

		},

		edit: {
		  featureGroup: window.plugin.drawTools.drawnItems,

		  edit: {
			title: 'Edit drawn items'
		  },

		  remove: {
			title: 'Delete drawn items'
		  },

		},

	  });

	  map.addControl(drawControl);
	//  plugin.drawTools.addCustomButtons();
	}
	*/

    window.plugin.ism.test1 = function () { alert('test1'); }
    window.plugin.ism.test2 = function () { alert('test2'); }

    window.plugin.ism.setup = function () {
    	self = this;

    	//setup plugin
    	$('#toolbox')
			.append('<a onclick="window.plugin.ism.test1()">Test#1</a>')
			.append('<a onclick="window.plugin.ism.test2()">Test#2</a>');
    	//window.map.on('click', window.plugin.ism.onMapClick

    	//operation
    	this.operation = {
			guid: 'abcdef01234566789',
			title: 'Perm eclipse (Пермское затмение)',
    		portals: [],
			links: [],
    		tasks: []
		};
    	
    	this.isStrategicPortal = function (guid) {
    		return window.operation.portals.indexOf(guid) != -1;
    	}

    	this.setupStrategyTab();
    	//this.setupStrategyLayer();

    	window.addHook('portalDetailsUpdated', this.portalDetailsUpdated);
    }

    window.plugin.ism.setupStrategyLayer = function () {
    	this.layer = new L.LayerGroup();
    	window.layerChooser.addOverlay(this.layer, 'Strategy');
    	window.map.addLayer(this.layer);
    }


    window.plugin.ism.drawData = function() {
        this.layer.clearLayers();
        $('#portalstable').empty();
        $('#linkstable').empty();
        $.each(this.operation.portals, function(i, guid) {
            var d = window.portals[guid].options.details
            var coord = [d.locationE6.latE6/1E6, d.locationE6.lngE6/1E6];
            var marker = new L.CircleMarker(coord, {
                color: '#000',
                radius: 5,
                weight: 1,
                fill: true,
                fillColor: '#000',
                fillOpacity: 0.25,
                clickable: true
            })
            marker.addTo(window.plugin.ism.drawnStrategy);
            marker.on('click', function () { console.log('click to strat portal'); });
            var portal = $('<tr><td style="width: 80%">'+d.portalV2.descriptiveText.TITLE+'</td><td style="width: 20%"><a>X</a></td></tr>');
            $('#portalstable').append(portal);
            var link = $('<tr><td style="width: 40%">'+d.portalV2.descriptiveText.TITLE+'</td><td style="width: 40%">'+d.portalV2.descriptiveText.TITLE+'</td><td style="width: 20%"><a>X</a></td></tr>');
            $('#linkstable').append(link);
        });
        
    }    
    
    window.plugin.ism.renderStrategicPortalToggleButton = function () {
        var isStrategic = this.isStrategicPortal(window.selectedPortal) ? 'YES' : 'NO';
        var button = $('#strategicToggleButton');
        if(button.length == 0){
            button = $('<a id="strategicToggleButton" onclick="window.plugin.ism.toggleStrategicPortal()" title="Toggle strategic portal"></a>');
            $('#portaldetails .linkdetails').append($('<aside>').append(button));
        }
        button.text('Strategic portal: ' + isStrategic);
    }
    
    window.plugin.ism.portalDetailsUpdated = function (data) {
        this.renderStrategicPortalToggleButton();
        return true;
    }
    
    window.plugin.ism.toggleStrategicPortal = function () {
        var guid = window.selectedPortal;
        if(this.isStrategicPortal(guid)) {
            this.removeStrategicPortal(guid);
        } else {
            this.addStrategicPortal(guid);
        }
        //this.drawData();
    }
    
    window.plugin.ism.addStrategicPortal = function (guid) {
        this.operation.portals.push(guid);
        this.renderStrategicPortalToggleButton(guid);
    }
    
    window.plugin.ism.removeStrategicPortal = function (guid) {
        this.operation.portals.remove(guid);
        this.renderStrategicPortalToggleButton(guid);
    }
    
    window.plugin.ism.setupStrategyTab = function () {
        $('#chatcontrols').append($('<a id="strategy" onclick="window.plugin.ism.activateStrategyTab();">strategy</a>'));
        $('#chat').append($('<div id="strategytab"></div>'));
        
        $('#strategytab').html
        (  '<div id="operation" style="clear:both;"><span>Operation: </span><select style="width: 80%"><option>' + window.operation.title + '</option><option>two</option><option>three</option></select><span> </span><a>new...</a></div>'
         + '<div id="tasks" style="clear:both;"><span>Tasks:</span></div><table id="taskstable" style="width: 100%;"></table>'
         + '<div id="portals" style="clear:both;"><span>Portals:</span></div><table id="portalstable" style="width: 100%;"></table>'
         + '<div id="links" style="clear:both;"><span>Links:</span></div><table id="linkstable" style="width: 100%;"></table>'
         + ''
         + ''
         + ''
         + ''
         + ''
         + ''
         + ''
         + ''
         + ''
         + ''
         + '');
        
        
    }
    
    window.plugin.ism.activateStrategyTab = function () {
        $('#chat > div').hide();
        $('#chatcontrols a').removeClass('active');
        $('#strategytab').show();
        $('#chatcontrols a#strategy').addClass('active');
    }
    
    var setup =  function() {
        window.plugin.ism.setup();
    }
    
    // PLUGIN END //////////////////////////////////////////////////////////
    
    if(window.iitcLoaded && typeof setup === 'function') {
        setup();
    } else {
        if(window.bootPlugins)
            window.bootPlugins.push(setup);
        else
            window.bootPlugins = [setup];
    }
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
