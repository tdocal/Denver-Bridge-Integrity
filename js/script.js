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
    
    /*"streets", "satellite", "hybrid", "terrain", "topo", "gray", "dark-gray", "oceans", "national-geographic", "osm", "dark-gray-vector", "gray-vector", "streets-vector", "topo-vector", "streets-night-vector", "streets-relief-vector", "streets-navigation-vector"*/
    var map = new Map({
        basemap: "streets-night-vector"
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
                color: "green",
                width: "30px",
                height: "30px"
            },
            label: "Good >=7"
        }, {
            value: "F",
            symbol: {
                type: "picture-marker",
                url: "https://static.arcgis.com/images/Symbols/Basic/YellowSphere.png",
                width: "30px",
                height: "30px"
            },
            label: "Fair 5-6"
        }, {
            value: "P",
            symbol: {
                type: "picture-marker",
                url: "https://static.arcgis.com/images/Symbols/Basic/RedSphere.png",
                width: "30px",
                height: "30px"
            },
            label: "Poor <=4"
        }]
    };
    
    var pointsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/YseQBnl2jq0lrUV5/arcgis/rest/services/Denver_Bridge_Integrity_Ref/FeatureServer/0",
        definitionExpression: "DECK_COND_ <> 'N' AND SUPERSTRUC <> 'N' AND SUBSTRUCTU <> 'N'",
        renderer: pointRenderer,
        popupTemplate: {
            title: "{BRIDGE_NAM}",
            content: "Structure ID: {STRUCTURE_NUM}<br>Built in: {YEAR_BUILT}<br>Bridge Sufficieny Rating: <strong>{SUFFICIE_1}</strong><br>Deck Condition Rating: {DECK_COND_}<br>Superstructure Rating: {SUPERSTRUC}<br>Substructure Rating: {SUBSTRUCTU}<br>Culvert Condition: {CULVERT_CO}<br>Last Inspected: {YEAR_ADT_0}<br>Next Inspection: {YEAR_OF_FU}"
            //content: "{*}"
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
    
    view.whenLayerView(pointsLayer).then(setupHoverTooltip);
    
    function setupHoverTooltip(layerview) {
        var promise;
        var highlight;

        var tooltip = createTooltip();
        view.on("pointer-move", function (event) {
            if (promise) {
                promise.cancel();
            }
            promise = view.hitTest(event.x, event.y)
                .then(function (hit) {
                    promise = null;

                    if (highlight) {
                        highlight.remove();
                        highlight = null;
                    }

                    var results = hit.results.filter(function (result) {
                            return result.graphic.layer == pointsLayer;
                        });
                    if (results.length) {
                        var graphic = results[0].graphic;
                        var screenPoint = hit.screenPoint;

                        highlight = layerview.highlight(graphic);
                        tooltip.show(screenPoint, graphic.getAttribute("BRIDGE_NAM"));
                    } else {
                        tooltip.hide();
                    }
                });
        });
    }
    
    function createTooltip() {
        var tooltip = document.createElement("div");
        var style = tooltip.style;

        tooltip.setAttribute("role", "tooltip");
        tooltip.classList.add("tooltip");

        var textElement = document.createElement("div");
        textElement.classList.add("esri-widget");
        tooltip.appendChild(textElement);

        view.container.appendChild(tooltip);

        var x = 0;
        var y = 0;
        var targetX = 0;
        var targetY = 0;
        var visible = false;

        function move() {
            x += (targetX - x) * 0.1;
            y += (targetY - y) * 0.1;

            if (Math.abs(targetX) < 1 && Math.abs(targetY) < 1) {
                x = targetX;
                y = targetY;
            } else {
                requestAnimationFrame(move);
            }

            style.transform = "translate3d(" + Math.round(x) + "px," + Math.round(y - 50) + "px, 0)";
        }

        return {
            show: function (point, text) {
                if (!visible) {
                    x = point.x;
                    y = point.y;
                }

                targetX = point.x;
                targetY = point.y;
                style.opacity = 1;
                visible = true;
                textElement.innerHTML = text;
                
                move();
            },

            hide: function () {
                style.opacity = 0;
                visible = false;
            }
        };
    }
});