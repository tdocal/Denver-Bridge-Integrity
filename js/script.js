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
    
    var view = new MapView({
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
    
    var pointRenderer = {
        type: "unique-value",
        valueExpressionTitle: " ",
        defaultSymbol: {
            type: "picture-marker",
            url: "https://static.arcgis.com/images/Symbols/Basic/PurpleSphere.png",
            width: "30px",
            height: "30px"
        },
        defaultLabel: "Other",
        field: "CAT10",
        uniqueValueInfos: [{
            value: "G",
            symbol: {
                type: "picture-marker",
                url: "https://static.arcgis.com/images/Symbols/Basic/GreenSphere.png",
                width: "30px",
                height: "30px"
            },
            label: "Good"
        }, {
            value: "F",
            symbol: {
                type: "picture-marker",
                url: "https://static.arcgis.com/images/Symbols/Basic/YellowSphere.png",
                width: "30px",
                height: "30px"
            },
            label: "Fair"
        }, {
            value: "P",
            symbol: {
                type: "picture-marker",
                url: "https://static.arcgis.com/images/Symbols/Basic/OrangeSphere.png",
                width: "30px",
                height: "30px"
            },
            label: "Poor"
        }]
    };
    
    var bridgeRenderer = {
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
                color: [158, 154, 200, 0.85]
            }, {
                value: 10,
                color: [255, 127, 0, 0.85]
            }, {
                value: 50,
                color: [255, 255, 51, 0.85]
            }, {
                value: 80,
                color: [0, 255, 0, 0.85]
            }]
        }]
    };
    
    var bridgeLayer = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/Denver_Bridge_Integrity_Ref/FeatureServer/1",
        definitionExpression: "DECK_COND_ <> 'N' AND SUPERSTRUC <> 'N' AND SUBSTRUCTU <> 'N'",
        renderer: bridgeRenderer,
        legendEnabled: false
    });
    map.add(bridgeLayer);
    
    var pointsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/Denver_Bridge_Integrity_Ref/FeatureServer/0",
        definitionExpression: "DECK_COND_ <> 'N' AND SUPERSTRUC <> 'N' AND SUBSTRUCTU <> 'N'",
        renderer: pointRenderer,
        popupTemplate: {
            title: "{BRIDGE_NAM}",
            content: "Structure ID: {STRUCTURE_NUM}<br>Built in: {YEARBUILT}<br>Bridge Sufficieny Rating: <strong>{SUFFICIE_1}</strong><br>Deck Condition Rating: {DECK_COND_}<br>Superstructure Rating: {SUPERSTRUC}<br>Substructure Rating: {SUBSTRUCTU}<br>Culvert Condition: {CULVERT_CO}<br>Last Inspected: {YEAR_ADT_0}<br>Next Inspection: {YEAR_OF_FU}"
        }
    });
    map.add(pointsLayer);
        
    var legend = new Legend({
        view: view,
        layerInfos: [{
            layer: pointsLayer,
            title: "Denver Bridge Integrity"
        }]
    });
    view.ui.add(legend, "bottom-right");
});