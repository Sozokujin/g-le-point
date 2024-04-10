"use client";
import ModalCreateMarker from "@/components/modalCreateMarker";
import { useAuthStore } from "@/stores/authStore";
import { useMarkerStore } from "@/stores/markerStore";
import "mapbox-gl/dist/mapbox-gl.css";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Map, { GeolocateControl, Marker } from "react-map-gl";
import classes from "../Page.module.css";

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const { markers, getMarkers } = useMarkerStore();

  useEffect(() => {
    if (!isAuthenticated) {
      redirect("/login");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    getMarkers(user.uid);
    console.log(markers);
  }, [getMarkers, user]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_APIKEY;

  return (
    <main className={classes.mainStyle}>
      <Map
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "90%" }}
        initialViewState={{
          latitude: 45.75208233358573,
          longitude: 4.839489220284681,
          zoom: 12,
        }}
        maxZoom={30}
        minZoom={3}
      >
        <GeolocateControl position="top-left" />
        {markers.map((marker, index) => {
          return (
            <Marker
              key={index}
              latitude={marker.latitude}
              longitude={marker.longitude}
              style={{
                backgroundColor: "#ff0000", // Couleur de fond rouge
                width: "20px", // Largeur du marqueur
                height: "20px", // Hauteur du marqueur, // Rendre le marqueur circulaire
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid #ffffff",
              }}
              onClick={() => {
                console.log(marker);
              }}
            />
          );
        })}
        <ModalCreateMarker />
      </Map>
    </main>
  );
}
