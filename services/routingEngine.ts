
import { Waypoint, Connection } from '../types_patrimonio';

export interface PathResult {
    path: [number, number][];
    distance: number;
}

export function findDetailedPath(
    startNodeId: string,
    endNodeId: string,
    waypoints: Waypoint[],
    connections: Connection[]
): PathResult {
    const graph: Record<string, Record<string, number>> = {};
    const waypointMap: Record<string, Waypoint> = {};

    waypoints.forEach(wp => {
        waypointMap[wp.id] = wp;
        graph[wp.id] = {};
    });

    const getDistance = (n1: Waypoint, n2: Waypoint) => {
        const dx = n1.coords[0] - n2.coords[0];
        const dy = n1.coords[1] - n2.coords[1];
        return Math.sqrt(dx * dx + dy * dy);
    };

    connections.forEach(conn => {
        const d = getDistance(waypointMap[conn.from], waypointMap[conn.to]);
        graph[conn.from][conn.to] = d;
        graph[conn.to][conn.from] = d; // Bidirectional
    });

    // Dijkstra's Algorithm
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const nodes = new Set<string>();

    waypoints.forEach(wp => {
        distances[wp.id] = Infinity;
        previous[wp.id] = null;
        nodes.add(wp.id);
    });

    distances[startNodeId] = 0;

    while (nodes.size > 0) {
        let smallestNode = Array.from(nodes).reduce((a, b) => distances[a] < distances[b] ? a : b);

        if (distances[smallestNode] === Infinity) break;
        if (smallestNode === endNodeId) break;

        nodes.delete(smallestNode);

        for (let neighbor in graph[smallestNode]) {
            let alt = distances[smallestNode] + graph[smallestNode][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = smallestNode;
            }
        }
    }

    const path: [number, number][] = [];
    let current: string | null = endNodeId;
    while (current) {
        path.unshift(waypointMap[current].coords);
        current = previous[current];
    }

    return {
        path,
        distance: distances[endNodeId]
    };
}
