import mapboxgl from "mapbox-gl";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import React from "react";

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { List, ListItem, ListIcon } from "@chakra-ui/react";

import { MdCheckCircle, MdSettings } from "react-icons/md"

import { apiConn } from "./apiHelpers";

const MapView = ({ center, zoom, choosedData }: { center: google.maps.LatLngLiteral, zoom: number, choosedData?: any }) => {
    const mapContainer = React.useRef(null);
    const map: any = React.useRef(null);
    const [lng, setLng] = React.useState(107.12);
    const [lat, setLat] = React.useState(6.32);
    const [zooms, setZoom] = React.useState(9)
    const [pos, setPos] = React.useState({
        lat: 6.32,
        lng: 107.12
    })

    const [markers, setMarkers] = React.useState([]) as any

    const [fullDataAddr, setFullDataAddr] = React.useState({}) as any

    const [country, setCountry] = React.useState('')
    const [province, setProvince] = React.useState('')
    const [cities, setCities] = React.useState('')
    const [district, setDistrict] = React.useState('')
    const [subdistrict, setSubdistrict] = React.useState('')

    React.useEffect(() => { // initialize map only once
        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });
        const mapboxnya = new mapboxgl.Map({
            container: mapContainer.current as any,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [107.11802085463165, -6.322973119949907],
            zoom: zooms
        }).addControl(geolocate, "top-right")

        map.current = mapboxnya

        // const geocoder = new MapboxGeocoder({
        //     accessToken: mapboxgl.accessToken,
        //     mapboxgl: mapboxnya
        // });

        if (map.current) {
            map.current.on('click', (e: { lngLat: { lng: number, lat: number } }) => {
                setLng(e.lngLat.lng)
                setLat(e.lngLat.lat)

                setPos({
                    lat: e.lngLat.lat,
                    lng: e.lngLat.lng
                })

                setZoom(15)

                map.current.flyTo({
                    center: [
                        e.lngLat.lng,
                        e.lngLat.lat
                    ],
                    zoom: 15,
                    essential: true // this animation is considered essential with respect to prefers-reduced-motion
                });
            })
            return
        }
    }, []);

    React.useEffect(() => {
        if (lat !== 0 && lng !== 0) {
            apiConn('get', `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`, 'ext')
                .then((val: any) => {
                    setFullDataAddr(val.data)

                    const marker = new mapboxgl.Marker({
                        draggable: true
                    });

                    if (map.current) {
                        const theMarkers = marker.setLngLat([lng, lat]).addTo(map.current)

                        const dataMarkers:Object[] = markers

                        dataMarkers.push(theMarkers)
                        
                        setMarkers(dataMarkers)

                        const allMarkers = markers

                        if (allMarkers.length > 0) {
                            for (var i = allMarkers.length - 1; i >= 0; i--) {
                              allMarkers[i].remove();
                            }

                            setMarkers(allMarkers)
                        }
                    }
                    // map.current.Marker().setLngLat([lng, lat]).addTo(map.current);
                })
        }
    }, [JSON.stringify(pos)])

    React.useEffect(() => {
        const dataCountry = findPlaceInData('country')
        const dataState = findPlaceInData('region')
        const dataCities = findPlaceInData('place')
        const dataDistrict = findPlaceInData('locality')
        const dataSubDistrict = findPlaceInData('neighborhood')

        console.log(fullDataAddr)
        if (dataCountry) {
            setCountry(dataCountry.text)
        }

        if (dataState) {
            setProvince(dataState.text)
        }

        if (dataCities) {
            setCities(dataCities.text)
        } else {
            setCities('')
        }

        if (dataDistrict) {
            setDistrict(dataDistrict.text)
        } else {
            setDistrict('')
        }

        if (dataSubDistrict) {
            setSubdistrict(dataSubDistrict.text)
        } else {
            setSubdistrict('')
        }

        choosedData({
            country: country,
            province: province,
            cities: cities,
            district: district,
            subdistrict: subdistrict
        })
    }, [JSON.stringify(fullDataAddr)])

    const findPlaceInData = (idnya: string) => {
        if (fullDataAddr.features) {
            const getData = fullDataAddr.features.filter((val: { id: string }) => val.id.includes(idnya))

            return getData[0]
        }
    }

    return <div>
        Langitude: {lng}, Latitude: {lat}
        <div ref={mapContainer} className="map-container" style={{ height: '30vh' }} />
        <div style={{ paddingTop: 10 }}>
            <List spacing={3}>
                <ListItem>
                    <ListIcon as={MdCheckCircle} color='green.500' />
                    Country : <b>{country}</b>
                </ListItem>
                <ListItem>
                    <ListIcon as={MdCheckCircle} color='green.500' />
                    Province / State : <b>{province}</b>
                </ListItem>
                <ListItem>
                    <ListIcon as={MdCheckCircle} color='green.500' />
                    Cities : <b>{cities}</b>
                </ListItem>
                <ListItem>
                    <ListIcon as={MdCheckCircle} color='green.500' />
                    District : <b>{district}</b>
                </ListItem>
                <ListItem>
                    <ListIcon as={MdCheckCircle} color='green.500' />
                    Sub-district : <b>{subdistrict}</b>
                </ListItem>
            </List>
        </div>
    </div>;
}

export default MapView