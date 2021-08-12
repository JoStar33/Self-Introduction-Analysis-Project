import {Base} from "../Infrastructure/Repository";
import {Store} from "./Store";
import {LabelCategory} from "./LabelCategory";

export namespace Label {
    export interface JSON {
        readonly id: number;
        readonly categoryId: number;
        readonly startIndex: number;
        readonly endIndex: number;
    }

    export class Entity {
        constructor(
            public readonly id: number | null,
            public readonly categoryId: number,
            private _startIndex: number,
            private _endIndex: number,
            private readonly root: Store
        ) {
        }

        get startIndex() {
            return this._startIndex;
        }

        get endIndex() {
            return this._endIndex;
        }

        move(offset: number) {
            this._startIndex += offset;
            this._endIndex += offset;
        }

        get category(): LabelCategory.Entity {
            return this.root.labelCategoryRepo.get(this.categoryId);
        }

        get json(): JSON {
            return {
                id: this.id!,
                categoryId: this.categoryId,
                startIndex: this.startIndex,
                endIndex: this.endIndex
            }
        }
    }

    export interface Config {
        readonly allowMultipleLabel: "notAllowed" | "differentCategory" | "allowed"
    }

    export class Repository extends Base.Repository<Entity> {
        constructor(private config: Config) {
            super();
        }

        set(key: number, value: Entity): this {
            if (!this.againstMultipleLabelWith(value)) {
                super.set(key, value);
            } else {
                console.warn("try set a label against the againstMultipleLabelWith rule!");
            }
            return this;
        }

        add(value: Label.Entity): number {
            if (!this.againstMultipleLabelWith(value)) {
                return super.add(value);
            } else {
                console.warn("try add a label against the againstMultipleLabelWith rule!");
            }
            return -1;
        }

        private againstMultipleLabelWith(other: Entity): boolean {
            const sameStartEndCheck = (entityA: Entity, entityB: Entity) => entityA.startIndex === entityB.startIndex && entityA.endIndex === entityB.endIndex;
            const sameFromToCategoryCheck = (entityA: Entity, entityB: Entity) => sameStartEndCheck(entityA, entityB) && entityA.categoryId == entityB.categoryId;
            const sameCheck = this.config.allowMultipleLabel === "notAllowed" ? sameStartEndCheck : sameFromToCategoryCheck;
            return Array.from(this.values()).some(it => sameCheck(it, other));
        }

        getEntitiesInRange(startIndex: number, endIndex: number): Array<Entity> {
            //index:line.startIndex, line.endIndex
            return Array.from(this.entities.values())
                .filter(entity => startIndex <= entity.startIndex && endIndex >= entity.startIndex/*&& entity.endIndex <= endIndex */);
        }

        getEntitiesCross(index: number): Array<Entity> {
            //label 요소 전체를 this.entities.values()로 가지고와서 조건에 맞는 요소를 가지고와서 던져준다.
            return Array.from(this.entities.values())
                .filter(entity => entity.startIndex <= index && index < entity.endIndex);
        }
    }

    export namespace Factory {
        export function create(json: JSON, root: Store): Entity {
            return new Entity(json.id, json.categoryId, json.startIndex, json.endIndex, root);
        }

        export function createAll(json: Array<JSON>, root: Store): Array<Entity> {
            return json.map(it => create(it, root));
        }
    }
}
