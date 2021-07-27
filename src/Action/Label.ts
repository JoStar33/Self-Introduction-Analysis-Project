import {IAction} from "./IAction";
import {Store} from "../Store/Store";
import {Label as LabelModel} from "../Store/Label";

export namespace Label {
    export class CreateLabelAction implements IAction {
        constructor(
            public readonly categoryId: number,
            public readonly startIndex: number,
            public readonly endIndex: number) {
        }

        apply(store: Store) {
            if (store.content.slice(this.startIndex, this.endIndex).includes("\n")) {
                // todo: support this?
                throw Error("Insert label across hard line is not supported now! Please remove the \\n in content first!");
            }
            store.labelRepo.add(new LabelModel.Entity(null, this.categoryId, this.startIndex, this.endIndex, store));
        }
    }

    export function Create(categoryId: number, startIndex: number, endIndex: number) {
        return new CreateLabelAction(categoryId, startIndex, endIndex);
    }

    export class DeleteLabelAction implements IAction {
        constructor(public id: number) {
        }

        apply(store: Store) {
            store.labelRepo.delete(this.id);
        };
    }

    export function Delete(id: number) {
        return new DeleteLabelAction(id);
    }

    export class UpdateLabelAction implements IAction {
        constructor(public labelId: number, public categoryId: number) {
        }

        apply(store: Store) {
            const oldLabel = store.labelRepo.get(this.labelId);
            Delete(this.labelId).apply(store);
            store.labelRepo.add(new LabelModel.Entity(this.labelId, this.categoryId, oldLabel.startIndex, oldLabel.endIndex, store));
        }
    }

    export function Update(labelId: number, categoryId: number) {
        return new UpdateLabelAction(labelId, categoryId);
    }
}
