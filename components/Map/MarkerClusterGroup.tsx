
import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster';

const MarkerClusterGroup = createPathComponent(({ children: _c, ...props }, ctx) => {
    const instance = new L.MarkerClusterGroup({
        chunkedLoading: true,
        removeOutsideVisibleBounds: true,
        animate: true,
        ...props
    });

    return { instance, context: { ...ctx, layerContainer: instance } };
});

export default MarkerClusterGroup;
