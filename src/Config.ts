import {Config as ViewConfig} from "./View/View";
import {Config as StoreConfig} from "./Store/Store";
import {Config as TextSelectionHandlerConfig} from "./View/EventHandler/TextSelectionHandler";

export interface ConfigInput {
    readonly contentClasses?: Array<string>;
    readonly labelClasses?: Array<string>;
    readonly connectionClasses?: Array<string>;
    readonly labelPadding?: number;
    readonly lineHeight?: number;
    readonly topContextMargin?: number;
    readonly bracketWidth?: number;
    readonly allowMultipleLabel?: "notAllowed" | "differentCategory" | "allowed";
    readonly labelWidthCalcMethod?: "max" | "label";
    readonly labelOpacity?: number;
    readonly selectingAreaStrip?: RegExp | null | undefined;
    readonly unconnectedLineStyle?: "none" | "straight" | "curve";
    readonly contentEditable?: boolean;
}

export interface Config extends ViewConfig, StoreConfig, TextSelectionHandlerConfig{
}

const defaultValues: Config = {
    contentClasses: ['poplar-annotation-content'],
    labelClasses: ['poplar-annotation-label'],
    labelPadding: 2,
    lineHeight: 1.5,
    topContextMargin: 3,
    bracketWidth: 8,
    allowMultipleLabel: "differentCategory",
    labelWidthCalcMethod: "max",
    labelOpacity: 90,
    defaultLabelColor: "#ff9d61",
    selectingAreaStrip: /[\n ]/,
    contentEditable: true
};

export function parseInput(input: ConfigInput): Config {
    let result = {};
    for (let entry in defaultValues) {
        // @ts-ignore
        result[entry] = input[entry] !== undefined ? input[entry] : defaultValues[entry];
    }
    return result as Config;
}
