import { Vector2D } from "./Vector2D";

export interface Rectangle {
    x: number; // Center X
    y: number; // Center Y
    w: number; // Half-width
    h: number; // Half-height
}

export interface IQuadItem {
    pos: Vector2D;
    size: number;
    id: number;
}

export class QuadTree<T extends IQuadItem> {
    boundary: Rectangle;
    capacity: number;
    points: T[];
    divided: boolean;
    northeast?: QuadTree<T>;
    northwest?: QuadTree<T>;
    southeast?: QuadTree<T>;
    southwest?: QuadTree<T>;

    constructor(boundary: Rectangle, capacity: number) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    insert(point: T): boolean {
        if (!this.contains(this.boundary, point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            this.subdivide();
        }

        if (this.northeast!.insert(point)) return true;
        if (this.northwest!.insert(point)) return true;
        if (this.southeast!.insert(point)) return true;
        if (this.southwest!.insert(point)) return true;

        return false;
    }

    contains(rect: Rectangle, point: T): boolean {
        return (
            point.pos.x >= rect.x - rect.w &&
            point.pos.x <= rect.x + rect.w &&
            point.pos.y >= rect.y - rect.h &&
            point.pos.y <= rect.y + rect.h
        );
    }
    
    // Check intersection between two rectangles (for query)
    intersects(range: Rectangle, boundary: Rectangle): boolean {
        return !(
            range.x - range.w > boundary.x + boundary.w ||
            range.x + range.w < boundary.x - boundary.w ||
            range.y - range.h > boundary.y + boundary.h ||
            range.y + range.h < boundary.y - boundary.h
        );
    }

    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.w / 2;
        const h = this.boundary.h / 2;

        const ne = { x: x + w, y: y - h, w: w, h: h };
        this.northeast = new QuadTree<T>(ne, this.capacity);

        const nw = { x: x - w, y: y - h, w: w, h: h };
        this.northwest = new QuadTree<T>(nw, this.capacity);

        const se = { x: x + w, y: y + h, w: w, h: h };
        this.southeast = new QuadTree<T>(se, this.capacity);

        const sw = { x: x - w, y: y + h, w: w, h: h };
        this.southwest = new QuadTree<T>(sw, this.capacity);

        this.divided = true;
    }

    query(range: Rectangle, found?: T[]): T[] {
        if (!found) {
            found = [];
        }

        if (!this.intersects(range, this.boundary)) {
            return found;
        }

        for (const p of this.points) {
            if (
                p.pos.x >= range.x - range.w &&
                p.pos.x <= range.x + range.w &&
                p.pos.y >= range.y - range.h &&
                p.pos.y <= range.y + range.h
            ) {
                found.push(p);
            }
        }

        if (this.divided) {
            this.northwest!.query(range, found);
            this.northeast!.query(range, found);
            this.southwest!.query(range, found);
            this.southeast!.query(range, found);
        }

        return found;
    }
    
    clear() {
        this.points = [];
        this.divided = false;
        this.northeast = undefined;
        this.northwest = undefined;
        this.southeast = undefined;
        this.southwest = undefined;
    }
}