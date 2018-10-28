var view;

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/ScaleBar",
    "esri/widgets/Expand",
    "esri/widgets/BasemapGallery",
    "dojo/domReady!"
], function (
    Map,
    MapView,
    FeatureLayer,
    Home,
    Legend,
    ScaleBar,
    Expand,
    BasemapGallery
) {
    
    var map = new Map({
        basemap: "streets-relief-vector"
    });
    
    view = new MapView({
        map: map,
        container: "viewDiv",
        constraints: {
            snapToZoom: false,
            minZoom: 5,
            maxZoom: 21
        },
        extent: {
            xmax: -11629178,
            xmin: -11718500,
            ymax: 4854081,
            ymin: 4808536,
            spatialReference: {
                wkid: 102100
            }
        }
    });
    
    view.ui.remove("zoom");
    
    var scaleBar, homeButton;
    
    scaleBar = new ScaleBar({
        view: view,
        unit: "dual"
    });
    view.ui.add(scaleBar, "bottom-left");
    
    homeButton = new Home({
        view: view
    });
    view.ui.add(homeButton, "top-left");
    
    var basemapGall = new BasemapGallery({
        view: view,
        container: document.createElement("div")
    });
    
    var basemapExpand = new Expand({
            view: view,
            autoCollapse: true,
            title: "Basemap Options",
            content: basemapGall.domNode,
            expandIconClass: "esri-icon-basemap"
        });

    view.ui.add(basemapExpand, "top-left");
    
    //Remove later
    var denverBorder = {
        type: "simple-fill",
        color: [99, 99, 99, 0],
        outline: {
            color: [99, 99, 99, 1],
            width: 2
        }
    };
    
    //Remove later
    var denverRenderer = {
        type: "simple",
        symbol: denverBorder
    };
    
    var goodMarker = {
        type: "picture-marker",
        url: "https://static.arcgis.com/images/Symbols/Basic/GreenSphere.png",
        width: "30px",
        height: "30px",
        angle: 30
    }
    
    var fairMarker = {
        type: "picture-marker",
        url: "https://static.arcgis.com/images/Symbols/Basic/YellowSphere.png",
        width: "30px",
        height: "30px",
        angle: 30
    }
    
    var poorMarker = {
        type: "picture-marker",
        url: "https://static.arcgis.com/images/Symbols/Basic/OrangeSphere.png",
        width: "30px",
        height: "30px",
        angle: 30
    }
    
    var failMarker = {
        type: "picture-marker",
        url: "https://static.arcgis.com/images/Symbols/Basic/RedSphere.png",
        width: "30px",
        height: "30px",
        angle: 30
    }
    
    var pointRendererGood = {
        type: "unique-value",
        defaultSymbol: goodMarker,
        field: "SUFFICIE_1",
        uniqueValueInfos: [{
            value: 80,
            symbol: goodMarker
        }]
    };
    
    var pointRendererFair = {
        type: "unique-value",
        defaultSymbol: fairMarker,
        field: "SUFFICIE_1",
        uniqueValueInfos: [{
            value: 20,
            symbol: failMarker
        }]
    };
    
    var pointRendererPoor = {
        type: "unique-value",
        defaultSymbol: poorMarker,
        field: "SUFFICIE_1",
        uniqueValueInfos: [{
            value: 20,
            symbol: failMarker
        }]
    };
    
    var goodSym = {
        type: "simple",
        symbol: {
            type: "simple-fill",
            outline: {
                color: "lightgray",
                width: 0.5
            }
        },
        label: " ",
        visualVariables: [{
            type: "color",
            valueExpressionTitle: " ",
            field: "SUFFICIE_1",
            stops: [{
                value: 0,
                color: [255, 0, 0, 0.85],
                label: "Fail: Sufficiency < 10"
            }, {
                value: 10,
                color: [255, 127, 0, 0.85],
                label: "Poor: Sufficiency < 50"
            }, {
                value: 50,
                color: [255, 255, 51, 0.85],
                label: "Fair: Sufficiency > 50"
            }, {
                value: 100,
                color: [0, 255, 0, 0.85],
                label: "Good: Sufficency > 80"
            }]
        }]
    };
    
    var bridgeLayer = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/Denver_Bridge_Integrity_Ref/FeatureServer/1",
        definitionExpression: "DECK_COND_ <> 'N' AND SUPERSTRUC <> 'N' AND SUBSTRUCTU <> 'N'",
        renderer: goodSym,
        popupTemplate: {
            title: "{BRIDGE_NAM}",
            content: "Structure ID: {STRUCTURE_NUM}<br>Built in: {YEARBUILT}<br>Bridge Sufficieny Rating: <strong>{SUFFICIE_1}</strong><br>Deck Condition Rating: {DECK_COND_}<br>Superstructure Rating: {SUPERSTRUC}<br>Substructure Rating: {SUBSTRUCTU}<br>Culvert Condition: {CULVERT_CO}<br>Last Inspected: {YEAR_ADT_0}<br>Next Inspection: {YEAR_OF_FU}"
        }
    });
    map.add(bridgeLayer);
    
    var goodPointsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/Denver_Bridge_Integrity_Ref/FeatureServer/0",
        definitionExpression: "DECK_COND_ <> 'N' AND SUPERSTRUC <> 'N' AND SUBSTRUCTU <> 'N' AND SUFFICIE_1 >= '80'",
        renderer: pointRendererGood,
        legendEnabled: false
    });
    map.add(goodPointsLayer);
    
    var fairPointsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/Denver_Bridge_Integrity_Ref/FeatureServer/0",
        definitionExpression: "DECK_COND_ <> 'N' AND SUPERSTRUC <> 'N' AND SUBSTRUCTU <> 'N' AND SUFFICIE_1 >= '50' AND SUFFICIE_1 < '80'",
        renderer: pointRendererFair,
        legendEnabled: false
    });
    map.add(fairPointsLayer);
    
    var poorPointsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/Denver_Bridge_Integrity_Ref/FeatureServer/0",
        definitionExpression: "DECK_COND_ <> 'N' AND SUPERSTRUC <> 'N' AND SUBSTRUCTU <> 'N' AND SUFFICIE_1 >= '10' AND SUFFICIE_1 < '50'",
        renderer: pointRendererPoor,
        legendEnabled: false
    });
    map.add(poorPointsLayer);
    
    var denverBoundary = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/Denver_Bridge_Integrity_Ref/FeatureServer/2",
        renderer: denverRenderer
    });
    map.add(denverBoundary);
        
    var legend = new Legend({
        view: view,
        layerInfos: [{
            layer: bridgeLayer,
            title: "Denver Bridge Integrity"
        }]
    });
    view.ui.add(legend, "bottom-right");
});