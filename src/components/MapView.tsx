import mapboxgl from "mapbox-gl";
import React from "react";

const MapView = ({ center, zoom }: { center: google.maps.LatLngLiteral, zoom: number }) => {
    const mapContainer = React.useRef(null);
    const map: any = React.useRef(null);
    const [lng, setLng] = React.useState(-70.9);
    const [lat, setLat] = React.useState(42.35);

    React.useEffect(() => {
        if (map.current) return; // initialize map only once
        const mapboxnya = new mapboxgl.Map({
            container: mapContainer.current as any,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom
        })

        // mapboxnya.addControl(
        //     new mapboxgl.GeolocateControl({
        //         positionOptions: {
        //             enableHighAccuracy: true
        //         },
        //         // When active the map will receive updates to the device's location as it changes.
        //         trackUserLocation: true,
        //         // Draw an arrow next to the location dot to indicate which direction the device is heading.
        //         showUserHeading: true
        //     })
        // );

        map.current = mapboxnya

        map.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                // When active the map will receive updates to the device's location as it changes.
                trackUserLocation: true,
                // Draw an arrow next to the location dot to indicate which direction the device is heading.
                showUserHeading: true
            })
        );
    });

    return <div>
        <div ref={mapContainer} className="map-container" style={{ height: '50vh' }} />
    </div>;
}

export default MapView