import {Config as ViewConfig} from "./View/View";
import {Config as StoreConfig} from "./Store/Store";
import {Config as TextSelectionHandlerConfig} from "./View/EventHandler/TextSelectionHandler";

//Config 인터페이스 정의
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

//config=구성을 의미한다는거 참고
export interface Config extends ViewConfig, StoreConfig, TextSelectionHandlerConfig{
}


//Config의 디폴트값
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
