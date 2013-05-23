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
    
    // PLUGIN START ////////////////////////////////////////////////////////
    
    // use own namespace for plugin
    window.plugin.strategyManager = function() {};
    
    window.plugin.strategyManager.setup = function() {
        //remove form array
        Array.prototype.remove = function() {
            var what, a = arguments, L = a.length, ax;
            while (L && this.length) {
                what = a[--L];
                while ((ax = this.indexOf(what)) !== -1) {
                    this.splice(ax, 1);
                }
            }
            return this;
        };
        
        //setup plugin
        
        //operation
        window.operation = function () {};
        window.operation.guid = 'abcdef01234566789';
        window.operation.title = 'Perm eclipse (Пермское затмение)';
        
        window.operation.portals = [];
        window.operation.tasks = [];
        
        window.operation.isStrategicPortal = function (guid) {
            return window.operation.portals.indexOf(guid) != -1;    
        }
        
        window.plugin.strategyManager.setupStrategyTab();
        
        window.plugin.strategyManager.drawnStrategy = new L.LayerGroup();
        window.layerChooser.addOverlay(window.plugin.strategyManager.drawnStrategy, 'Strategy');
        map.addLayer(window.plugin.strategyManager.drawnStrategy);
        map.on('layeradd',function(obj) {
            if(obj.layer === window.plugin.strategyManager.drawnStrategy)
            {
                obj.layer.eachLayer(function(marker) {
                    if(marker._icon) window.setupTooltips($(marker._icon));
                });
            }
        });
        
        window.addHook('portalDetailsUpdated', window.plugin.strategyManager.portalDetailsUpdated);
    }
    
    window.plugin.strategyManager.drawData = function() {
        window.plugin.strategyManager.drawnStrategy.clearLayers();
        $('#portalstable').empty();
        $('#linkstable').empty();
        $.each(window.operation.portals, function(i, guid) {
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
            marker.addTo(window.plugin.strategyManager.drawnStrategy);
            marker.on('click', function () { console.log('click to strat portal'); });
            var portal = $('<tr><td style="width: 80%">'+d.portalV2.descriptiveText.TITLE+'</td><td style="width: 20%"><a>X</a></td></tr>');
            $('#portalstable').append(portal);
            var link = $('<tr><td style="width: 40%">'+d.portalV2.descriptiveText.TITLE+'</td><td style="width: 40%">'+d.portalV2.descriptiveText.TITLE+'</td><td style="width: 20%"><a>X</a></td></tr>');
            $('#linkstable').append(link);
        });
        
    }    
    
    window.plugin.strategyManager.renderStrategicPortalToggleButton = function () {
        var isStrategic = window.operation.isStrategicPortal(window.selectedPortal) ? 'YES' : 'NO';
        var button = $('#strategicToggleButton');
        if(button.length == 0){
            button = $('<a id="strategicToggleButton" onclick="window.plugin.strategyManager.toggleStrategicPortal()" title="Toggle strategic portal"></a>');
            $('#portaldetails .linkdetails').append($('<aside>').append(button));
        }
        button.text('Strategic portal: ' + isStrategic);
    }
    
    window.plugin.strategyManager.portalDetailsUpdated = function (data) {
        window.plugin.strategyManager.renderStrategicPortalToggleButton();
        return true;
    }
    
    window.plugin.strategyManager.toggleStrategicPortal = function () {
        var guid = window.selectedPortal;
        if(window.operation.isStrategicPortal(guid)) {
            window.plugin.strategyManager.removeStrategicPortal(guid);
        } else {
            window.plugin.strategyManager.addStrategicPortal(guid);
        }
        plugin.strategyManager.drawData();
        
    }
    
    window.plugin.strategyManager.addStrategicPortal = function (guid) {
        window.operation.portals.push(guid);
        window.plugin.strategyManager.renderStrategicPortalToggleButton(guid);
    }
    
    window.plugin.strategyManager.removeStrategicPortal = function (guid) {
        window.operation.portals.remove(guid);
        window.plugin.strategyManager.renderStrategicPortalToggleButton(guid);
    }
    
    window.plugin.strategyManager.setupStrategyTab = function () {
        $('#chatcontrols').append($('<a id="strategy" onclick="window.plugin.strategyManager.activateStrategyTab();">strategy</a>'));
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
    
    window.plugin.strategyManager.activateStrategyTab = function () {
        $('#chat > div').hide();
        $('#chatcontrols a').removeClass('active');
        $('#strategytab').show();
        $('#chatcontrols a#strategy').addClass('active');
    }
    
    var setup =  function() {
        window.plugin.strategyManager.setup();
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
