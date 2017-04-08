
function initMap() {
    var harvard = {lat: 42.3770, lng: -71.1167};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: harvard,
        mapTypeId: 'roadmap'
    });

    var searchBox = new google.maps.places.SearchBox(document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('pac-input'));

    var markers = [];


    /**
     * Function that sends the server the coordinates of the bounds of the viewport, the
     * server search for all places in the database within those bounds, return a json list of them
     * (with no duplicates), and then render markers on their coordinates
     */
    function get_places(){
        $.getJSON($SCRIPT_ROOT+'/get_places',{
            llat:map.getBounds().f.f, //left lat
            llng:map.getBounds().b.b, //left lng
            rlat:map.getBounds().f.b, //right lat
            rlng:map.getBounds().b.f  //right lng
        },  function(data){
            /**
            data is a JSON data list containing lists, so forEach access all elements of the first list */
                data.forEach(function(k){
                    //this is the marker for every place
                    var marker= new google.maps.Marker({
                        map:map,
                        title:k[0],
                        position:{lat:k[1],lng:k[2]},
                        clearable:true
                    });

                    /**
                     * when a marker it's clicked, an InfoWindow is created with a loading gif and then opened.
                     * Then, the server gets sent a request for info about that postal code and return JSON
                     * data which gets parsed into the infowindow
                     */
                    marker.addListener('click',function(){
                        // infoWindow with a loading gif
                        this.clearable=false;
                        var infoWindow = new google.maps.InfoWindow({
                           // the div id must be unique so when new info gets parsed doesn't ovveride
                           // other infoWindows
                           content: '<div id="content-'+k[3]+'" style="font-size: 11px"><p><strong>'+k[0]+'</strong></p>'+'<img src="static/ajax-loader.gif" alt="loading gif"></div>'
                        });

                       infoWindow.open(map,marker);

                       // ajax request to the server for news info
                       $.getJSON($SCRIPT_ROOT+'/get_news',{
                            pcode:k[3]
                           },function(data){
                                // new info gets created and then parsed into the InfoWindow
                                contentForInfo = '';
                                data.forEach(function(p){
                                    contentForInfo+='<p><a href="'+p[1]+'">'+p[0]+'</a></p>';
                                    document.getElementById('content-'+k[3]).innerHTML = '<p><strong>'+k[0]+'</strong></p>'+contentForInfo
                                });
                                infoWindow.open(map,marker);

                           }
                       );

                    });

                    markers.push(marker);

                });
            }
        );
    }


    window.onload= get_places;

    /**
     * when the map event 'bounds_changed' fires, change the bounds of the
     * searchBox to the same ones, to bias the research area
     */
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    /**
     * When the event 'dragend' fires call get_places()
     */
    map.addListener('dragend',function(){
        get_places();
    });

    /**
     * When the event 'zoom_changed' fires, get places
     */
    map.addListener('zoom_changed', function(){
        get_places();
    });
    /**
     * when 'dragstart' event fires, clear all markers
     * todo mantain current marker and infowindow when dragging
     */
    map.addListener('dragstart',function(){
       markers.forEach(function(marker){
           if (marker.clearable===true){
                marker.setMap(null);
           }
       });
    });

    /** the event places_changed fires when the user select and submit a query to the searchBox */
    searchBox.addListener('places_changed', function () {
        // getPlaces() return the query as an array
        var places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();

        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                    map: map,
                    title: place.name,
                    position: place.geometry.location
                })
            );

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            }
            else {
                bounds.extend(place.geometry.location);
            }
        });

        map.fitBounds(bounds);

    });
}