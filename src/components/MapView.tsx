import React from "react";

const MapView = ({center, zoom}: {center: google.maps.LatLngLiteral, zoom: number}) => {
    const ref = React.useRef() as React.MutableRefObject<HTMLInputElement>;

    React.useEffect(() => {
      new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });
    });

    return <div ref={ref} id="map" />;
}

export default MapView